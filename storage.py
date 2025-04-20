"""
Модуль для сохранения и загрузки результатов анализа экзопланет
"""

import os
import json
from datetime import datetime
import uuid

# Путь для сохранения результатов анализа
SAVED_PLANETS_DIR = 'saved_planets'
# Создаем директорию, если она не существует
os.makedirs(SAVED_PLANETS_DIR, exist_ok=True)

def save_analysis(planet_data, analysis_results):
    """
    Сохраняет результаты анализа экзопланеты в JSON-файл
    
    Args:
        planet_data (dict): Данные о параметрах планеты
        analysis_results (dict): Результаты анализа планеты
        
    Returns:
        dict: Информация о сохраненном файле
    """
    # Если планета не имеет имени, создаем временное
    planet_name = planet_data.get('name', f"Неизвестная планета {datetime.now().strftime('%Y%m%d%H%M%S')}")
    # Создаем уникальный ID для сохранения
    unique_id = str(uuid.uuid4())
    
    # Создаем структуру для сохранения
    save_data = {
        'id': unique_id,
        'name': planet_name,
        'saved_date': datetime.now().isoformat(),
        'planet_parameters': planet_data,
        'analysis_results': analysis_results
    }
    
    # Сохраняем данные в JSON файл
    file_path = os.path.join(SAVED_PLANETS_DIR, f"{unique_id}.json")
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(save_data, f, ensure_ascii=False, indent=2)
    
    return {
        'success': True,
        'message': f"Данные о планете {planet_name} успешно сохранены",
        'id': unique_id,
        'file_path': file_path
    }

def load_all_planets():
    """
    Загружает список всех сохраненных планет с краткой информацией
    
    Returns:
        dict: Список планет и их количество
    """
    # Получаем список всех сохраненных файлов
    saved_files = [f for f in os.listdir(SAVED_PLANETS_DIR) if f.endswith('.json')]
    planets_list = []
    
    # Загружаем краткую информацию о каждой планете
    for file_name in saved_files:
        file_path = os.path.join(SAVED_PLANETS_DIR, file_name)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                planet_data = json.load(f)
                planets_list.append({
                    'id': planet_data.get('id', file_name.replace('.json', '')),
                    'name': planet_data.get('name', 'Неизвестная планета'),
                    'saved_date': planet_data.get('saved_date', ''),
                    'summary': {
                        'radius': planet_data.get('planet_parameters', {}).get('radius', 0),
                        'temperature': planet_data.get('planet_parameters', {}).get('temperature', 0),
                        'habitability_score': planet_data.get('analysis_results', {}).get('habitability_score', 0)
                    }
                })
        except Exception as e:
            print(f"Ошибка при загрузке файла {file_name}: {str(e)}")
    
    # Сортируем по дате сохранения (новые сверху)
    planets_list.sort(key=lambda x: x.get('saved_date', ''), reverse=True)
    
    return {
        'planets': planets_list,
        'count': len(planets_list)
    }

def load_planet(planet_id):
    """
    Загружает полные данные о планете по ее ID
    
    Args:
        planet_id (str): Уникальный идентификатор планеты
        
    Returns:
        dict: Полные данные о планете или информация об ошибке
    """
    # Проверяем наличие файла
    file_path = os.path.join(SAVED_PLANETS_DIR, f"{planet_id}.json")
    if not os.path.exists(file_path):
        return {
            'success': False,
            'message': f"Планета с ID {planet_id} не найдена"
        }
    
    # Загружаем полные данные о планете
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            planet_data = json.load(f)
            
        return {
            'success': True,
            'planet_data': planet_data
        }
    except Exception as e:
        return {
            'success': False,
            'message': f"Ошибка при загрузке данных: {str(e)}"
        }

def delete_planet(planet_id):
    """
    Удаляет данные о планете по ее ID
    
    Args:
        planet_id (str): Уникальный идентификатор планеты
        
    Returns:
        dict: Информация об успешном удалении или ошибке
    """
    # Проверяем наличие файла
    file_path = os.path.join(SAVED_PLANETS_DIR, f"{planet_id}.json")
    if not os.path.exists(file_path):
        return {
            'success': False,
            'message': f"Планета с ID {planet_id} не найдена"
        }
    
    # Удаляем файл
    try:
        os.remove(file_path)
        return {
            'success': True,
            'message': f"Планета с ID {planet_id} успешно удалена"
        }
    except Exception as e:
        return {
            'success': False,
            'message': f"Ошибка при удалении: {str(e)}"
        } 