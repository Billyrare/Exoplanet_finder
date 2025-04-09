"""
Модуль для создания интерактивных визуализаций данных по экзопланетам
с использованием Plotly
"""

import plotly.graph_objects as go
import plotly.express as px
import plotly.io as pio
import plotly.figure_factory as ff
import pandas as pd
import numpy as np
import json
from plotly.subplots import make_subplots

# Настройка цветовых схем
EARTH_COLOR = '#3498db'
PLANET_COLOR = '#e74c3c'
COLOR_SCALE = 'Viridis'
HABITABLE_COLOR = '#2ecc71'
NON_HABITABLE_COLOR = '#e74c3c'

def create_esi_gauge(esi_value):
    """
    Создает интерактивную шкалу индекса схожести с Землей (ESI)
    от 0 до 1, где 1 - идеальное соответствие параметрам Земли
    """
    # Определяем цветовую зону в зависимости от ESI
    if esi_value >= 0.8:
        color = HABITABLE_COLOR
        category = "Высокая схожесть"
    elif esi_value >= 0.6:
        color = '#f39c12'
        category = "Средняя схожесть"
    elif esi_value >= 0.4:
        color = '#f1c40f'
        category = "Низкая схожесть"
    else:
        color = NON_HABITABLE_COLOR
        category = "Несхожа с Землей"
    
    # Создаем круговую шкалу
    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=esi_value,
        domain={'x': [0, 1], 'y': [0, 1]},
        title={'text': "Индекс схожести с Землей (ESI)", 'font': {'size': 24}},
        delta={'reference': 1, 'increasing': {'color': HABITABLE_COLOR}},
        gauge={
            'axis': {'range': [0, 1], 'tickwidth': 1, 'tickcolor': "darkblue"},
            'bar': {'color': color},
            'bgcolor': "white",
            'borderwidth': 2,
            'bordercolor': "gray",
            'steps': [
                {'range': [0, 0.4], 'color': '#e74c3c'},
                {'range': [0.4, 0.6], 'color': '#f1c40f'},
                {'range': [0.6, 0.8], 'color': '#f39c12'},
                {'range': [0.8, 1], 'color': '#2ecc71'}],
            'threshold': {
                'line': {'color': "black", 'width': 4},
                'thickness': 0.75,
                'value': esi_value}
        }
    ))
    
    # Добавляем аннотации
    fig.add_annotation(
        x=0.5,
        y=0.25,
        text=category,
        showarrow=False,
        font=dict(size=16)
    )
    
    # Настраиваем макет
    fig.update_layout(
        height=400,
        margin=dict(l=30, r=30, t=50, b=30),
        paper_bgcolor="white",
        font=dict(color="black", family="Arial")
    )
    
    # Преобразуем в JSON для веб-отображения
    return json.loads(pio.to_json(fig))

def create_habitability_factors_chart(params, analysis):
    """
    Создает лепестковую диаграмму факторов обитаемости
    """
    # Получаем данные из анализа
    water_prob = analysis['advanced_analysis']['water_probability']
    mag_field = analysis['advanced_analysis']['magnetic_field']['protection_level']
    atmosphere = analysis['advanced_analysis']['atmosphere_composition']
    oxygen_level = atmosphere['Oxygen']
    
    # Создаем категории и значения для лепестковой диаграммы
    categories = ['Температура', 'Радиус', 'Плотность', 'Вода', 'Магнитное поле', 'Кислород']
    
    # Нормализуем значения
    temp_score = max(0, 100 - abs(params['temperature'] - 288) / 3)
    radius_score = max(0, 100 - abs(params['radius'] - 1) * 25)
    density_score = max(0, 100 - abs(params['density'] - 5.51) * 10)
    
    values = [temp_score, radius_score, density_score, water_prob, mag_field, oxygen_level]
    
    # Создаем фигуру
    fig = go.Figure()
    
    # Добавляем лепестковую диаграмму для планеты
    fig.add_trace(go.Scatterpolar(
        r=values,
        theta=categories,
        fill='toself',
        name='Планета',
        line_color=PLANET_COLOR,
        fillcolor='rgba(231, 76, 60, 0.3)'
    ))
    
    # Добавляем лепестковую диаграмму для Земли для сравнения
    fig.add_trace(go.Scatterpolar(
        r=[100, 100, 100, 100, 100, 21],  # Земные значения
        theta=categories,
        fill='toself',
        name='Земля',
        line_color=EARTH_COLOR,
        fillcolor='rgba(52, 152, 219, 0.3)'
    ))
    
    # Настраиваем макет
    fig.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 100]
            )
        ),
        title="Факторы обитаемости",
        height=500,
        showlegend=True
    )
    
    # Преобразуем в JSON для веб-отображения
    return json.loads(pio.to_json(fig))

def create_atmosphere_chart(atmosphere_composition):
    """
    Создает интерактивную круговую диаграмму состава атмосферы
    """
    labels = list(atmosphere_composition.keys())
    values = list(atmosphere_composition.values())
    
    # Создаем цветовую схему
    colors = px.colors.qualitative.Pastel
    
    # Создаем круговую диаграмму
    fig = go.Figure(data=[go.Pie(
        labels=labels, 
        values=values,
        hole=.4,
        textinfo='label+percent',
        insidetextorientation='radial',
        marker=dict(colors=colors),
        hoverinfo='label+percent+value'
    )])
    
    # Настраиваем макет
    fig.update_layout(
        title_text="Состав атмосферы",
        height=400,
        annotations=[dict(text='Газы (%)', x=0.5, y=0.5, font_size=16, showarrow=False)]
    )
    
    # Преобразуем в JSON для веб-отображения
    return json.loads(pio.to_json(fig))

