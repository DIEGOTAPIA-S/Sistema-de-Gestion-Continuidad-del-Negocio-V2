import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from continuidad.models import Sede, Proceso
import random

# LISTADO COMPLETO PROPORCIONADO POR EL USUARIO (30 SEDES)
SEDES_DATA = [
    {"nombre": "Colmédica Belaire", "ciudad": "Bogotá", "direccion": "Cl. 153 #6-65, Bogotá", "latitud": 4.729454, "longitud": -74.024442},
    {"nombre": "Colmédica Bulevar Niza", "ciudad": "Bogotá", "direccion": "Av. Cl. 127 #58-59, Bogotá", "latitud": 4.712693, "longitud": -74.071400},
    {"nombre": "Colmédica Calle 185", "ciudad": "Bogotá", "direccion": "Cl. 185 #45-03, Bogotá", "latitud": 4.763543, "longitud": -74.046126},
    {"nombre": "Colmédica Cedritos", "ciudad": "Bogotá", "direccion": "Cl. 140 #11-45, Bogotá", "latitud": 4.718879, "longitud": -74.036092},
    {"nombre": "Colmédica Chapinero", "ciudad": "Bogotá", "direccion": "Cr. 7 #52-53, Bogotá", "latitud": 4.640908, "longitud": -74.063738},
    {"nombre": "Colmédica Colina Campestre", "ciudad": "Bogotá", "direccion": "Cl. 151 #54-15, Bogotá", "latitud": 4.733979, "longitud": -74.056138},
    {"nombre": "Colmédica Country Park", "ciudad": "Bogotá", "direccion": "Autopista Norte #122-96, Bogotá", "latitud": 4.670067, "longitud": -74.057583},
    {"nombre": "Colmédica Metrópolis", "ciudad": "Bogotá", "direccion": "Av. Cra. 68 #75A-50, Bogotá", "latitud": 4.681225, "longitud": -74.083156},
    {"nombre": "Colmédica Multiplaza", "ciudad": "Bogotá", "direccion": "Cl. 19A #72-57, Bogotá", "latitud": 4.652573, "longitud": -74.126290},
    {"nombre": "Colmédica Calle 93", "ciudad": "Bogotá", "direccion": "Cl. 93 #19-25, Bogotá", "latitud": 4.678423, "longitud": -74.055263},
    {"nombre": "Colmédica Plaza Central", "ciudad": "Bogotá", "direccion": "Cra. 65 #11-50, Bogotá", "latitud": 4.633464, "longitud": -74.116219},
    {"nombre": "Colmédica Salitre Capital", "ciudad": "Bogotá", "direccion": "Av. Cl. 26 #69C-03, Bogotá", "latitud": 4.660602, "longitud": -74.108643},
    {"nombre": "Colmédica Sede Administrativa", "ciudad": "Bogotá", "direccion": "Cl 63 #28-75, Bogotá", "latitud": 4.652762, "longitud": -74.076465},
    {"nombre": "Colmédica Suba", "ciudad": "Bogotá", "direccion": "Av. Cl. 145 #103B-69, Bogotá", "latitud": 4.749960, "longitud": -74.087376},
    {"nombre": "Colmédica Torre Santa Bárbara", "ciudad": "Bogotá", "direccion": "Autopista Norte #122-96, Bogotá", "latitud": 4.704044, "longitud": -74.053790},
    {"nombre": "Colmédica Unicentro Occidente", "ciudad": "Bogotá", "direccion": "Cra. 111C #86-05, Bogotá", "latitud": 4.724354, "longitud": -74.114300},
    {"nombre": "Colmédica Usaquén", "ciudad": "Bogotá", "direccion": "Cra. 7 #120-20, Bogotá", "latitud": 4.698510, "longitud": -74.030761},
    {"nombre": "Colmédica Barranquilla", "ciudad": "Barranquilla", "direccion": "Calle 76 # 55-52, Barranquilla", "latitud": 11.004448, "longitud": -74.803674},
    {"nombre": "Colmédica Bucaramanga", "ciudad": "Bucaramanga", "direccion": "Cl 52 A 31-68, Bucaramanga", "latitud": 7.115442, "longitud": -73.111918},
    {"nombre": "Colmédica Cali", "ciudad": "Cali", "direccion": "Cr 40 5C–118, Cali", "latitud": 3.422273, "longitud": -76.543009},
    {"nombre": "Colmédica Las Ramblas", "ciudad": "Cartagena", "direccion": "CC las Ramblas, Cartagena", "latitud": 10.519058, "longitud": -75.466197},
    {"nombre": "Colmédica Bocagrande", "ciudad": "Cartagena", "direccion": "Cr 4 # 4-78, Cartagena", "latitud": 10.398251, "longitud": -75.558690},
    {"nombre": "Colmédica Chía", "ciudad": "Chía", "direccion": "Belenus Chía, Chía", "latitud": 4.883582, "longitud": -74.037240},
    {"nombre": "Colmédica Ibagué", "ciudad": "Ibagué", "direccion": "Cra. 5 # 30-05, Ibagué", "latitud": 4.443406, "longitud": -75.223330},
    {"nombre": "Colmédica Manizales", "ciudad": "Manizales", "direccion": "Cr 27 A 66-30, Manizales", "latitud": 5.054334, "longitud": -75.484384},
    {"nombre": "Colmédica Medellín", "ciudad": "Medellin", "direccion": "Cr 43B 14-44, Medellin", "latitud": 6.217569, "longitud": -75.559984},
    {"nombre": "Colmédica Neiva", "ciudad": "Neiva", "direccion": "Cl 19 # 5a-50, Neiva", "latitud": 2.937238, "longitud": -75.287148},
    {"nombre": "Colmédica Pereira", "ciudad": "Pereira", "direccion": "Cl 19 N 12–50, Pereira", "latitud": 4.805020, "longitud": -75.687787},
    {"nombre": "Colmédica Villavicencio", "ciudad": "Villavicencio", "direccion": "Cl 32 # 40A–31, Villavicencio", "latitud": 4.142414, "longitud": -73.638605},
    {"nombre": "Colmédica Yopal", "ciudad": "Yopal", "direccion": "Cr 21 35-68, Yopal", "latitud": 5.327695, "longitud": -72.386377}
]

