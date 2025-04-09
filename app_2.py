from flask import Flask, render_template, request, redirect, url_for
import numpy as np
import json
from datetime import datetime
import cProfile
import pstats
import io
import matplotlib.pyplot as plt
import base64
from io import BytesIO
import pandas as pd 
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, precision_score, f1_score
import plotly
import plotly.express as px
import plotly.graph_objects as go
from urllib.parse import quote
from datasets.nasa_exoplanet_api import NASAExoplanetAPI
import logging
import sys

app = Flask(__name__)

# Настройка логирования
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    handlers=[
                        logging.StreamHandler(sys.stdout),
                        logging.FileHandler('nasa_api.log')
                    ])
logger = logging.getLogger('app')

# Инициализация API NASA
nasa_api = NASAExoplanetAPI()

# Загрузка локальных датасетов
confirmed_exoplanets_df = pd.read_csv('datasets/cleaned_confirmed_exoplanets.csv')
habitable_planets_df = pd.read_csv('datasets/habitable_tidally_locked_planets.csv')

# Удаляем лишние пробелы в именах столбцов
confirmed_exoplanets_df.columns = confirmed_exoplanets_df.columns.str.strip()
habitable_planets_df.columns = habitable_planets_df.columns.str.strip()

# Создание целевой переменной
habitable_planets_df['is_habitable'] = 1  # Обитаемые планеты
confirmed_exoplanets_df['is_habitable'] = 0  # Необитаемые планеты

# Объединение данных
combined_df = pd.concat([confirmed_exoplanets_df, habitable_planets_df], ignore_index=True)

# Выбор признаков
features = combined_df[['pl_radius_earth', 'pl_eqt']]  # Используем радиус и эквивалентную температуру
target = combined_df['is_habitable']

# Разделение данных на обучающую и тестовую выборки
X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)

# Обучение модели
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Оценка модели
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred, zero_division=0))

# Константы и эталонные данные
KNOWN_PLANETS = {
    'Земля': {'radius': 1.0, 'density': 1.0, 'temperature': 288, 'esi': 1.0},
    'Марс': {'radius': 0.532, 'density': 0.71, 'temperature': 210, 'esi': 0.64},
    'Венера': {'radius': 0.949, 'density': 0.95, 'temperature': 737, 'esi': 0.44},
    'Меркурий': {'radius': 0.383, 'density': 0.98, 'temperature': 440, 'esi': 0.60},
}

# Добавляем данные из CSV в KNOWN_PLANETS
for index, row in confirmed_exoplanets_df.iterrows():
    KNOWN_PLANETS[row['pl_name']] = {
        'radius': row['pl_radius_earth'],  # Используем pl_radius_earth
        'temperature': row['pl_eqt'],  # Используем pl_eqt
        'esi': None  
    }

WEIGHTS = {'radius': 0.57, 'temperature': 0.43} 
EARTH_PARAMS = {'radius': 1.0, 'temperature': 288}

def calculate_esi(params, reference_params=EARTH_PARAMS, weights=WEIGHTS):
    esi = 1.0
    for key in params:
        if key in weights:
            xi = params[key]
            x0 = reference_params[key]
            wi = weights[key]
            esi *= (1 - abs(xi - x0) / (xi + x0)) ** (wi / len(weights))
    return esi

def analyze_planet(esi_value, params):
    # Расчет состава атмосферы на основе параметров планеты
    temp = params['temperature']
    radius = params['radius']
    
    # Динамический расчет состава атмосферы
    atmosphere_composition = calculate_atmosphere(temp, radius)
    
    # Расчет вероятности наличия воды
    water_probability = calculate_water_probability(temp, radius)
    
    # Расчет пригодности для различных форм жизни
    life_sustainability = calculate_life_sustainability(temp, radius, esi_value)
    
    # Сравнение с известными экзопланетами
    similar_planets = find_similar_planets(params)
    
    analysis = {
        'esi': round(esi_value, 4),
        'classification': get_classification(esi_value),
        'similarity_scores': calculate_similarity_scores(params),
        'nearest_known': find_nearest_known_planet(params),
        'habitability_factors': analyze_habitability_factors(params),
        'recommendations': generate_recommendations(params),
        'atmosphere_composition': atmosphere_composition,
        'water_probability': water_probability,
        'life_sustainability': life_sustainability,
        'similar_planets': similar_planets
    }
    return analysis

