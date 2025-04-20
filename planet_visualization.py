"""
Модуль для генерации данных для 3D визуализации экзопланет
"""

import random
import math

def get_atmosphere_composition(planet_type, temperature_k, habitability_score):
    """
    Определяет примерный состав атмосферы планеты по её параметрам
    
    Args:
        planet_type (str): Тип планеты
        temperature_k (float): Температура поверхности в кельвинах
        habitability_score (int): Индекс обитаемости (0-100)
        
    Returns:
        dict: Состав атмосферы в процентах
    """
    if planet_type == "gas-giant":
        # Газовые гиганты имеют атмосферу, богатую водородом и гелием
        return {
            "Водород": 75 + random.randint(-10, 10),
            "Гелий": 23 + random.randint(-5, 5),
            "Метан": 1 + random.random(),
            "Аммиак": 0.5 + random.random() * 0.5
        }
    elif planet_type == "ice-giant":
        # Ледяные гиганты типа Нептуна или Урана
        return {
            "Водород": 80 + random.randint(-5, 5),
            "Гелий": 18 + random.randint(-3, 3),
            "Метан": 1.5 + random.random() * 1.5,
            "Вода": 0.5 + random.random()
        }
    elif temperature_k < 220:
        # Холодные каменистые планеты
        if habitability_score > 50:
            return {
                "Азот": 75 + random.randint(-10, 10),
                "CO2": 23 + random.randint(-5, 5),
                "Аргон": 1 + random.random(),
                "Кислород": 0.5 + random.random() * 0.5
            }
        else:
            return {
                "CO2": 95 + random.randint(-5, 5),
                "Азот": 3 + random.random() * 2,
                "Аргон": 1 + random.random(),
                "CO": 0.5 + random.random() * 0.5
            }
    elif temperature_k < 320:
        # Умеренные каменистые планеты
        if habitability_score > 70:
            # Земной тип атмосферы
            return {
                "Азот": 78 + random.randint(-5, 5),
                "Кислород": 21 + random.randint(-3, 3),
                "Аргон": 0.9 + random.random() * 0.2,
                "CO2": 0.04 + random.random() * 0.04,
                "Водяной пар": 0.25 + random.random() * 0.25
            }
        elif habitability_score > 40:
            # Ранняя Земля или Марс
            return {
                "Азот": 70 + random.randint(-10, 10),
                "CO2": 25 + random.randint(-10, 10),
                "Кислород": 2 + random.random() * 3,
                "Аргон": 1.5 + random.random(),
                "Водяной пар": 1 + random.random() * 2
            }
        else:
            # Венерианский тип
            return {
                "CO2": 95 + random.randint(-5, 5),
                "Азот": 3.5 + random.random() * 1.5,
                "SO2": 0.5 + random.random() * 0.3,
                "Водяной пар": 0.02 + random.random() * 0.02
            }
    else:
        # Горячие каменистые планеты
        return {
            "CO2": 98 + random.randint(-2, 2),
            "SO2": 1.5 + random.random(),
            "Водород": 0.3 + random.random() * 0.2,
            "Гелий": 0.1 + random.random() * 0.2
        }

def get_atmosphere_color(planet_type, temperature_k, habitability_score):
    """
    Определяет примерный цвет атмосферы планеты
    
    Args:
        planet_type (str): Тип планеты
        temperature_k (float): Температура поверхности в кельвинах
        habitability_score (int): Индекс обитаемости (0-100)
        
    Returns:
        str: Цвет атмосферы в формате RGB
    """
    if planet_type == "gas-giant":
        if temperature_k < 150:
            return "rgba(173, 216, 230, 0.7)"  # Светло-голубой
        elif temperature_k < 300:
            return "rgba(240, 230, 140, 0.7)"  # Светло-желтый
        else:
            return "rgba(210, 105, 30, 0.7)"  # Коричневый
    elif planet_type == "ice-giant":
        return "rgba(100, 149, 237, 0.7)"  # Голубовато-синий
    elif temperature_k < 220:
        return "rgba(176, 196, 222, 0.7)"  # Светло-стальной синий
    elif temperature_k < 320:
        if habitability_score > 70:
            return "rgba(135, 206, 235, 0.7)"  # Голубое небо как на Земле
        elif habitability_score > 40:
            return "rgba(176, 224, 230, 0.7)"  # Бледно-голубой
        else:
            return "rgba(222, 184, 135, 0.7)"  # Песочный/оранжевый
    else:
        return "rgba(188, 143, 143, 0.8)"  # Красновато-коричневый

