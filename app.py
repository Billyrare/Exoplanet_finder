from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
import json
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsRegressor
from sklearn.ensemble import RandomForestClassifier
import os
import requests
from datetime import datetime
from functools import lru_cache
from dotenv import load_dotenv

# Загружаем переменные окружения из .env файла
load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')

# Глобальные переменные для модели и токенизатора
translator_model = None
translator_tokenizer = None

def init_translator():
    """Инициализация модели и токенизатора для перевода"""
    global translator_model, translator_tokenizer
    
    print("Инициализация модели перевода...")
    try:
        # Загружаем модель и токенизатор
        model_name = "Helsinki-NLP/opus-mt-en-ru"
        translator_tokenizer = AutoTokenizer.from_pretrained(model_name)
        translator_model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        print("Модель перевода успешно загружена")
        return True
    except Exception as e:
        print(f"Ошибка при загрузке модели перевода: {str(e)}")
        return False

# Инициализируем модель при запуске приложения
if not init_translator():
    print("ВНИМАНИЕ: Модель перевода не загружена. Перевод будет недоступен.")

@lru_cache(maxsize=1000)
def translate_text(text, target_lang='ru'):
    """
    Переводит текст с использованием модели Hugging Face.
    Кэширует результаты для оптимизации.
    """
    try:
        if target_lang == 'en':
            return text

        global translator_model, translator_tokenizer
        
        # Проверяем, инициализирована ли модель
        if translator_model is None or translator_tokenizer is None:
            if not init_translator():
                print("Не удалось инициализировать модель перевода")
                return text

        print(f"Начинаем перевод текста длиной {len(text)} символов...")

        try:
            # Разбиваем текст на предложения для лучшего перевода
            sentences = text.split('. ')
            translated_sentences = []

            for sentence in sentences:
                if not sentence.strip():
                    continue
                    
                # Токенизация
                inputs = translator_tokenizer(sentence, return_tensors="pt", max_length=512, truncation=True)
                
                # Перевод
                with torch.no_grad():
                    translated = translator_model.generate(**inputs, max_length=512)
                
                # Декодирование результата
                translated_text = translator_tokenizer.decode(translated[0], skip_special_tokens=True)
                translated_sentences.append(translated_text)

            # Объединяем все предложения
            final_translation = '. '.join(translated_sentences)
            print(f"Успешный перевод. Результат: {final_translation[:100]}...")
            return final_translation

        except Exception as api_error:
            print(f"Ошибка при переводе: {str(api_error)}")
            print(f"Тип ошибки: {api_error.__class__.__name__}")
            return text
            
    except Exception as e:
        print(f"Общая ошибка перевода: {str(e)}")
        print(f"Тип ошибки: {e.__class__.__name__}")
        return text

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
    interface_planets = []
    
    # Добавляем данные из датасета подтвержденных экзопланет
    for _, planet in confirmed_exoplanets.iterrows():
        if not pd.isna(planet['pl_name']) and not pd.isna(planet['pl_radius_earth']) and not pd.isna(planet['pl_eqt']):
            # Вычисляем примерную плотность
            radius = planet['pl_radius_earth']
            temp = planet['pl_eqt']
            
            # Определяем тип планеты на основе радиуса
            if radius < 1.5:
                planet_type = "Землеподобная"
                density = 5.0
            elif radius < 2.5:
                planet_type = "Суперземля"
                density = 3.5
            elif radius < 4:
                planet_type = "Мини-Нептун"
                density = 2.0
            elif radius < 10:
                planet_type = "Нептун"
                density = 1.5
            else:
                planet_type = "Газовый гигант"
                density = 1.0
            
            # Расчет индекса обитаемости
            habitability_score = calculate_habitability_score(radius, temp, density)
            
            # Определяем потенциальную обитаемость
            potentially_habitable = (
                temp >= 200 and temp <= 350 and  # Температура в пределах обитаемой зоны
                radius <= 2.0 and  # Не слишком большая
                habitability_score >= 70  # Высокий индекс обитаемости
            )
            
            # Вычисляем ESI (Earth Similarity Index)
            # ESI = (1 - abs(1 - radius)/2) * (1 - abs(288 - temp)/288)
            esi = round((1 - abs(1 - radius)/2) * (1 - abs(288 - temp)/288), 2)
            
            interface_planets.append({
                'name': planet['pl_name'],
                'radius': radius,
                'temperature': temp,
                'density': density,
                'type': planet_type,
                'potentially_habitable': potentially_habitable,
                'esi': esi,
                'habitability_score': habitability_score,
                'star_type': planet['st_spectype'] if not pd.isna(planet['st_spectype']) else 'Неизвестно',
                'orbital_period': planet['pl_orbper'] if not pd.isna(planet['pl_orbper']) else None
            })
    
    # Добавляем данные из каталога потенциально обитаемых миров
    for _, planet in habitable_worlds.iterrows():
        if not pd.isna(planet['name']) and not pd.isna(planet['radius_re']) and not pd.isna(planet['tsurf_k']):
            # Проверяем, не добавлена ли уже эта планета
            if not any(p['name'] == planet['name'] for p in interface_planets):
                radius = planet['radius_re']
                temp = planet['tsurf_k']
                
                # Используем тип планеты из датасета или вычисляем
                planet_type = planet['type'].split()[-1] if not pd.isna(planet['type']) else (
                    "Землеподобная" if radius < 1.5 else
                    "Суперземля" if radius < 2.5 else
                    "Мини-Нептун"
                )
                
                # Используем ESI из датасета
                esi = float(planet['esi']) if not pd.isna(planet['esi']) else 0.0
                
                # Определяем плотность на основе типа
                if "Terran" in planet['type']:
                    density = 5.0
                elif "Superterran" in planet['type']:
                    density = 3.5
                else:
                    density = 2.0
                
                interface_planets.append({
                    'name': planet['name'],
                    'radius': radius,
                    'temperature': temp,
                    'density': density,
                    'type': planet_type,
                    'potentially_habitable': esi >= 0.8,
                    'esi': esi,
                    'habitability_score': int(esi * 100),
                    'star_type': planet['type'].split()[0] if not pd.isna(planet['type']) else 'Неизвестно',
                    'orbital_period': planet['period_days'] if not pd.isna(planet['period_days']) else None,
                    'distance_ly': planet['distance_ly'] if not pd.isna(planet['distance_ly']) else None,
                    'age_gy': planet['age_gy'] if not pd.isna(planet['age_gy']) else None
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

# Добавляем конфигурацию NASA API
NASA_API_KEY = 'saVWS1h87SYncOcqjgMxZsPDSznkfHMZhnznvs1s'  # Используем демо-ключ для тестирования

# Маршруты Flask
@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/about.html')
def about():
    return app.send_static_file('about.html')

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

# Обновляем маршрут APOD
@app.route('/api/nasa/apod')
def get_nasa_apod():
    try:
        print("\n=== New request to APOD API ===")
        date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        print(f"Requested parameters: date={date}")
        
        # Проверяем валидность даты
        try:
            datetime.strptime(date, '%Y-%m-%d')
        except ValueError:
            return jsonify({
                'error': 'Invalid date format. Use YYYY-MM-DD format'
            }), 400
            
        # Делаем запрос к NASA API
        print("Sending request to NASA API...")
        response = requests.get('https://api.nasa.gov/planetary/apod', params={
            'api_key': NASA_API_KEY,
            'date': date
        })
        
        # Проверяем статус ответа
        if response.status_code != 200:
            error_msg = response.json().get('error', {}).get('message', 'Unknown error')
            return jsonify({
                'error': f'NASA API Error: {error_msg}',
                'status_code': response.status_code
            }), response.status_code

        data = response.json()
        print("Sending response to client")
        return jsonify(data)
        
    except requests.exceptions.RequestException as e:
        print(f"Request error: {str(e)}")
        return jsonify({
            'error': 'Error getting data from NASA API',
            'details': str(e)
        }), 500
    except Exception as e:
        print(f"General error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)