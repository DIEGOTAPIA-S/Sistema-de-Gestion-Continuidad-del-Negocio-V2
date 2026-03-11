import os
import django
import sys
import random

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from continuidad.models import Sede, Colaborador

# Datos de muestra realistas
NOMBRES = ["Andrés", "Beatriz", "Carlos", "Diana", "Eduardo", "Fernanda", "Gabriel", "Helena", "Ignacio", "Johana", "Kevin", "Laura", "Mauricio", "Natalia", "Oscar", "Patricia", "Ricardo", "Sandra", "Tomas", "Ursula", "Victor", "Wendy", "Ximena", "Yuber", "Zulma", "Juan", "Maria", "Jose", "Ana", "Luis", "Martha", "Pedro", "Gloria", "Jorge", "Angela", "Diego", "Claudia", "Francisco", "Luz", "Roberto", "Sandra"]
APELLIDOS = ["Acevedo", "Barrera", "Castellanos", "Duarte", "Espinosa", "Forero", "Gaitan", "Hernandez", "Ibañez", "Jimenez", "Klinger", "Lopez", "Martinez", "Niño", "Osorio", "Pardo", "Quintana", "Rojas", "Sanchez", "Torres", "Ureña", "Vargas", "Wong", "Xiques", "Yepes", "Zapata", "Rodriguez", "Gomez", "Garcia", "Perez", "Gonzalez", "Martinez", "Lopez", "Hernandez", "Ramirez", "Torres", "Castillo"]
CARGOS = ["Analista de Riesgos", "Gerente de Continuidad", "Especialista TI", "Coordinador de Logística", "Analista Financiero", "Director de Operaciones", "Asistente Administrativo", "Líder de Proyectos", "Consultor Senior", "Auditor Interno", "Desarrollador Backend", "Arquitecto de Software"]
AREAS = ["Riesgos", "Operaciones", "Tecnología", "Finanzas", "Talento Humano", "Legal", "Logística"]
GERENCIAS = ["Gerencia Técnica", "Gerencia de Operaciones", "Gerencia Transversal", "Gerencia Administrativa"]
COMPANIAS = ["Colmédica", "Unidad Médica y de Diagnóstico", "Aliansalud EPS"]
MODALIDADES = ["Presencial", "Remoto", "Hibrido"]

# Nomenclaturas de direcciones residenciales (Bogotá y genéricas)
PREFIJOS_DIR = ["Calle", "Carrera", "Diagonal", "Avenida Cra", "Avenida Cll", "Transversal"]
BARRIOS_BOGOTÁ = ["Usaquén", "Cedritos", "Suba", "Mazurén", "Colina Campestre", "Salitre", "Castilla", "Modelia", "Pontevedra", "La Castellana", "Chico", "Chapinero Alto", "Teusaquillo", "Galerías", "Nicolás de Federmán"]

def generate_random_coord(city):
    """Genera coordenadas realistas dentro del casco urbano de las ciudades principales."""
    coords = {
        "Bogotá": (4.5500, 4.7700, -74.1500, -74.0300),
        "Medellín": (6.1500, 6.3000, -75.6000, -75.5400),
        "Medellin": (6.1500, 6.3000, -75.6000, -75.5400),
        "Cali": (3.3400, 3.4800, -76.5400, -76.4700),
        "Barranquilla": (10.9300, 11.0200, -74.8400, -74.7700),
        "Cartagena": (10.3600, 10.4500, -75.5500, -75.4500),
        "Bucaramanga": (7.1000, 7.1500, -73.1300, -73.0800),
        "Chía": (4.8200, 4.8800, -74.0600, -74.0200),
        "Ibagué": (4.4000, 4.4600, -75.2500, -75.1800),
        "Manizales": (5.0300, 5.0800, -75.5200, -75.4600),
        "Neiva": (2.9000, 2.9600, -75.3200, -75.2500),
        "Pereira": (4.7800, 4.8400, -75.7500, -75.6500),
        "Villavicencio": (4.1000, 4.1600, -73.6600, -73.5800),
        "Yopal": (5.3100, 5.3500, -72.4200, -72.3600),
    }

    if city in coords:
        lat_min, lat_max, lon_min, lon_max = coords[city]
        return random.uniform(lat_min, lat_max), random.uniform(lon_min, lon_max)
    else:
        # Fallback de seguridad (un poco fuera de Bogotá para notar errores si los hay)
        return random.uniform(4.5000, 4.8000), random.uniform(-74.2000, -74.0000)