def calculate_atmosphere(temperature, radius):
    """Расчет состава атмосферы на основе температуры и радиуса"""
    # Базовые значения для Земли (288K)
    base_temp = 288
    
    # Корректировка на основе температуры
    temp_factor = temperature / base_temp
    
    # Корректировка на основе радиуса (гравитации)
    gravity_factor = radius / 1.0  # 1.0 - радиус Земли
    
    # Базовый состав атмосферы (как на Земле)
    nitrogen = 78 * gravity_factor * (1 / temp_factor)  # Азот более стабилен при низких температурах
    oxygen = 21 * gravity_factor * (1 / temp_factor**1.5)  # Кислород сильнее зависит от температуры
    argon = 0.93 * gravity_factor  # Инертный газ, меньше зависит от температуры
    co2 = 0.04 * temp_factor**2 * gravity_factor  # CO2 увеличивается с температурой
    
    # Дополнительные эффекты
    if temperature > 373:  # Выше точки кипения воды
        oxygen *= 0.5  # Меньше кислорода в горячих атмосферах
        co2 *= 2  # Больше CO2 в горячих атмосферах
    
    if temperature < 273:  # Ниже точки замерзания
        co2 *= 1.5  # Больше CO2 в холодных атмосферах
        oxygen *= 0.7  # Меньше кислорода в холодных атмосферах
    
    if radius < 0.5:  # Малая гравитация
        nitrogen *= 0.5  # Легкие газы улетучиваются
        oxygen *= 0.5
    
    # Нормализация, чтобы сумма была 100%
    total = nitrogen + oxygen + argon + co2
    
    return {
        'Nitrogen': round(nitrogen * 100 / total, 2),
        'Oxygen': round(oxygen * 100 / total, 2),
        'Argon': round(argon * 100 / total, 2),
        'Carbon Dioxide': round(co2 * 100 / total, 2)
    }

def calculate_water_probability(temperature, radius):
    """Расчет вероятности наличия жидкой воды"""
    # Идеальная температура для жидкой воды: 273-373K
    temp_factor = 1 - abs((temperature - 323) / 323)  # 323K = 50°C (середина диапазона)
    
    # Гравитация должна быть достаточной для удержания атмосферы
    gravity_factor = min(radius / 0.5, 1)  # Минимальный радиус 0.5 земного
    
    probability = temp_factor * gravity_factor * 100
    return max(0, min(100, probability))

def calculate_life_sustainability(temperature, radius, esi):
    """Расчет пригодности для различных форм жизни"""
    return {
        'Микроорганиз': calculate_sustainability_score(temperature, radius, 0.3),
        'Растения': calculate_sustainability_score(temperature, radius, 0.6),
        'Простые животные': calculate_sustainability_score(temperature, radius, 0.8),
        'Сложные формы жизни': calculate_sustainability_score(temperature, radius, 0.9)
    }

def calculate_sustainability_score(temperature, radius, threshold):
    """Расчет конкретного показателя пригодности"""
    temp_score = 1 - abs((temperature - 288) / 288)  # 288K = 15°C (земная температура)
    gravity_score = 1 - abs((radius - 1) / 1)  # Относительно земной гравитации
    
    score = (temp_score + gravity_score) / 2 * 100
    return max(0, min(100, score))

def find_similar_planets(params):
    """Поиск похожих известных экзопланет"""
    similar = []
    for name, planet in KNOWN_PLANETS.items():
        if 'radius' in planet and 'temperature' in planet:
            similarity = calculate_planet_similarity(params, planet)
            if similarity > 0.7:  # Порог схожести
                similar.append({
                    'name': name,
                    'similarity': round(similarity * 100, 2),
                    'params': planet
                })
    return sorted(similar, key=lambda x: x['similarity'], reverse=True)[:3]

def get_classification(esi):
    if esi >= 0.8:
        return {
            'level': 'high',
            'description': 'Планета потенциально обитаема',
            'color': '#2ecc71'
        }
    elif esi >= 0.5:
        return {
            'level': 'medium',
            'description': 'Планета умеренно похожа на Землю',
            'color': '#f1c40f'
        }
    else:
        return {
            'level': 'low',
            'description': 'Планета, скорее всего, необитаема',
            'color': '#e74c3c'
        }