def get_surface_features(planet_type, temperature_k, habitability_score):
    """
    Определяет особенности поверхности планеты
    
    Args:
        planet_type (str): Тип планеты
        temperature_k (float): Температура поверхности в кельвинах
        habitability_score (int): Индекс обитаемости (0-100)
        
    Returns:
        dict: Характеристики поверхности
    """
    if planet_type in ["gas-giant", "ice-giant"]:
        # У газовых гигантов нет твердой поверхности
        return {
            "type": "газовая",
            "features": ["атмосферные полосы", "вихревые штормы", "облачные системы"],
            "color": get_gas_giant_color(temperature_k),
            "texture": "gaseous"
        }
    
    # Для каменистых планет
    surface_types = []
    surface_features = []
    
    # Базовый тип поверхности в зависимости от температуры
    if temperature_k < 220:
        surface_types.append("ледяная")
        surface_features.extend(["ледяные шапки", "замерзшие океаны"])
        color = "#E0FFFF"  # Светло-голубой
        texture = "icy"
    elif temperature_k < 270:
        surface_types.append("каменистая холодная")
        surface_features.extend(["кратеры", "горы"])
        color = "#A0A0A0"  # Серый
        texture = "rocky"
    elif temperature_k < 320:
        if habitability_score > 60:
            surface_types.append("континентальная")
            surface_types.append("океаническая")
            surface_features.extend(["океаны", "континенты", "горные хребты"])
            color = "#4682B4"  # Сине-стальной
            texture = "earth-like"
        else:
            surface_types.append("пустынная")
            surface_features.extend(["каньоны", "дюны", "плато"])
            color = "#D2B48C"  # Песочный
            texture = "desert"
    elif temperature_k < 500:
        surface_types.append("вулканическая")
        surface_features.extend(["вулканы", "лавовые поля", "горячие источники"])
        color = "#8B4513"  # Темно-коричневый
        texture = "volcanic"
    else:
        surface_types.append("расплавленная")
        surface_features.append("лавовые океаны")
        color = "#FF4500"  # Оранжево-красный
        texture = "molten"
    
    # Добавляем особенности в зависимости от обитаемости
    if habitability_score > 70:
        surface_features.extend(["растительность", "облака", "атмосферные явления"])
    elif habitability_score > 50:
        if "океаническая" not in surface_types:
            surface_features.append("водоемы")
    
    return {
        "type": ", ".join(surface_types),
        "features": surface_features,
        "color": color,
        "texture": texture
    }

def get_gas_giant_color(temperature_k):
    """
    Определяет цвет газового гиганта в зависимости от температуры
    
    Args:
        temperature_k (float): Температура в кельвинах
        
    Returns:
        str: Цвет в формате RGB
    """
    if temperature_k < 150:
        return "#4169E1"  # Королевский синий
    elif temperature_k < 300:
        return "#DAA520"  # Золотистый
    else:
        return "#8B4513"  # Темно-коричневый

