import shapely
import geopandas as gpd
import pandas as pd
import folium
import json
import re
import numpy as np


def hello():
    print('hello wrld')

def getNewColor():
    color = list(np.random.choice(range(256), size=3))
    return('#%02X%02X%02X' % (color[0], color[1], color[2]))

def getMapFromFiles(df_list,file_names):
    map1 = folium.Map(location=[51.11, 4.46], zoom_start=12)
   

    for df,name in zip(df_list,file_names):
        figure = folium.map.FeatureGroup(name=name).add_to(map1)
        style = {'fillColor': getNewColor(), 'color': getNewColor()}
        # LINE
        if(isinstance(list(df['geometry'])[0],shapely.geometry.linestring.LineString)):
            for index, row in df.iterrows():
                b = folium.GeoJson(row['geometry'],style_function=lambda x:{'fillColor': getNewColor(), 'color': getNewColor()})
                try:
                    b.add_child(folium.Tooltip(row['name']))
                except:
                    try:
                        b.add_child(folium.Tooltip(row['NAME']))
                    except:
                        pass
                figure.add_child(b)
        # specifiek stations
        elif(name=='stations.geojson'):
            for index, row in df.iterrows():
                c = folium.Circle(
                    radius=100,
                    location=[row['geometry'].centroid.y, row['geometry'].centroid.x],
                    popup=row['name'],
                    color='red'
                )
                figure.add_child(c)
        # POINT
        elif(isinstance(list(df['geometry'])[0],shapely.geometry.point.Point)):
            for index, row in df.iterrows():
                c = folium.Circle(
                    radius=100,
                    location=[row['geometry'].centroid.y, row['geometry'].centroid.x],
                    popup=row['name'],
                    color=style['color']
                )
                figure.add_child(c)
        ## specifiek alle plekjes
        elif(name=='alle_plekjes.geojson'):
            for index, row in df.iterrows():
                b = folium.GeoJson(row['geometry'],style_function=lambda x:{'fillColor': 'green', 'color': 'green'})
                try:
                    b.add_child(folium.Popup(row['name']))
                except:
                    try:
                        b.add_child(folium.Popup(row['NAME']))
                    except:
                        pass
                figure.add_child(b)
        # MULTIPOLYGON or POLYGON
        else:
            for index, row in df.iterrows():
                b = folium.GeoJson(row['geometry'],style_function=lambda x:style)
                try:
                    b.add_child(folium.Popup(row['name']))
                except:
                    try:
                        b.add_child(folium.Popup(row['NAME']))
                    except:
                        pass
                figure.add_child(b)
    folium.LayerControl().add_to(map1)
    return map1