def calculate_similarity_scores(params):
    scores = {}
    for param in params:
        if param in EARTH_PARAMS:
            similarity = (1 - abs(params[param] - EARTH_PARAMS[param]) / 
                         (params[param] + EARTH_PARAMS[param]))
            # Переводим названия параметров на русский
            param_names = {
                'radius': 'Радиус',
                'temperature': 'Температура',
                'gravity': 'Гравитация'
            }
            scores[param_names.get(param, param)] = round(similarity * 100, 2)
    return scores

def find_nearest_known_planet(params):
    min_diff = float('inf')
    nearest = None
    
    for planet, planet_params in KNOWN_PLANETS.items():
        diff = sum(abs(params[k] - planet_params[k]) for k in ['radius', 'temperature'])
        if diff < min_diff:
            min_diff = diff
            nearest = planet
    
    return nearest

def analyze_habitability_factors(params):
    factors = {}
    
    # Анализ температуры
    temp = params['temperature']
    if 273 <= temp <= 303:
        factors['Температура'] = 'Оптимальная для жизни'
    elif 240 <= temp <= 350:
        factors['Температура'] = 'Допустимая для некоторых форм жизни'
    else:
        factors['Температура'] = 'Неблагоприятная для известных форм жизни'
    
    # Анализ радиуса (гравитации)
    radius = params['radius']
    if 0.8 <= radius <= 1.2:
        factors['Гравитация'] = 'Близкая к земной'
    elif 0.5 <= radius <= 1.5:
        factors['Гравитация'] = 'Умеренная'
    else:
        factors['Гравитация'] = 'Значительно отличается от земной'
    
    return factors

def generate_recommendations(params):
    recommendations = []
    
    if params['temperature'] > 303:
        recommendations.append('Требуется охлаждение для обитаемости')
    elif params['temperature'] < 273:
        recommendations.append('Требуется нагрев для обитаемости')
        
    if params['radius'] < 0.8:
        recommendations.append('Низкая гравитация может затруднить удержание атмосферы')
    elif params['radius'] > 1.2:
        recommendations.append('Высокая гравитация может затруднить развитие жизни')
        
    return recommendations

def create_plot(params):
    # Создаем график
    fig, ax = plt.subplots()
    ax.bar(params.keys(), params.values())
    ax.set_ylabel('Значения')
    ax.set_title('Параметры планеты')

    # Сохраняем график в буфер
    buf = BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    plt.close(fig)

    # Кодируем график в base64
    return base64.b64encode(buf.getvalue()).decode('utf-8')

def create_analysis_charts(params, analysis):
    # График 1: Круговая диаграмма состава атмосферы
    atmosphere_data = {
        'Азот': analysis['atmosphere_composition']['Nitrogen'],
        'Кислород': analysis['atmosphere_composition']['Oxygen'],
        'Аргон': analysis['atmosphere_composition']['Argon'],
        'Углекислый газ': analysis['atmosphere_composition']['Carbon Dioxide']
    }
    fig1 = px.pie(
        values=list(atmosphere_data.values()),
        names=list(atmosphere_data.keys()),
        title='Состав атмосферы планеты'
    )
    chart1 = json.dumps(fig1, cls=plotly.utils.PlotlyJSONEncoder)

    # График 2: Столбчатая диаграмма сравнения с Землей
    comparison_data = pd.DataFrame({
        'Параметр': ['Радиус', 'Температура'],
        'Исследуемая планета': [params['radius'], params['temperature']],
        'Земля': [EARTH_PARAMS['radius'], EARTH_PARAMS['temperature']]
    })
    fig2 = px.bar(
        comparison_data, 
        x='Параметр', 
        y=['Исследуемая планета', 'Земля'], 
        barmode='group',
        title='Сравнение с параметрами Земли'
    )
    chart2 = json.dumps(fig2, cls=plotly.utils.PlotlyJSONEncoder)

    # График 3: Точечная диаграмма распределения планет
    planets_data = pd.DataFrame([
        {
            'Название': name,
            'Радиус': data['radius'],
            'Температура': data.get('temperature', 0),
            'Тип': 'Исследуемая планета' if name == 'Введенная планета' else 'Известная планета'
        }
        for name, data in {**KNOWN_PLANETS, 'Введенная планета': params}.items()
        if 'temperature' in data
    ])
    
    fig3 = px.scatter(
        planets_data,
        x='Радиус',
        y='Температура',
        color='Тип',
        hover_name='Название',
        title='Распределение планет по радиусу и температуре'
    )
    chart3 = json.dumps(fig3, cls=plotly.utils.PlotlyJSONEncoder)

    # График 4: Индикатор ESI
    fig4 = go.Figure(go.Indicator(
        mode = "gauge+number",
        value = analysis['esi'],
        title = {'text': "Индекс подобия Земле (ESI)"},
        gauge = {
            'axis': {'range': [0, 1]},
            'bar': {'color': analysis['classification']['color']},
            'steps': [
                {'range': [0, 0.5], 'color': "lightgray"},
                {'range': [0.5, 0.8], 'color': "gray"},
                {'range': [0.8, 1], 'color': "darkgray"}
            ]
        }
    ))
    chart4 = json.dumps(fig4, cls=plotly.utils.PlotlyJSONEncoder)

    return chart1, chart2, chart3, chart4

