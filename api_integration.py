"""
Модуль интеграции для объединения базовой функциональности анализа экзопланет
из app.py и расширенных возможностей из app_2.py.
"""

from flask import Blueprint, request, jsonify
import numpy as np
import pandas as pd

# Константы для расчетов
WEIGHTS = {'radius': 0.57, 'temperature': 0.43} 
EARTH_PARAMS = {'radius': 1.0, 'temperature': 288}

api_integration = Blueprint('api_integration', __name__)

# Функции из app_2.py
def calculate_esi(params, reference_params=EARTH_PARAMS, weights=WEIGHTS):
    """Расчет индекса схожести с Землей (Earth Similarity Index)"""
    esi = 1.0
    for key in params:
        if key in weights:
            xi = params[key]
            x0 = reference_params[key]
            wi = weights[key]
            esi *= (1 - abs(xi - x0) / (xi + x0)) ** (wi / len(weights))
    return esi

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
        'Микроорганизмы': calculate_sustainability_score(temperature, radius, 0.3),
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

def get_classification(esi):
    """Классификация планеты на основе ESI"""
    if esi >= 0.9:
        return {
            'category': 'Earth-like',
            'description': 'Высокая потенциальная обитаемость, схожа с Землей',
            'color': '#2ecc71'
        }
    elif esi >= 0.8:
        return {
            'category': 'Super-habitable',
            'description': 'Потенциально более обитаема, чем Земля',
            'color': '#27ae60'
        }
    elif esi >= 0.6:
        return {
            'category': 'Water World',
            'description': 'Возможно наличие жидкой воды',
            'color': '#3498db'
        }
    elif esi >= 0.4:
        return {
            'category': 'Marginal',
            'description': 'Ограниченная обитаемость',
            'color': '#f39c12'
        }
    else:
        return {
            'category': 'Non-habitable',
            'description': 'Непригодна для жизни',
            'color': '#e74c3c'
        }

def analyze_advanced_habitability(params):
    """Расширенный анализ обитаемости с использованием функций из app_2.py"""
    # Расчет ESI
    esi_value = calculate_esi(params)
    
    # Состав атмосферы
    atmosphere = calculate_atmosphere(params['temperature'], params['radius'])
    
    # Вероятность наличия воды
    water_prob = calculate_water_probability(params['temperature'], params['radius'])
    
    # Пригодность для разных форм жизни
    life_sust = calculate_life_sustainability(params['temperature'], params['radius'], esi_value)
    
    # Магнитное поле
    magnetic_field = calculate_magnetic_field(params)
    
    # Классификация
    classification = get_classification(esi_value)
    
    return {
        'esi': round(esi_value, 4),
        'classification': classification,
        'atmosphere_composition': atmosphere,
        'water_probability': water_prob,
        'life_sustainability': life_sust,
        'magnetic_field': magnetic_field
    }

# API маршруты
@api_integration.route('/api/advanced_analyze', methods=['POST'])
def advanced_analyze():
    """
    Расширенный анализ экзопланеты с использованием дополнительных функций из app_2.py
    """
    try:
        data = request.json
        required_params = ['radius', 'temperature', 'density']
        
        # Проверка наличия всех необходимых параметров
        for param in required_params:
            if param not in data:
                return jsonify({'error': f'Missing parameter: {param}'}), 400
        
        params = {
            'radius': float(data['radius']),
            'temperature': float(data['temperature']),
            'density': float(data['density'])
        }
        
        # Получаем расширенный анализ
        advanced_data = analyze_advanced_habitability(params)
        
        return jsonify(advanced_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 