def generate_planet_visualization_data(name, radius_earth, temperature_k, density_g_cm3, habitability_score):
    """
    Генерирует данные для 3D визуализации экзопланеты
    
    Args:
        name (str): Название планеты
        radius_earth (float): Радиус в земных радиусах
        temperature_k (float): Температура поверхности в кельвинах
        density_g_cm3 (float): Плотность в г/см³
        habitability_score (int): Индекс обитаемости (0-100)
        
    Returns:
        dict: Данные для визуализации
    """
    # Тип планеты в зависимости от радиуса и плотности
    planet_type = "earth-like"  # По умолчанию землеподобная
    
    if radius_earth > 10:
        planet_type = "gas-giant"
    elif radius_earth > 2.5 and density_g_cm3 < 3.0:
        planet_type = "ice-giant"
    elif radius_earth < 0.7:
        planet_type = "rocky-small"
    elif radius_earth > 1.5:
        planet_type = "super-earth"
        
    # Базовые цвета для текстуры
    if planet_type == "gas-giant":
        # Для газовых гигантов цвет зависит от температуры
        if temperature_k < 150:  # Холодный газовый гигант (типа Нептуна)
            base_color = '#3498db'  # Голубой
            cloud_color = '#ffffff'  # Белые облака
            bands = 8  # Больше полос
        elif temperature_k < 300:  # Умеренный (типа Юпитера)
            base_color = '#f39c12'  # Оранжевый
            cloud_color = '#ecf0f1'  # Светлые облака
            bands = 6  # Средне количество полос
        else:  # Горячий юпитер
            base_color = '#c0392b'  # Красноватый
            cloud_color = '#e74c3c'  # Красноватые облака
            bands = 3  # Меньше полос
    elif planet_type == "ice-giant":
        base_color = '#2980b9'  # Голубовато-синий
        cloud_color = '#3498db'  # Синеватые облака
        bands = 4
    elif temperature_k < 220:  # Холодная каменистая планета
        if habitability_score > 60:  # С атмосферой
            base_color = '#bdc3c7'  # Серый
            cloud_color = '#ecf0f1'  # Белые облака
            has_clouds = True
            has_ice_caps = True
        else:  # Безжизненная
            base_color = '#7f8c8d'  # Темно-серый
            cloud_color = ''
            has_clouds = False
            has_ice_caps = True
    elif temperature_k < 320:  # Умеренная каменистая планета
        if habitability_score > 70:  # Землеподобная
            base_color = '#27ae60'  # Зеленый
            cloud_color = '#ecf0f1'  # Белые облака
            has_clouds = True
            has_oceans = True
        elif habitability_score > 40:  # С простой жизнью
            base_color = '#16a085'  # Сине-зеленый
            cloud_color = '#ecf0f1'  # Белые облака
            has_clouds = True
            has_oceans = True
        else:  # Безжизненная
            base_color = '#e67e22'  # Оранжевый/красный
            cloud_color = '#d35400'  # Красноватые облака
            has_clouds = habitability_score > 30
    else:  # Горячая каменистая планета
        base_color = '#c0392b'  # Красный
        cloud_color = '#e74c3c'  # Темные облака
        has_clouds = temperature_k < 500
        has_lava = temperature_k > 600
    
    # Формируем данные для визуализации
    visualization_data = {
        'name': name,
        'radius': radius_earth,
        'temperature_k': temperature_k,
        'temperature_c': temperature_k - 273.15,
        'planet_type': planet_type,
        
        # Параметры для 3D-рендеринга
        'rendering': {
            'base_color': locals().get('base_color', '#2c3e50'),
            'cloud_color': locals().get('cloud_color', '#ffffff'),
            'has_clouds': locals().get('has_clouds', False),
            'has_oceans': locals().get('has_oceans', False),
            'has_ice_caps': locals().get('has_ice_caps', False),
            'has_lava': locals().get('has_lava', False),
            'bands': locals().get('bands', 0),
            'rotation_period': 24 * (1 + (radius_earth - 1) * 0.5),  # Примерный период вращения в часах
            'axial_tilt': random.randint(0, 45),  # Случайный наклон оси
            'ring_system': planet_type == "gas-giant" and random.random() < 0.3,  # 30% газовых гигантов имеют кольца
            'number_of_moons': min(int(radius_earth * 2), 20) if radius_earth > 0.8 else 0  # Количество спутников
        },
        
        # Параметры атмосферы
        'atmosphere': {
            'density': 'отсутствует' if habitability_score < 20 else (
                       'разреженная' if habitability_score < 40 else (
                       'умеренная' if habitability_score < 70 else 'плотная')),
            'composition': get_atmosphere_composition(planet_type, temperature_k, habitability_score),
            'color': get_atmosphere_color(planet_type, temperature_k, habitability_score),
            'cloud_coverage': 0 if not locals().get('has_clouds', False) else (
                             random.randint(20, 40) if habitability_score < 50 else random.randint(40, 80))
        },
        
        # Параметры поверхности
        'surface': get_surface_features(planet_type, temperature_k, habitability_score)
    }
    
    return visualization_data 