def calculate_planet_similarity(params1, params2):
    """Расчет схожести между двумя планетами"""
    if 'radius' not in params1 or 'temperature' not in params1 or \
       'radius' not in params2 or 'temperature' not in params2:
        return 0

    radius_sim = 1 - abs(params1['radius'] - params2['radius']) / (params1['radius'] + params2['radius'])
    temp_sim = 1 - abs(params1['temperature'] - params2['temperature']) / (params1['temperature'] + params2['temperature'])
    
    return (radius_sim + temp_sim) / 2

# Добавить функцию для генерации 3D модели планеты на основе параметров
def generate_planet_model(params):
    """Генерация 3D модели планеты на основе её параметров"""
    radius = params['radius']
    temperature = params['temperature']
    
    # Определение цвета и текстуры планеты
    if temperature > 700:  # Горячая планета
        texture = 'hot_planet.jpg'
        atmosphere_color = '#ff6b6b'
    elif temperature < 200:  # Холодная планета
        texture = 'ice_planet.jpg'
        atmosphere_color = '#74c0fc'
    else:  # Умеренная температура
        texture = 'mars.jpg'
        atmosphere_color = '#63e6be'
    
    return {
        'texture': texture,
        'atmosphere_color': atmosphere_color,
        'size': radius
    }

# @app.route('/models/<path:filename>')
# def models(filename):
#     return send_from_directory('models', filename)


PLANET_DESCRIPTIONS = {
    'Земля': {
        'description': 'Наша планета, эталон для сравнения',
        'color': '#2ecc71',
        'icon': '🌍'
    },
    'Марс': {
        'description': 'Красная планета, потенциально пригодная для колонизации',
        'color': '#e74c3c',
        'icon': '🔴'
    },
    'Венера': {
        'description': 'Планета с плотной атмосферой и парниковым эффектом',
        'color': '#f1c40f',
        'icon': '⭐'
    }
}

