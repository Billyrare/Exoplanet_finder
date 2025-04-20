"""
Модуль для сравнения экзопланет между собой
"""

import os
import json
from storage import SAVED_PLANETS_DIR

def compare_planets(planet_ids):
    """
    Сравнивает несколько экзопланет между собой по различным параметрам
    
    Args:
        planet_ids (list): Список ID планет для сравнения
        
    Returns:
        dict: Результат сравнения или информация об ошибке
    """
    if not planet_ids or len(planet_ids) < 2:
        return {
            'success': False,
            'message': "Необходимо указать минимум два ID планет для сравнения"
        }
    
    planets_data = []
    # Загружаем данные о каждой планете
    for planet_id in planet_ids:
        file_path = os.path.join(SAVED_PLANETS_DIR, f"{planet_id}.json")
        if not os.path.exists(file_path):
            # Если планета не найдена, пропускаем ее
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                planet_data = json.load(f)
                planets_data.append(planet_data)
        except Exception as e:
            print(f"Ошибка при загрузке планеты {planet_id}: {str(e)}")
    
    if len(planets_data) < 2:
        return {
            'success': False,
            'message': "Не удалось найти достаточное количество планет для сравнения"
        }
    
    # Извлекаем ключевые параметры для сравнения
    comparison_result = {
        'planets': [],
        'habitability_ranking': [],
        'parameter_comparison': {
            'radius': {'values': [], 'earth_relative': True, 'description': 'Радиус планеты в земных радиусах'},
            'temperature': {'values': [], 'earth_relative': False, 'description': 'Температура поверхности в кельвинах'},
            'density': {'values': [], 'earth_relative': True, 'description': 'Плотность в г/см³'},
            'habitability_score': {'values': [], 'earth_relative': False, 'description': 'Индекс обитаемости (0-100)'},
            'esi': {'values': [], 'earth_relative': False, 'description': 'Индекс подобия Земле (0-1)'},
        }
    }
    
    # Заполняем данные для сравнения
    for planet in planets_data:
        planet_params = planet.get('planet_parameters', {})
        analysis_results = planet.get('analysis_results', {})
        
        # Базовая информация о планете
        planet_info = {
            'id': planet.get('id', ''),
            'name': planet.get('name', 'Неизвестная планета'),
            'radius': planet_params.get('radius', 0),
            'temperature': planet_params.get('temperature', 0),
            'density': planet_params.get('density', 0),
            'habitability_score': analysis_results.get('habitability_score', 0),
            'esi': analysis_results.get('predicted_esi', 0)
        }
        comparison_result['planets'].append(planet_info)
        
        # Заполняем значения для параметров
        for param in comparison_result['parameter_comparison']:
            if param in planet_info:
                comparison_result['parameter_comparison'][param]['values'].append({
                    'planet_id': planet.get('id', ''),
                    'planet_name': planet.get('name', 'Неизвестная планета'),
                    'value': planet_info[param]
                })
    
    # Сортируем планеты по индексу обитаемости
    habitability_ranking = sorted(
        [{'id': p.get('id', ''), 'name': p.get('name', ''), 'score': p.get('habitability_score', 0)} 
         for p in comparison_result['planets']],
        key=lambda x: x['score'],
        reverse=True
    )
    comparison_result['habitability_ranking'] = habitability_ranking
    
    # Находим наиболее похожую на Землю планету
    earth_similarity = sorted(
        [{'id': p.get('id', ''), 'name': p.get('name', ''), 'esi': p.get('esi', 0)} 
         for p in comparison_result['planets']],
        key=lambda x: x['esi'],
        reverse=True
    )
    comparison_result['earth_similarity_ranking'] = earth_similarity
    
    # Анализируем различия в параметрах
    parameter_analysis = {}
    for param, data in comparison_result['parameter_comparison'].items():
        if not data['values']:
            continue
            
        values = [v['value'] for v in data['values']]
        if not values:
            continue
            
        min_val = min(values)
        max_val = max(values)
        avg_val = sum(values) / len(values)
        range_val = max_val - min_val
        
        # Находим планету с максимальным и минимальным значением
        max_planet = next((v['planet_name'] for v in data['values'] if v['value'] == max_val), '')
        min_planet = next((v['planet_name'] for v in data['values'] if v['value'] == min_val), '')
        
        parameter_analysis[param] = {
            'min': min_val,
            'max': max_val,
            'average': avg_val,
            'range': range_val,
            'min_planet': min_planet,
            'max_planet': max_planet,
            'difference_percentage': (range_val / avg_val * 100) if avg_val != 0 else 0
        }
    
    comparison_result['parameter_analysis'] = parameter_analysis
    
    # Общие выводы по сравнению
    conclusions = []
    
    # Анализ по обитаемости
    if habitability_ranking:
        most_habitable = habitability_ranking[0]
        conclusions.append(f"Наиболее обитаемая планета: {most_habitable['name']} (индекс обитаемости: {most_habitable['score']})")
    
    # Анализ по сходству с Землей
    if earth_similarity:
        most_earth_like = earth_similarity[0]
        if most_earth_like['esi'] > 0.7:
            conclusions.append(f"Планета {most_earth_like['name']} наиболее похожа на Землю (ESI: {most_earth_like['esi']:.2f})")
        elif most_earth_like['esi'] > 0.4:
            conclusions.append(f"Планета {most_earth_like['name']} имеет умеренное сходство с Землей (ESI: {most_earth_like['esi']:.2f})")
    
    # Анализ разницы в размерах
    if 'radius' in parameter_analysis:
        radius_analysis = parameter_analysis['radius']
        if radius_analysis['range'] > radius_analysis['average'] * 0.5:
            conclusions.append(f"Большая разница в размерах: от {radius_analysis['min']:.2f} до {radius_analysis['max']:.2f} земных радиусов")
    
    # Анализ разницы в температуре
    if 'temperature' in parameter_analysis:
        temp_analysis = parameter_analysis['temperature']
        if temp_analysis['range'] > 50:  # Разница более 50K считается существенной
            conclusions.append(f"Значительная разница в температурах: от {temp_analysis['min']:.1f}K до {temp_analysis['max']:.1f}K")
    
    comparison_result['conclusions'] = conclusions
    
    return {
        'success': True,
        'comparison_result': comparison_result
    }