PROCESOS_TEMPLATE = [
    {"nombre": "Nómina", "criticidad": "Alta", "rto": 4, "rpo": 2},
    {"nombre": "Facturación", "criticidad": "Alta", "rto": 2, "rpo": 1},
    {"nombre": "TI / Infraestructura", "criticidad": "Crítica", "rto": 1, "rpo": 1},
    {"nombre": "Atención al Cliente", "criticidad": "Media", "rto": 8, "rpo": 4},
    {"nombre": "Recursos Humanos", "criticidad": "Baja", "rto": 24, "rpo": 12},
    {"nombre": "Logística", "criticidad": "Media", "rto": 12, "rpo": 6},
]

def importar_datos():
    print("🚀 Iniciando importación de 30 sedes...")
    
    # Opcional: Limpiar sedes anteriores para evitar duplicados si cambiaron nombres
    # Sede.objects.all().delete() 
    
    creadas = 0
    existentes = 0

    for s_data in SEDES_DATA:
        sede, created = Sede.objects.get_or_create(
            nombre=s_data['nombre'],
            defaults={
                "direccion": s_data['direccion'],
                "latitud": s_data['latitud'],
                "longitud": s_data['longitud'],
                "ciudad": s_data['ciudad']
            }
        )
        
        if created:
            creadas += 1
            # Asignar procesos aleatorios
            procs = random.sample(PROCESOS_TEMPLATE, k=random.randint(3, min(5, len(PROCESOS_TEMPLATE))))
            for p in procs:
                Proceso.objects.create(sede=sede, **p)
        else:
            existentes += 1
            # Actualizar coordenadas porsi acaso
            sede.latitud = s_data['latitud']
            sede.longitud = s_data['longitud']
            sede.ciudad = s_data['ciudad']
            sede.save()

    print(f"\n🏁 Proceso Terminado.")
    print(f"   ✅ Nuevas: {creadas}")
    print(f"   ℹ️ Actualizadas: {existentes}")
    print(f"   📊 Total en BD: {Sede.objects.count()}")

if __name__ == "__main__":
    importar_datos()