@app.route('/', methods=['GET', 'POST'])
def index():
    """Главная страница с калькулятором ESI"""
    # Получаем предзаполненные данные (если есть)
    prefill_name = request.args.get('prefill_name', '')
    prefill_radius = request.args.get('prefill_radius', '')
    prefill_temp = request.args.get('prefill_temp', '')
    prefill_density = request.args.get('prefill_density', '')
    
    show_results = False

    if request.method == 'POST':
        planet_name = request.form['planet_name']
        params = {
            'radius': float(request.form['radius']),
            'density': float(request.form['density']),
            'temperature': float(request.form['temperature'])
        }
        
        esi_value = calculate_esi(params)
        analysis = analyze_planet(esi_value, params)
        
        # Создаем графики
        chart1, chart2, chart3, chart4 = create_analysis_charts(params, analysis)
        
        show_results = True

        reference_data = {
            name: {
                'params': params,
                'info': PLANET_DESCRIPTIONS.get(name, {
                    'description': 'Известная экзопланета',
                    'color': '#3498db',
                    'icon': '🌟'
                })
            }
            for name, params in KNOWN_PLANETS.items()
        }
        
        stats = {
            'total_analyses': len(confirmed_exoplanets_df),
            'habitable_count': len(habitable_planets_df),
            'average_esi': round(confirmed_exoplanets_df['pl_esi'].mean() if 'pl_esi' in confirmed_exoplanets_df else 0.5, 2)
        }
        
        return render_template('index.html', 
                             planet_name=planet_name,
                             params=params,
                             analysis=analysis,
                             known_planets=KNOWN_PLANETS,
                             show_results=show_results,
                             charts={
                                 'chart1': chart1,
                                 'chart2': chart2,
                                 'chart3': chart3,
                                 'chart4': chart4
                             },
                             reference_data=reference_data,
                             total_analyses=stats['total_analyses'],
                             habitable_count=stats['habitable_count'],
                             average_esi=stats['average_esi'],
                             prefill_name=prefill_name,
                             prefill_radius=prefill_radius,
                             prefill_temp=prefill_temp,
                             prefill_density=prefill_density)
    
    return render_template('index.html', 
                         known_planets=KNOWN_PLANETS, 
                         show_results=show_results, 
                         charts=None,
                         prefill_name=prefill_name,
                         prefill_radius=prefill_radius,
                         prefill_temp=prefill_temp,
                         prefill_density=prefill_density,
                         total_analyses=len(confirmed_exoplanets_df),
                         habitable_count=len(habitable_planets_df),
                         average_esi=round(confirmed_exoplanets_df['pl_esi'].mean() if 'pl_esi' in confirmed_exoplanets_df else 0.5, 2),
                         total_exoplanets=len(confirmed_exoplanets_df))

def calculate_moon_probability(params):
    """Расчет вероятности наличия спутников"""
    radius = params['radius']
    
    # Базовая вероятность на основе размера планеты
    base_probability = min(radius * 50, 100)
    
    # Корректировка на основе других параметров
    if params['temperature'] > 600:
        base_probability *= 0.5  # Горячие планеты реже имеют спутники
    
    return min(base_probability, 100)

def calculate_magnetic_field(params):
    """Расчет характеристик магнитного поля планеты"""
    radius = params['radius']
    density = params['density']
    
    # Расчет примерной силы магнитного поля
    core_size = radius * 0.5  # Примерный размер ядра
    field_strength = core_size * density * 0.8
    
    return {
        'strength': field_strength,
        'has_field': field_strength > 0.3,
        'protection_level': min(field_strength * 100, 100)  # Уровень защиты от радиации
    }

# def predict_planet_future(params):
#     """Прогноз эволюции планеты"""
#     return {
#         'short_term': calculate_short_term_changes(params),
#         'long_term': calculate_long_term_changes(params),
#         'stability': calculate_orbital_stability(params),
#         'habitability_trend': predict_habitability_changes(params)
#     }

# def calculate_weather_patterns(params):
#     """Расчет возможных погодных явлений"""
#     return {
#         'storms': calculate_storm_probability(params),
#         'wind_speed': estimate_wind_speeds(params),
#         'precipitation': calculate_precipitation(params),
#         'seasonal_changes': estimate_seasons(params)
#     }

