from flask import Flask, render_template, request, jsonify, send_file
import pandas as pd
import numpy as np
import json
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsRegressor
from sklearn.ensemble import RandomForestClassifier
import os
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
from matplotlib.colors import LinearSegmentedColormap
from sklearn.manifold import TSNE
from sklearn.decomposition import PCA

app = Flask(__name__, static_folder='.', static_url_path='')

# Вспомогательные функции
def calculate_habitability_score(radius, temperature, density):
    # Параметры для оценки обитаемости (из оригинального script.js)
    habitability_params = {
        'radius': {
            'ideal': 1.0,  # Идеальное значение - как у Земли
            'range': 1.0,  # Допустимое отклонение
            'weight': 30   # Вес параметра в процентах
        },
        'temperature': {
            'ideal': 288,  # Средняя температура Земли в Кельвинах
            'range': 50,   # Допустимое отклонение в Кельвинах
            'weight': 40   # Вес параметра в процентах
        },
        'density': {
            'ideal': 5.51,  # Плотность Земли в г/см³
            'range': 2,     # Допустимое отклонение
            'weight': 30    # Вес параметра в процентах
        }
    }
    
    # Функция оценки параметра по отклонению от идеального значения
    def evaluate_parameter(value, ideal, range_value):
        deviation = abs(value - ideal) / range_value
        return max(0, 100 - deviation * 100)
    
    # Оценка отдельных параметров
    radius_score = evaluate_parameter(radius, habitability_params['radius']['ideal'], habitability_params['radius']['range'])
    temp_score = evaluate_parameter(temperature, habitability_params['temperature']['ideal'], habitability_params['temperature']['range'])
    density_score = evaluate_parameter(density, habitability_params['density']['ideal'], habitability_params['density']['range'])
    
    # Взвешенный итоговый балл
    total_score = (
        radius_score * habitability_params['radius']['weight'] +
        temp_score * habitability_params['temperature']['weight'] +
        density_score * habitability_params['density']['weight']
    ) / 100
    
    return round(total_score)

# Загрузка датасетов
def load_datasets():
    # Загрузка датасетов экзопланет
    confirmed_exoplanets = pd.read_csv('data/cleaned_confirmed_exoplanets.csv')
    habitable_worlds = pd.read_csv('data/cleaned_hwc_data.csv')
    
    # Создаем датасет для интерфейса из CSV файлов вместо JSON
    # Выбираем нужные колонки из confirmed_exoplanets
    interface_planets = []
    
    # Добавляем данные из датасета подтвержденных экзопланет
    for _, planet in confirmed_exoplanets.iterrows():
        if not pd.isna(planet['pl_name']) and not pd.isna(planet['pl_radius_earth']) and not pd.isna(planet['pl_eqt']):
            # Вычисляем примерную плотность
            radius = planet['pl_radius_earth']
            temp = planet['pl_eqt']
            
            # Всегда вычисляем плотность на основе радиуса, так как столбца pl_dens может не быть
            # Примерно оцениваем плотность на основе радиуса
            if radius < 1.5:  # Скалистые планеты
                density = 5.0
            elif radius < 3:  # Суперземли/мининептуны
                density = 3.0
            else:  # Газовые гиганты
                density = 1.0
            
            # Расчет индекса обитаемости
            habitability_score = calculate_habitability_score(radius, temp, density)
            
            # Добавляем описание в зависимости от обитаемости
            if habitability_score >= 80:
                description = "Высокий потенциал обитаемости. Находится в зоне Златовласки."
            elif habitability_score >= 60:
                description = "Средний потенциал обитаемости. Имеет некоторые благоприятные параметры."
            elif habitability_score >= 40:
                description = "Низкий потенциал обитаемости. Условия могут быть экстремальными."
            else:
                description = "Планета, вероятно, непригодна для жизни земного типа."
            
            interface_planets.append({
                'name': planet['pl_name'],
                'radius': radius,
                'temperature': temp,
                'density': density,
                'habitability': habitability_score,
                'description': description
            })
    
    # Добавляем данные из каталога потенциально обитаемых миров
    for _, planet in habitable_worlds.iterrows():
        if not pd.isna(planet['name']) and not pd.isna(planet['radius_re']) and not pd.isna(planet['tsurf_k']):
            radius = planet['radius_re']
            temp = planet['tsurf_k']
            density = 5.0  # Примерная плотность, если нет точных данных
            
            # Используем ESI как основу для оценки обитаемости
            if not pd.isna(planet['esi']):
                habitability_score = int(planet['esi'] * 100)
            else:
                habitability_score = calculate_habitability_score(radius, temp, density)
                
            interface_planets.append({
                'name': planet['name'],
                'radius': radius,
                'temperature': temp,
                'density': density,
                'habitability': habitability_score,
                'description': f"Экзопланета из каталога потенциально обитаемых миров. ESI: {planet['esi'] if not pd.isna(planet['esi']) else 'Н/Д'}"
            })
    
    return confirmed_exoplanets, habitable_worlds, interface_planets

