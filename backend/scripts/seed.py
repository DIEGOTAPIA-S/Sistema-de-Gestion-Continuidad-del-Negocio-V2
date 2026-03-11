"""
Django management command to seed the database with initial data.
Run with: python manage.py seed
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from continuidad.models import Sede, Proceso

SEDES_DATA = [
    {"nombre": "Sede Principal Bogotá", "ciudad": "Bogotá", "direccion": "Carrera 7 #71-21, Bogotá", "latitud": 4.6570, "longitud": -74.0565},
    {"nombre": "Sede Norte Bogotá", "ciudad": "Bogotá", "direccion": "Calle 100 #19-61, Bogotá", "latitud": 4.6827, "longitud": -74.0427},
    {"nombre": "Sede Sur Bogotá", "ciudad": "Bogotá", "direccion": "Av. 1 de Mayo #30-45, Bogotá", "latitud": 4.6060, "longitud": -74.1118},
    {"nombre": "Sede Centro Bogotá", "ciudad": "Bogotá", "direccion": "Carrera 10 #20-30, Bogotá", "latitud": 4.6097, "longitud": -74.0819},
    {"nombre": "Sede Salitre Bogotá", "ciudad": "Bogotá", "direccion": "Av. El Dorado #68B-85, Bogotá", "latitud": 4.6590, "longitud": -74.1068},
    {"nombre": "Sede Usaquén", "ciudad": "Bogotá", "direccion": "Calle 119 #6-48, Bogotá", "latitud": 4.6952, "longitud": -74.0318},
    {"nombre": "Sede Chapinero", "ciudad": "Bogotá", "direccion": "Calle 57 #13-42, Bogotá", "latitud": 4.6454, "longitud": -74.0635},
    {"nombre": "Sede Medellín Centro", "ciudad": "Medellín", "direccion": "Carrera 46 #52-36, Medellín", "latitud": 6.2476, "longitud": -75.5658},
    {"nombre": "Sede Medellín Poblado", "ciudad": "Medellín", "direccion": "Calle 10 #43D-10, Medellín", "latitud": 6.2088, "longitud": -75.5699},
    {"nombre": "Sede Cali Norte", "ciudad": "Cali", "direccion": "Av. 6N #35N-50, Cali", "latitud": 3.4616, "longitud": -76.5320},
    {"nombre": "Sede Barranquilla", "ciudad": "Barranquilla", "direccion": "Carrera 53 #75-91, Barranquilla", "latitud": 10.9878, "longitud": -74.7889},
    {"nombre": "Sede Bucaramanga", "ciudad": "Bucaramanga", "direccion": "Calle 36 #19-22, Bucaramanga", "latitud": 7.1253, "longitud": -73.1198},
]

PROCESOS_TEMPLATE = [
    {"nombre": "Nómina", "criticidad": "Alta", "rto": 4, "rpo": 2},
    {"nombre": "Facturación", "criticidad": "Alta", "rto": 2, "rpo": 1},
    {"nombre": "TI / Infraestructura", "criticidad": "Crítica", "rto": 1, "rpo": 1},
    {"nombre": "Atención al Cliente", "criticidad": "Media", "rto": 8, "rpo": 4},
    {"nombre": "Recursos Humanos", "criticidad": "Baja", "rto": 24, "rpo": 12},
    {"nombre": "Logística", "criticidad": "Media", "rto": 12, "rpo": 6},
]

def seed():
    print("🌱 Iniciando seed...")
    Proceso.objects.all().delete()
    Sede.objects.all().delete()
    
    for s_data in SEDES_DATA:
        sede = Sede.objects.create(**s_data)
        # Asignar 3-5 procesos aleatorios a cada sede
        import random
        procs = random.sample(PROCESOS_TEMPLATE, k=random.randint(3, min(5, len(PROCESOS_TEMPLATE))))
        for p in procs:
            Proceso.objects.create(sede=sede, **p)
        print(f"  ✅ {sede.nombre} - {len(procs)} procesos")
    
    print(f"\n🎉 Seed completo: {Sede.objects.count()} sedes, {Proceso.objects.count()} procesos.")

if __name__ == '__main__':
    seed()