@app.route('/exoplanets')
def exoplanets():
    """Страница со списком экзопланет"""
    try:
        # Получаем параметры запроса
        name = request.args.get('name', '')
        radius_min = request.args.get('radius_min', '')
        radius_max = request.args.get('radius_max', '')
        temp_min = request.args.get('temp_min', '')
        temp_max = request.args.get('temp_max', '')
        page = int(request.args.get('page', 1))
        
        # Логирование параметров поиска
        logger.info(f"Поиск экзопланет: name={name}, radius_min={radius_min}, radius_max={radius_max}, temp_min={temp_min}, temp_max={temp_max}, page={page}")
        
        # Собираем фильтры в словарь
        filters = {}
        if name:
            filters['name'] = name
        if radius_min:
            filters['radius_min'] = float(radius_min)
        if radius_max:
            filters['radius_max'] = float(radius_max)
        if temp_min:
            filters['temp_min'] = float(temp_min)
        if temp_max:
            filters['temp_max'] = float(temp_max)
        
        # Логируем сформированные фильтры
        logger.info(f"Фильтры для API: {filters}")
        
        # Получаем данные из API
        all_exoplanets = nasa_api.get_exoplanets(filters)
        
        # Логируем результаты
        if all_exoplanets is None or all_exoplanets.empty:
            logger.warning("API вернул пустой результат")
            all_exoplanets = pd.DataFrame()
        else:
            logger.info(f"Получено {len(all_exoplanets)} экзопланет")
            # Проверяем доступные столбцы
            logger.info(f"Доступные столбцы: {all_exoplanets.columns.tolist()}")
        
        # Пагинация результатов
        items_per_page = 12
        total_items = len(all_exoplanets)
        total_pages = (total_items + items_per_page - 1) // items_per_page
        
        if page < 1:
            page = 1
        elif page > total_pages and total_pages > 0:
            page = total_pages
        
        start_idx = (page - 1) * items_per_page
        end_idx = start_idx + items_per_page
        
        # Делаем slice из DataFrame для пагинации
        if not all_exoplanets.empty:
            exoplanets = all_exoplanets.iloc[start_idx:end_idx]
        else:
            exoplanets = all_exoplanets
            
        # Получаем другие данные для отображения
        all_exoplanets = nasa_api.get_exoplanets()
        top_planets = all_exoplanets.sort_values('pl_radius_earth').head(5) if not all_exoplanets.empty else pd.DataFrame()
        
        # Методы обнаружения
        discovery_methods = []
        if 'discoverymethod' in all_exoplanets.columns and not all_exoplanets.empty:
            methods_count = all_exoplanets['discoverymethod'].value_counts()
            discovery_methods = [(method, count) for method, count in methods_count.items() if pd.notna(method)]
        
        # Логирование финальных данных для рендеринга
        logger.info(f"Отображаем {len(exoplanets)} экзопланет на странице {page} из {total_pages}")
        
        # Получение статистики для боковых панелей
        total_exoplanets = len(all_exoplanets)
        habitable_exoplanets = nasa_api.get_habitable_exoplanets()
        habitable_count = len(habitable_exoplanets) if habitable_exoplanets is not None and not habitable_exoplanets.empty else 0
        total_star_systems = len(all_exoplanets['hostname'].unique()) if not all_exoplanets.empty else 0
        
        # Преобразование текущей даты в нужный формат
        current_date = nasa_api.last_update
        
        return render_template(
            'exoplanets.html',
            exoplanets=exoplanets,
            name=name,
            radius_min=radius_min,
            radius_max=radius_max,
            temp_min=temp_min,
            temp_max=temp_max,
            page=page,
            total_pages=total_pages,
            top_planets=top_planets,
            total_exoplanets=total_exoplanets,
            total_star_systems=total_star_systems,
            habitable_count=habitable_count,
            discovery_methods=discovery_methods,
            last_update=current_date
        )
    except Exception as e:
        logger.error(f"Ошибка при обработке запроса /exoplanets: {str(e)}", exc_info=True)
        # В случае ошибки возвращаем пустую страницу с сообщением
        return render_template(
            'exoplanets.html',
            exoplanets=pd.DataFrame(),
            error_message=f"Произошла ошибка при загрузке данных: {str(e)}",
            name="", radius_min="", radius_max="", temp_min="", temp_max="",
            page=1, total_pages=1,
            top_planets=pd.DataFrame(),
            total_exoplanets=0,
            total_star_systems=0,
            habitable_count=0,
            discovery_methods=[],
            last_update="Обновление недоступно"
        )