def create_life_sustainability_chart(life_sustainability):
    """
    Создает столбчатую диаграмму показателей пригодности для различных форм жизни
    """
    forms = list(life_sustainability.keys())
    scores = list(life_sustainability.values())
    
    # Создаем цветовую схему в зависимости от значений
    colors = []
    for score in scores:
        if score >= 80:
            colors.append(HABITABLE_COLOR)
        elif score >= 60:
            colors.append('#f39c12')
        elif score >= 40:
            colors.append('#f1c40f')
        else:
            colors.append(NON_HABITABLE_COLOR)
    
    # Создаем столбчатую диаграмму
    fig = go.Figure(data=[go.Bar(
        x=forms,
        y=scores,
        marker_color=colors,
        text=scores,
        textposition='auto',
        hoverinfo='x+y'
    )])
    
    # Настраиваем макет
    fig.update_layout(
        title="Пригодность для различных форм жизни",
        xaxis_title="Формы жизни",
        yaxis_title="Оценка пригодности (%)",
        height=400,
        yaxis=dict(range=[0, 100])
    )
    
    # Преобразуем в JSON для веб-отображения
    return json.loads(pio.to_json(fig))

def create_similarity_gauge(habitability_score):
    """
    Создает шкалу обитаемости от 0 до 100
    """
    # Определяем цветовую зону в зависимости от оценки
    if habitability_score >= 80:
        color = HABITABLE_COLOR
        category = "Высокий потенциал обитаемости"
    elif habitability_score >= 60:
        color = '#f39c12'
        category = "Средний потенциал обитаемости"
    elif habitability_score >= 40:
        color = '#f1c40f'
        category = "Низкий потенциал обитаемости"
    else:
        color = NON_HABITABLE_COLOR
        category = "Непригодна для жизни"
    
    # Создаем круговую шкалу
    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=habitability_score,
        domain={'x': [0, 1], 'y': [0, 1]},
        title={'text': "Индекс обитаемости", 'font': {'size': 24}},
        gauge={
            'axis': {'range': [0, 100], 'tickwidth': 1, 'tickcolor': "darkblue"},
            'bar': {'color': color},
            'bgcolor': "white",
            'borderwidth': 2,
            'bordercolor': "gray",
            'steps': [
                {'range': [0, 40], 'color': '#e74c3c'},
                {'range': [40, 60], 'color': '#f1c40f'},
                {'range': [60, 80], 'color': '#f39c12'},
                {'range': [80, 100], 'color': '#2ecc71'}],
            'threshold': {
                'line': {'color': "black", 'width': 4},
                'thickness': 0.75,
                'value': habitability_score}
        }
    ))
    
    # Добавляем аннотации
    fig.add_annotation(
        x=0.5,
        y=0.25,
        text=category,
        showarrow=False,
        font=dict(size=16)
    )
    
    # Настраиваем макет
    fig.update_layout(
        height=400,
        margin=dict(l=30, r=30, t=50, b=30),
        paper_bgcolor="white",
        font=dict(color="black", family="Arial")
    )
    
    # Преобразуем в JSON для веб-отображения
    return json.loads(pio.to_json(fig))

def create_similar_planets_chart(similar_planets):
    """
    Создает сравнительную диаграмму для похожих планет
    """
    # Подготавливаем данные
    names = [planet['name'] for planet in similar_planets]
    similarities = [planet['similarity_percentage'] for planet in similar_planets]
    
    # Создаем столбчатую диаграмму
    fig = go.Figure(data=[go.Bar(
        x=names,
        y=similarities,
        marker_color='#3498db',
        text=similarities,
        textposition='auto',
        hoverinfo='x+y'
    )])
    
    # Настраиваем макет
    fig.update_layout(
        title="Похожие экзопланеты",
        xaxis_title="Название",
        yaxis_title="Сходство (%)",
        height=400,
        yaxis=dict(range=[0, 100])
    )
    
    # Преобразуем в JSON для веб-отображения
    return json.loads(pio.to_json(fig))

def generate_all_charts(params, analysis):
    """
    Генерирует все графики для анализа экзопланеты
    """
    charts = {}
    
    # ESI шкала
    charts['esi_gauge'] = create_esi_gauge(analysis['predicted_esi'])
    
    # Шкала обитаемости
    charts['habitability_gauge'] = create_similarity_gauge(analysis['habitability_score'])
    
    # Факторы обитаемости
    charts['habitability_factors'] = create_habitability_factors_chart(params, analysis)
    
    # Состав атмосферы
    charts['atmosphere'] = create_atmosphere_chart(analysis['advanced_analysis']['atmosphere_composition'])
    
    # Пригодность для различных форм жизни
    charts['life_sustainability'] = create_life_sustainability_chart(analysis['advanced_analysis']['life_sustainability'])
    
    # Похожие планеты
    charts['similar_planets'] = create_similar_planets_chart(analysis['similar_planets'])
    
    return charts 