# Подготовка моделей машинного обучения
def prepare_models(confirmed_exoplanets, habitable_worlds):
    # Проверка наличия нужных столбцов в данных
    required_columns_hw = ['radius_re', 'tsurf_k', 'mass_me', 'esi']
    for col in required_columns_hw:
        if col not in habitable_worlds.columns:
            # Если столбец отсутствует, создаем его с нулевыми значениями
            habitable_worlds[col] = 0
            print(f"Внимание: Столбец {col} отсутствует в датасете habitable_worlds, будут использованы значения по умолчанию")
    
    # Модель 1: Предсказание ESI (Earth Similarity Index) на основе параметров планеты
    # Выбираем признаки и целевую переменную из датасета habitable worlds
    features_esi = habitable_worlds[['radius_re', 'tsurf_k', 'mass_me']].fillna(0)
    target_esi = habitable_worlds['esi'].fillna(0)
    
    # Нормализация данных
    scaler_esi = StandardScaler()
    features_esi_scaled = scaler_esi.fit_transform(features_esi)
    
    # Обучение KNN регрессора для предсказания ESI
    knn_model = KNeighborsRegressor(n_neighbors=5)
    knn_model.fit(features_esi_scaled, target_esi)
    
    # Модель 2: Классификация потенциально обитаемых экзопланет
    # Создаем метку для потенциально обитаемых миров (ESI > 0.8 считаем высоким потенциалом)
    habitable_worlds['potentially_habitable'] = habitable_worlds['esi'] > 0.8
    
    # Выбираем признаки и целевую переменную
    features_class = habitable_worlds[['radius_re', 'tsurf_k', 'mass_me']].fillna(0)
    target_class = habitable_worlds['potentially_habitable']
    
    # Обучение классификатора случайного леса
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(features_class, target_class)
    
    return knn_model, rf_model, scaler_esi

# Загрузка данных и подготовка моделей
confirmed_exoplanets, habitable_worlds, exoplanets_json = load_datasets()
knn_model, rf_model, scaler_esi = prepare_models(confirmed_exoplanets, habitable_worlds)