@app.route('/exoplanet/<n>')
def exoplanet_detail(n):
    """Страница с детальной информацией о конкретной экзопланете"""
    # Получаем данные о планете из API
    all_exoplanets = nasa_api.get_exoplanets()
    
    # Проверяем, есть ли планета в датафрейме
    if all_exoplanets.empty or 'pl_name' not in all_exoplanets.columns or n not in all_exoplanets['pl_name'].values:
        return redirect(url_for('exoplanets'))
    
    planet_data = all_exoplanets[all_exoplanets['pl_name'] == n]
    planet = planet_data.iloc[0].to_dict()
    
    # Расчет ESI и анализ обитаемости
    params = {
        'radius': planet.get('pl_radius_earth', 1.0),
        'temperature': planet.get('pl_eqt', 288)
    }
    
    # Добавление плотности, если она доступна
    if 'pl_dens' in planet and pd.notna(planet['pl_dens']):
        params['density'] = planet['pl_dens']
    else:
        # Примерная плотность на основе радиуса (упрощенная модель)
        if params['radius'] <= 1.5:
            # Каменистая планета, похожая на Землю
            params['density'] = 1.0
        elif params['radius'] <= 3.0:
            # Суперземля или мини-Нептун
            params['density'] = 0.8
        else:
            # Газовый гигант
            params['density'] = 0.3
    
    esi = calculate_esi(params)
    classification = get_classification(esi)
    habitability_factors = analyze_habitability_factors(params)
    
    return render_template(
        'exoplanet_detail.html',
        planet=planet,
        esi=esi,
        classification=classification,
        habitability_factors=habitability_factors
    )

@app.route('/calculate-from-exoplanet', methods=['POST'])
def calculate_from_exoplanet():
    """Перенаправление на расчет ESI на основе данных экзопланеты"""
    name = request.form.get('name')
    radius = request.form.get('radius')
    temperature = request.form.get('temperature')
    density = request.form.get('density')
    
    # Перенаправление на основной маршрут с предзаполненными данными
    return redirect(url_for('index', 
                           prefill_name=name,
                           prefill_radius=radius,
                           prefill_temp=temperature,
                           prefill_density=density))

@app.route('/habitable-planets')
def habitable_planets():
    """Страница с потенциально обитаемыми экзопланетами"""
    try:
        # Получаем данные о потенциально обитаемых экзопланетах
        habitable_exoplanets = nasa_api.get_habitable_exoplanets()
        
        # Логируем результаты
        if habitable_exoplanets is None or habitable_exoplanets.empty:
            logger.warning("API вернул пустой результат для обитаемых планет")
            habitable_exoplanets = pd.DataFrame()
        else:
            logger.info(f"Получено {len(habitable_exoplanets)} потенциально обитаемых экзопланет")
            logger.info(f"Доступные столбцы: {habitable_exoplanets.columns.tolist()}")
        
        # Получение общих статистических данных
        all_exoplanets = nasa_api.get_exoplanets()
        total_exoplanets = len(all_exoplanets) if not all_exoplanets.empty else 0
        total_star_systems = len(all_exoplanets['hostname'].unique()) if not all_exoplanets.empty else 0
        habitable_count = len(habitable_exoplanets)
        
        # Подсчет типов потенциально обитаемых планет
        planet_types = {}
        if not habitable_exoplanets.empty and 'pl_radius_earth' in habitable_exoplanets.columns:
            planet_types = {
                'Землеподобные': len(habitable_exoplanets[habitable_exoplanets['pl_radius_earth'] < 1.5]),
                'Суперземли': len(habitable_exoplanets[(habitable_exoplanets['pl_radius_earth'] >= 1.5) & 
                                                       (habitable_exoplanets['pl_radius_earth'] < 2.5)]),
                'Мини-Нептуны': len(habitable_exoplanets[habitable_exoplanets['pl_radius_earth'] >= 2.5])
            }
        
        # Преобразование текущей даты
        current_date = nasa_api.last_update
        
        return render_template(
            'habitable_planets.html',
            habitable_planets=habitable_exoplanets,
            total_exoplanets=total_exoplanets,
            total_star_systems=total_star_systems,
            habitable_count=habitable_count,
            planet_types=planet_types,
            last_update=current_date
        )
    except Exception as e:
        logger.error(f"Ошибка при обработке запроса /habitable-planets: {str(e)}", exc_info=True)
        # В случае ошибки возвращаем пустую страницу с сообщением
        return render_template(
            'habitable_planets.html',
            habitable_planets=pd.DataFrame(),
            error_message=f"Произошла ошибка при загрузке данных: {str(e)}",
            total_exoplanets=0,
            total_star_systems=0,
            habitable_count=0,
            planet_types={},
            last_update="Обновление недоступно"
        )

if __name__ == '__main__':
    app.run(debug=True)