def generate_bulk_data():
    print("🚀 Iniciando generación masiva de colaboradores...")
    
    # Limpiar colaboradores anteriores para empezar de cero con la muestra limpia (opcional)
    Colaborador.objects.all().delete()
    print("🗑️ Base de datos de colaboradores limpiada.")

    sedes = list(Sede.objects.all())
    if not sedes:
        print("❌ No hay sedes en la base de datos. Ejecuta los scripts de sedes primero.")
        return

    sedes_bogota = [s for s in sedes if s.ciudad == "Bogotá"]
    if not sedes_bogota:
        print("⚠️ Advertencia: No se encontraron sedes en Bogotá. Usando fallback...")
        sedes_bogota = sedes # Evitar error pero advertir

    sedes_otras_ciudades = {}
    for s in sedes:
        if s.ciudad != "Bogotá":
            normalized_city = s.ciudad
            if normalized_city not in sedes_otras_ciudades:
                sedes_otras_ciudades[normalized_city] = []
            sedes_otras_ciudades[normalized_city].append(s)

    # Bogotá: Total 350
    bogota_count = 350
    # Otras ciudades: 100 per city
    total_otras = len(sedes_otras_ciudades) * 100
    
    total_to_create = bogota_count + total_otras
    print(f"📋 Plan: 350 (Bogotá) + {total_otras} (Nacional: {len(sedes_otras_ciudades)} ciudades x 100 cada una)")
    print(f"📊 Total a crear: {total_to_create}")

    created_count = 0

    # Generar Bogotá
    for i in range(bogota_count):
        sede = random.choice(sedes_bogota)
        create_colaborador(i, "Bogotá", sede)
        created_count += 1
        if created_count % 100 == 0:
            print(f"   ⏳ {created_count} registros creados...")

    # Generar Otras Ciudades
    idx_start = bogota_count
    for city, city_sedes in sedes_otras_ciudades.items():
        print(f"   🏙️ Generando 100 para {city}...")
        for i in range(100):
            sede = random.choice(city_sedes)
            create_colaborador(idx_start + i, city, sede)
            created_count += 1
        idx_start += 100

    print(f"\n✅ Proceso completado exitosamente.")
    print(f"📊 Total colaboradores creados: {created_count}")
    print(f"🏙️  Bogotá: {bogota_count} | Nacional: {total_otras}")
    print(f"🏠 Todas las direcciones son residenciales y asignadas a sedes locales.")

def create_colaborador(index, city, sede):
    nombre = random.choice(NOMBRES)
    apellido = random.choice(APELLIDOS)
    cargo = random.choice(CARGOS)
    area = random.choice(AREAS)
    gerencia = random.choice(GERENCIAS)
    modalidad = random.choice(MODALIDADES)
    compania = random.choice(COMPANIAS)
    
    # Dirección residencial realista
    prefijo = random.choice(PREFIJOS_DIR)
    barrio = random.choice(BARRIOS_BOGOTÁ) if city == "Bogotá" else city
    direccion = f"{prefijo} {random.randint(1, 190)} # {random.randint(1, 100)} - {random.randint(1, 99)}, {barrio}"
    
    lat, lon = generate_random_coord(city)
    
    Colaborador.objects.create(
        nombres=nombre,
        apellidos=apellido,
        identificacion=f"ID-{2000000 + index}", # New range to avoid collision if run multiple times
        cargo=cargo,
        area=area,
        gerencia=gerencia,
        modalidad=modalidad,
        compania=compania,
        direccion=direccion,
        sede_asignada=sede,
        latitud=lat,
        longitud=lon,
        telefono=f"31{random.randint(0, 9)}{random.randint(1000000, 9999999)}",
        email=f"{nombre.lower().replace(' ', '')}.{apellido.lower()}@empresa.com"
    )

if __name__ == "__main__":
    generate_bulk_data()