# Маршруты Flask
@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/visualization')
def visualization():
    return app.send_static_file('visualization.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_planet():
    data = request.json
    
    # Получение данных из запроса
    name = data.get('name', 'Неизвестная планета')
    radius_earth = float(data.get('radius', 0))  # Радиус в радиусах Земли
    temperature_k = float(data.get('temperature', 0))  # Температура в Кельвинах
    density_g_cm3 = float(data.get('density', 0))  # Плотность в г/см³
    
    # Преобразование плотности в примерную массу (в массах Земли)
    # Масса ∝ Плотность * Радиус³
    # Учитывая, что плотность Земли примерно 5.51 г/см³
    earth_density = 5.51  # г/см³
    mass_earth = (density_g_cm3 / earth_density) * (radius_earth ** 3)
    
    # Предсказание индекса схожести с Землей (ESI)
    features = np.array([[radius_earth, temperature_k, mass_earth]])
    features_scaled = scaler_esi.transform(features)
    predicted_esi = knn_model.predict(features_scaled)[0]
    
    # Предсказание потенциальной обитаемости
    habitable_prob = rf_model.predict_proba(features)[:, 1][0]
    is_habitable = rf_model.predict(features)[0]
    
    # Поиск похожих планет на основе обоих датасетов
    similar_planets = find_similar_planets(radius_earth, temperature_k, density_g_cm3, 
                                          confirmed_exoplanets, habitable_worlds)
    
    # Расчет индекса обитаемости по оригинальной методике из script.js
    habitability_score = calculate_habitability_score(radius_earth, temperature_k, density_g_cm3)
    
    # Формирование ответа
    response = {
        'name': name,
        'radius': radius_earth,
        'temperature': temperature_k,
        'density': density_g_cm3,
        'mass_earth': round(mass_earth, 2),
        'predicted_esi': round(predicted_esi, 2),
        'habitability_probability': round(habitable_prob * 100, 2),
        'is_potentially_habitable': bool(is_habitable),
        'habitability_score': habitability_score,
        'similar_planets': similar_planets,
        'assessment': get_assessment(predicted_esi, habitability_score)
    }
    
    return jsonify(response)

@app.route('/api/exoplanets', methods=['GET'])
def get_exoplanets():
    # Возвращаем список экзопланет из интерфейсного датасета
    _, _, interface_planets = load_datasets()
    return jsonify(interface_planets)

@app.route('/api/dataset/confirmed', methods=['GET'])
def get_confirmed_exoplanets():
    # Для пагинации
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    # Отфильтрованные данные
    filtered_data = confirmed_exoplanets.iloc[(page-1)*per_page:page*per_page]
    
    # Преобразуем в список словарей для JSON
    planets_list = filtered_data.to_dict(orient='records')
    
    return jsonify({
        'data': planets_list,
        'total': len(confirmed_exoplanets),
        'page': page,
        'per_page': per_page,
        'total_pages': (len(confirmed_exoplanets) // per_page) + 1
    })

@app.route('/api/dataset/habitable', methods=['GET'])
def get_habitable_worlds():
    # Возвращаем данные из каталога потенциально обитаемых миров
    habitable_list = habitable_worlds.to_dict(orient='records')
    return jsonify(habitable_list)

# API-эндпоинты для визуализации данных

@app.route('/api/visualization/parameter-distribution', methods=['GET'])
def get_parameter_distribution():
    """
    Возвращает данные для построения графиков распределения параметров экзопланет:
    - Распределение по радиусу
    - Распределение по температуре
    - Распределение по плотности
    - Распределение по индексу обитаемости
    """
    # Получаем данные из датасетов
    confirmed_data = []
    for _, planet in confirmed_exoplanets.iterrows():
        if not pd.isna(planet['pl_name']) and not pd.isna(planet['pl_radius_earth']) and not pd.isna(planet['pl_eqt']):
            radius = planet['pl_radius_earth']
            temp = planet['pl_eqt']
            
            # Вычисляем примерную плотность на основе радиуса
            if radius < 1.5:  # Скалистые планеты
                density = 5.0
            elif radius < 3:  # Суперземли/мининептуны
                density = 3.0
            else:  # Газовые гиганты
                density = 1.0
            
            # Расчет индекса обитаемости
            habitability_score = calculate_habitability_score(radius, temp, density)
            
            confirmed_data.append({
                'name': planet['pl_name'],
                'radius': radius,
                'temperature': temp,
                'density': density,
                'habitability': habitability_score,
                'dataset': 'NASA Confirmed'
            })
    
    habitable_data = []
    for _, planet in habitable_worlds.iterrows():
        if not pd.isna(planet['name']) and not pd.isna(planet['radius_re']) and not pd.isna(planet['tsurf_k']):
            radius = planet['radius_re']
            temp = planet['tsurf_k']
            density = 5.0  # Примерная плотность для потенциально обитаемых миров
            
            # Используем ESI как основу для оценки обитаемости
            if not pd.isna(planet['esi']):
                habitability_score = int(planet['esi'] * 100)
            else:
                habitability_score = calculate_habitability_score(radius, temp, density)
                
            habitable_data.append({
                'name': planet['name'],
                'radius': radius,
                'temperature': temp,
                'density': density,
                'habitability': habitability_score,
                'dataset': 'Habitable Worlds Catalog'
            })
    
    # Объединяем данные
    all_data = confirmed_data + habitable_data
    
    # Формируем статистические данные для каждого параметра
    stats = {
        'radius': {
            'min': min([p['radius'] for p in all_data]),
            'max': max([p['radius'] for p in all_data]),
            'mean': sum([p['radius'] for p in all_data]) / len(all_data),
            'earth_value': 1.0
        },
        'temperature': {
            'min': min([p['temperature'] for p in all_data]),
            'max': max([p['temperature'] for p in all_data]),
            'mean': sum([p['temperature'] for p in all_data]) / len(all_data),
            'earth_value': 288
        },
        'density': {
            'min': min([p['density'] for p in all_data]),
            'max': max([p['density'] for p in all_data]),
            'mean': sum([p['density'] for p in all_data]) / len(all_data),
            'earth_value': 5.51
        },
        'habitability': {
            'min': min([p['habitability'] for p in all_data]),
            'max': max([p['habitability'] for p in all_data]),
            'mean': sum([p['habitability'] for p in all_data]) / len(all_data),
            'earth_value': 100
        }
    }
    
    # Формируем бины для гистограмм
    bins = {
        'radius': np.histogram([p['radius'] for p in all_data], bins=20),
        'temperature': np.histogram([p['temperature'] for p in all_data], bins=20),
        'density': np.histogram([p['density'] for p in all_data], bins=20),
        'habitability': np.histogram([p['habitability'] for p in all_data], bins=20)
    }
    
    # Преобразуем bins в JSON-совместимый формат
    histogram_data = {}
    for param, (counts, bin_edges) in bins.items():
        histogram_data[param] = {
            'counts': counts.tolist(),
            'bin_edges': bin_edges.tolist()
        }
    
    return jsonify({
        'parameters': ['radius', 'temperature', 'density', 'habitability'],
        'all_data': all_data,
        'stats': stats,
        'histogram_data': histogram_data
    })

@app.route('/api/visualization/exoplanet-comparison-map', methods=['GET'])
def get_exoplanet_comparison_map():
    """
    Возвращает данные для построения карты сравнения экзопланет.
    Использует t-SNE или PCA для снижения размерности и визуализации экзопланет в 2D-пространстве.
    """
    # Собираем данные для визуализации
    planet_data = []
    
    # Из подтвержденных экзопланет
    for _, planet in confirmed_exoplanets.iterrows():
        if not pd.isna(planet['pl_name']) and not pd.isna(planet['pl_radius_earth']) and not pd.isna(planet['pl_eqt']):
            radius = planet['pl_radius_earth']
            temp = planet['pl_eqt']
            
            # Вычисляем примерную плотность
            if radius < 1.5:  # Скалистые планеты
                density = 5.0
            elif radius < 3:  # Суперземли/мининептуны
                density = 3.0
            else:  # Газовые гиганты
                density = 1.0
            
            # Вычисляем примерную массу
            earth_density = 5.51
            mass = (density / earth_density) * (radius ** 3)
            
            # Расчет индекса обитаемости
            habitability_score = calculate_habitability_score(radius, temp, density)
            
            planet_data.append({
                'name': planet['pl_name'],
                'radius': radius,
                'temperature': temp,
                'density': density,
                'mass': mass,
                'habitability': habitability_score,
                'dataset': 'NASA Confirmed'
            })
    
    # Из каталога потенциально обитаемых миров
    for _, planet in habitable_worlds.iterrows():
        if not pd.isna(planet['name']) and not pd.isna(planet['radius_re']) and not pd.isna(planet['tsurf_k']):
            radius = planet['radius_re']
            temp = planet['tsurf_k']
            density = 5.0
            
            # Вычисляем примерную массу
            earth_density = 5.51
            mass = (density / earth_density) * (radius ** 3)
            
            # Используем ESI как основу для оценки обитаемости
            if not pd.isna(planet['esi']):
                habitability_score = int(planet['esi'] * 100)
            else:
                habitability_score = calculate_habitability_score(radius, temp, density)
                
            planet_data.append({
                'name': planet['name'],
                'radius': radius,
                'temperature': temp,
                'density': density,
                'mass': mass,
                'habitability': habitability_score,
                'dataset': 'Habitable Worlds Catalog'
            })
    
    # Добавляем Землю для сравнения
    planet_data.append({
        'name': 'Земля',
        'radius': 1.0,
        'temperature': 288,
        'density': 5.51,
        'mass': 1.0,
        'habitability': 100,
        'dataset': 'Солнечная система'
    })
    
    # Создаем DataFrame для снижения размерности
    df = pd.DataFrame(planet_data)
    
    # Выбираем числовые признаки для анализа
    features = df[['radius', 'temperature', 'density', 'mass', 'habitability']].values
    
    # Нормализация данных
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)
    
    # Снижение размерности с помощью PCA
    pca = PCA(n_components=2)
    pca_result = pca.fit_transform(features_scaled)
    
    # Добавляем результаты PCA в исходные данные
    for i, planet in enumerate(planet_data):
        planet['x'] = float(pca_result[i, 0])
        planet['y'] = float(pca_result[i, 1])
    
    # Добавляем цветовую шкалу для обитаемости
    habitability_colors = []
    for planet in planet_data:
        score = planet['habitability']
        if score >= 80:
            color = "#00FF00"  # Зеленый - высокая обитаемость
        elif score >= 60:
            color = "#ADFF2F"  # Желто-зеленый - средняя обитаемость
        elif score >= 40:
            color = "#FFFF00"  # Желтый - низкая обитаемость
        elif score >= 20:
            color = "#FFA500"  # Оранжевый - очень низкая обитаемость
        else:
            color = "#FF0000"  # Красный - непригодна для жизни
        
        planet['color'] = color
        habitability_colors.append(color)
    
    return jsonify({
        'planets': planet_data,
        'explained_variance': pca.explained_variance_ratio_.tolist(),
        'earth_coordinates': next((p for p in planet_data if p['name'] == 'Земля'), None)
    })

@app.route('/api/planet/compare', methods=['POST'])
def compare_planet_with_known():
    """
    Сравнивает заданную планету с известными экзопланетами и возвращает данные для визуализации.
    """
    data = request.json
    
    # Получение данных из запроса
    name = data.get('name', 'Пользовательская планета')
    radius_earth = float(data.get('radius', 0))
    temperature_k = float(data.get('temperature', 0))
    density_g_cm3 = float(data.get('density', 0))
    
    # Создаем данные для сравнения
    user_planet = {
        'name': name,
        'radius': radius_earth,
        'temperature': temperature_k,
        'density': density_g_cm3,
        'habitability': calculate_habitability_score(radius_earth, temperature_k, density_g_cm3),
        'is_user_planet': True
    }
    
    # Находим похожие планеты
    similar_planets = find_similar_planets(radius_earth, temperature_k, density_g_cm3, 
                                         confirmed_exoplanets, habitable_worlds)
    
    # Добавляем Землю для сравнения
    earth = {
        'name': 'Земля',
        'radius': 1.0,
        'temperature': 288,
        'density': 5.51,
        'habitability': 100,
        'similarity_percentage': calculate_similarity_to_earth(radius_earth, temperature_k, density_g_cm3),
        'is_reference': True
    }
    
    # Формируем данные для лепестковой диаграммы (radar chart)
    radar_data = {
        'labels': ['Радиус', 'Температура', 'Плотность', 'Обитаемость'],
        'datasets': [
            {
                'label': user_planet['name'],
                'data': normalized_radar_values(user_planet),
                'is_user_planet': True
            },
            {
                'label': 'Земля',
                'data': normalized_radar_values(earth),
                'is_reference': True
            }
        ]
    }
    
    # Добавляем до 3 похожих планет в набор данных для диаграммы
    for idx, planet in enumerate(similar_planets[:3]):
        radar_data['datasets'].append({
            'label': planet['name'],
            'data': normalized_radar_values({
                'radius': planet['radius'],
                'temperature': planet['temperature'],
                'density': 5.0 if 'density' not in planet else planet['density'],
                'habitability': calculate_habitability_score(
                    planet['radius'], 
                    planet['temperature'], 
                    5.0 if 'density' not in planet else planet['density']
                )
            }),
            'similarity_percentage': planet['similarity_percentage']
        })
    
    # Формируем данные для гистограммы сравнения
    bar_data = {
        'labels': ['Радиус', 'Температура', 'Плотность', 'Обитаемость'],
        'datasets': [
            {
                'label': user_planet['name'],
                'data': [
                    user_planet['radius'],
                    user_planet['temperature'],
                    user_planet['density'],
                    user_planet['habitability']
                ]
            },
            {
                'label': 'Земля',
                'data': [1.0, 288, 5.51, 100]
            }
        ]
    }
    
    return jsonify({
        'user_planet': user_planet,
        'earth': earth,
        'similar_planets': similar_planets,
        'radar_data': radar_data,
        'bar_data': bar_data
    })

# Вспомогательные функции для визуализации

def normalized_radar_values(planet):
    """
    Нормализует значения параметров планеты для лепестковой диаграммы.
    Все значения приводятся к шкале от 0 до 1, где 1 - идеальное значение (как у Земли).
    """
    # Идеальные значения (Земля)
    ideal_radius = 1.0
    ideal_temp = 288
    ideal_density = 5.51
    
    # Диапазоны для нормализации
    radius_range = 2.0    # ±2 радиуса Земли
    temp_range = 100      # ±100K от земной температуры
    density_range = 3.0   # ±3 г/см³ от плотности Земли
    
    # Нормализация значений
    norm_radius = max(0, 1 - abs(planet['radius'] - ideal_radius) / radius_range)
    norm_temp = max(0, 1 - abs(planet['temperature'] - ideal_temp) / temp_range)
    norm_density = max(0, 1 - abs(planet['density'] - ideal_density) / density_range)
    norm_habitability = planet['habitability'] / 100  # Индекс обитаемости уже в шкале 0-100
    
    return [norm_radius, norm_temp, norm_density, norm_habitability]

def calculate_similarity_to_earth(radius, temperature, density):
    """
    Рассчитывает процент сходства планеты с Землей на основе ее параметров.
    """
    # Идеальные значения (Земля)
    ideal_radius = 1.0
    ideal_temp = 288
    ideal_density = 5.51
    
    # Весовые коэффициенты
    radius_weight = 0.3
    temp_weight = 0.4
    density_weight = 0.3
    
    # Расчет отклонений
    r_diff = abs(radius - ideal_radius) / ideal_radius if ideal_radius > 0 else 1
    t_diff = abs(temperature - ideal_temp) / ideal_temp if ideal_temp > 0 else 1
    d_diff = abs(density - ideal_density) / ideal_density if ideal_density > 0 else 1
    
    # Взвешенное отклонение
    weighted_diff = (
        r_diff * radius_weight + 
        t_diff * temp_weight + 
        d_diff * density_weight
    )
    
    # Конвертация в процент сходства (0-100%)
    similarity = max(0, 100 - weighted_diff * 100)
    
    return min(round(similarity, 2), 99.99)  # Ограничиваем максимальное сходство

# Вспомогательные функции
def find_similar_planets(radius, temperature, density, confirmed_df, habitable_df):
    # Проверка наличия нужных столбцов
    required_confirmed = ['pl_name', 'pl_radius_earth', 'pl_eqt']
    for col in required_confirmed:
        if col not in confirmed_df.columns:
            print(f"Внимание: Столбец {col} отсутствует в датасете confirmed_exoplanets. Поиск похожих планет может работать некорректно.")
    
    required_habitable = ['name', 'radius_re', 'tsurf_k', 'esi']
    for col in required_habitable:
        if col not in habitable_df.columns:
            print(f"Внимание: Столбец {col} отсутствует в датасете habitable_worlds. Поиск похожих планет может работать некорректно.")
    
    # Нормализация параметров для поиска
    radius_weight = 0.3
    temp_weight = 0.4
    density_weight = 0.3
    
    # Создаем таблицу планет из обоих датасетов
    all_planets = []
    
    # Из подтвержденных экзопланет
    for _, planet in confirmed_df.iterrows():
        if 'pl_radius_earth' in confirmed_df.columns and 'pl_eqt' in confirmed_df.columns and 'pl_name' in confirmed_df.columns:
            if not pd.isna(planet['pl_radius_earth']) and not pd.isna(planet['pl_eqt']):
                # Вычисляем приблизительную плотность, если это возможно
                planet_radius = planet['pl_radius_earth']
                planet_temp = planet['pl_eqt'] if not pd.isna(planet['pl_eqt']) else 0
                
                # Пропускаем записи с некорректными данными
                if planet_radius <= 0 or planet_temp <= 0:
                    continue
                    
                # Расчет расстояния как меры сходства (взвешенное евклидово расстояние)
                r_diff = abs(planet_radius - radius) / radius if radius > 0 else 1
                t_diff = abs(planet_temp - temperature) / temperature if temperature > 0 else 1
                
                # Общее расстояние
                distance = np.sqrt(
                    (r_diff ** 2) * radius_weight + 
                    (t_diff ** 2) * temp_weight
                )
                
                all_planets.append({
                    'name': planet['pl_name'],
                    'radius': planet_radius,
                    'temperature': planet_temp,
                    'distance': distance,
                    'source': 'NASA Confirmed Exoplanets'
                })
    
    # Из каталога потенциально обитаемых миров
    for _, planet in habitable_df.iterrows():
        if 'radius_re' in habitable_df.columns and 'tsurf_k' in habitable_df.columns and 'name' in habitable_df.columns:
            if not pd.isna(planet['radius_re']) and not pd.isna(planet['tsurf_k']) and not pd.isna(planet['name']):
                planet_radius = planet['radius_re']
                planet_temp = planet['tsurf_k']
                
                # Расчет расстояния
                r_diff = abs(planet_radius - radius) / radius if radius > 0 else 1
                t_diff = abs(planet_temp - temperature) / temperature if temperature > 0 else 1
                
                distance = np.sqrt(
                    (r_diff ** 2) * radius_weight + 
                    (t_diff ** 2) * temp_weight
                )
                
                esi_value = planet['esi'] if 'esi' in habitable_df.columns and not pd.isna(planet['esi']) else "Н/Д"
                
                all_planets.append({
                    'name': planet['name'],
                    'radius': planet_radius,
                    'temperature': planet_temp,
                    'esi': esi_value,
                    'distance': distance,
                    'source': 'Habitable Worlds Catalog'
                })
    
    # Сортировка по сходству и выбор 5 наиболее похожих
    all_planets.sort(key=lambda x: x['distance'])
    
    # Добавляем процент сходства
    for planet in all_planets:
        similarity = max(0, 100 - planet['distance'] * 100)
        planet['similarity_percentage'] = min(round(similarity, 2), 99.99)  # Ограничиваем максимальное сходство
        
    return all_planets[:5]

def get_assessment(esi, habitability_score):
    # Интерпретация на основе индекса ESI и habitability_score
    assessment = ""
    
    # Основная интерпретация на основе habitability_score
    if habitability_score >= 80:
        assessment = "Высокий потенциал обитаемости. Планета имеет характеристики, близкие к земным, и находится в 'зоне Златовласки'."
    elif habitability_score >= 60:
        assessment = "Средний потенциал обитаемости. Планета имеет некоторые характеристики, благоприятные для жизни."
    elif habitability_score >= 40:
        assessment = "Низкий потенциал обитаемости. Условия на планете могут быть экстремальными для земных форм жизни."
    elif habitability_score >= 20:
        assessment = "Очень низкий потенциал обитаемости. Планета, вероятно, непригодна для жизни земного типа."
    else:
        assessment = "Непригодна для жизни. Условия на планете крайне враждебны для любых известных форм жизни."
    
    # Дополнительная информация на основе ESI
    if esi > 0.8:
        assessment += f" Индекс подобия Земле (ESI) очень высокий ({esi:.2f}), что указывает на значительное сходство с Землей."
    elif esi > 0.6:
        assessment += f" Индекс подобия Земле (ESI) высокий ({esi:.2f}), что указывает на умеренное сходство с Землей."
    elif esi > 0.4:
        assessment += f" Индекс подобия Земле (ESI) средний ({esi:.2f})."
    else:
        assessment += f" Индекс подобия Земле (ESI) низкий ({esi:.2f}), планета значительно отличается от Земли."
    
    return assessment

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)