def get_parameter_distribution(parameter):
    """
    Получает распределение значений определенного параметра по всем сохраненным планетам
    
    Args:
        parameter (str): Параметр для анализа (radius, temperature, density, habitability_score, esi)
        
    Returns:
        dict: Статистика распределения значений параметра
    """
    # Получаем список всех сохраненных файлов
    saved_files = [f for f in os.listdir(SAVED_PLANETS_DIR) if f.endswith('.json')]
    values = []
    planet_names = []
    
    # Собираем значения параметра из всех планет
    for file_name in saved_files:
        file_path = os.path.join(SAVED_PLANETS_DIR, file_name)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                planet_data = json.load(f)
                
                # Определяем, где искать параметр
                if parameter in ['radius', 'temperature', 'density']:
                    value = planet_data.get('planet_parameters', {}).get(parameter, 0)
                elif parameter in ['habitability_score', 'predicted_esi']:
                    value = planet_data.get('analysis_results', {}).get(parameter, 0)
                else:
                    value = 0
                
                values.append(value)
                planet_names.append(planet_data.get('name', 'Неизвестная планета'))
        except Exception as e:
            print(f"Ошибка при загрузке файла {file_name}: {str(e)}")
    
    # Если нет данных, возвращаем сообщение об ошибке
    if not values:
        return {
            'success': False,
            'message': f"Не найдено планет с параметром '{parameter}'"
        }
    
    # Вычисляем статистику
    min_val = min(values)
    max_val = max(values)
    avg_val = sum(values) / len(values)
    
    # Находим планеты с минимальным и максимальным значением
    min_index = values.index(min_val)
    max_index = values.index(max_val)
    min_planet = planet_names[min_index]
    max_planet = planet_names[max_index]
    
    # Формируем распределение значений
    distribution = {}
    if parameter == 'radius':
        # Группируем по диапазонам радиуса
        ranges = [(0, 0.5), (0.5, 1), (1, 1.5), (1.5, 2.5), (2.5, 5), (5, 10), (10, float('inf'))]
        labels = ['Карликовые', 'Мини-земли', 'Землеподобные', 'Суперземли', 'Мининептуны', 'Нептуны', 'Гиганты']
        
        for i, (low, high) in enumerate(ranges):
            count = sum(1 for v in values if low <= v < high)
            distribution[labels[i]] = count
            
    elif parameter == 'temperature':
        # Группируем по диапазонам температуры
        ranges = [(0, 200), (200, 273), (273, 323), (323, 500), (500, float('inf'))]
        labels = ['Очень холодные', 'Холодные', 'Умеренные', 'Горячие', 'Очень горячие']
        
        for i, (low, high) in enumerate(ranges):
            count = sum(1 for v in values if low <= v < high)
            distribution[labels[i]] = count
            
    elif parameter == 'habitability_score':
        # Группируем по диапазонам обитаемости
        ranges = [(0, 20), (20, 40), (40, 60), (60, 80), (80, 101)]
        labels = ['Непригодные', 'Низкий потенциал', 'Средний потенциал', 'Высокий потенциал', 'Идеальные']
        
        for i, (low, high) in enumerate(ranges):
            count = sum(1 for v in values if low <= v < high)
            distribution[labels[i]] = count
    
    return {
        'success': True,
        'parameter': parameter,
        'count': len(values),
        'min': min_val,
        'max': max_val,
        'average': avg_val,
        'min_planet': min_planet,
        'max_planet': max_planet,
        'distribution': distribution
    } 