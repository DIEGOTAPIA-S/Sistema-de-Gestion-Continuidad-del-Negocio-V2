import pandas as pd
import random

# Datos de prueba
nombres = ["Juan", "Maria", "Carlos", "Ana", "Pedro", "Luisa", "Jorge", "Sofia", "Miguel", "Elena", "Santiago", "Camila", "Andres", "Valentina", "Felipe", "Daniela", "David", "Isabella", "Alejandro", "Mariana"]
apellidos = ["Perez", "Gomez", "Rodriguez", "Lopez", "Garcia", "Martinez", "Hernandez", "Gonzalez", "Ramirez", "Torres", "Dias", "Vargas", "Castillo", "Jimenez", "Moreno", "Rojas", "Muñoz", "Ortiz", "Castro", "Gutierrez"]
cargos = ["Analista", "Gerente", "Desarrollador", "Contador", "Asistente", "Director", "Coordinador", "Ingeniero", "Consultor", "Especialista"]
areas = ["Tecnologia", "Finanzas", "Recursos Humanos", "Operaciones", "Ventas", "Marketing", "Legal", "Logistica"]
gerencias = ["Gerencia TI", "Gerencia Financiera", "Gerencia General", "Gerencia Comercial"]
modalidades = ["Presencial", "Remoto", "Hibrido"]
companias = ["Colmédica", "Unidad Médica y de Diagnóstico", "Aliansalud Entidad Promotora de Salud"]

# Definamos las sedes REALES para asignar coordenadas correctas (tomadas de import_seed.py o seed.py)
SEDES_REALES = [
    {"nombre": "Colmédica Belaire", "latitud": 4.729454, "longitud": -74.024442},
    {"nombre": "Colmédica Bulevar Niza", "latitud": 4.712693, "longitud": -74.071400},
    {"nombre": "Colmédica Calle 185", "latitud": 4.763543, "longitud": -74.046126},
    {"nombre": "Colmédica Cedritos", "latitud": 4.718879, "longitud": -74.036092},
    {"nombre": "Colmédica Chapinero", "latitud": 4.640908, "longitud": -74.063738},
    {"nombre": "Colmédica Colina Campestre", "latitud": 4.733979, "longitud": -74.056138},
    {"nombre": "Colmédica Country Park", "latitud": 4.670067, "longitud": -74.057583},
    {"nombre": "Colmédica Metrópolis", "latitud": 4.681225, "longitud": -74.083156},
    {"nombre": "Colmédica Multiplaza", "latitud": 4.652573, "longitud": -74.126290},
    {"nombre": "Colmédica Calle 93", "latitud": 4.678423, "longitud": -74.055263},
    {"nombre": "Colmédica Plaza Central", "latitud": 4.633464, "longitud": -74.116219},
    {"nombre": "Colmédica Salitre Capital", "latitud": 4.660602, "longitud": -74.108643},
    {"nombre": "Colmédica Sede Administrativa", "latitud": 4.652762, "longitud": -74.076465},
    {"nombre": "Colmédica Suba", "latitud": 4.749960, "longitud": -74.087376},
    {"nombre": "Colmédica Torre Santa Bárbara", "latitud": 4.704044, "longitud": -74.053790},
    {"nombre": "Colmédica Unicentro Occidente", "latitud": 4.724354, "longitud": -74.114300},
    {"nombre": "Colmédica Usaquén", "latitud": 4.698510, "longitud": -74.030761},
    {"nombre": "Colmédica Barranquilla", "latitud": 11.004448, "longitud": -74.803674},
    {"nombre": "Colmédica Bucaramanga", "latitud": 7.115442, "longitud": -73.111918},
    {"nombre": "Colmédica Cali", "latitud": 3.422273, "longitud": -76.543009},
    # Agregar más si es necesario, pero con estas basta para prueba
]

# Generar 50 registros
data = []
for i in range(50):
    nombre = random.choice(nombres)
    apellido = random.choice(apellidos)
    modalidad = random.choice(modalidades)
    compania = random.choice(companias)
    
    # Lógica de Sede y Ubicación
    sede_nombre = ""
    lat = 0
    lon = 0
    
    if modalidad == "Remoto":
        # Ubicación aleatoria en Bogotá (residencia)
        lat = 4.60 + (random.random() * 0.15) 
        lon = -74.20 + (random.random() * 0.15)
        # 30% chance de tener sede asignada aunque sea remoto
        if random.random() > 0.7:
             # Filtrar solo sedes de Bogotá (Latitud aprox 4.x) para que coincida con la ubicación de vivienda
             sedes_bogota = [s for s in SEDES_REALES if 4.5 < s["latitud"] < 4.8]
             if sedes_bogota:
                sede_random = random.choice(sedes_bogota)
                sede_nombre = sede_random["nombre"]
    else:
        # Presencial o Híbrido -> Ubicación EXACTA de una sede real
        sede_asignada = random.choice(SEDES_REALES)
        sede_nombre = sede_asignada["nombre"]
        lat = sede_asignada["latitud"]
        lon = sede_asignada["longitud"]
        
        # Pequeña variación (jitter) para que no queden 100% apilados
        lat += (random.random() - 0.5) * 0.0005
        lon += (random.random() - 0.5) * 0.0005

    row = {
        "Identificacion": f"{1000000 + i}",
        "Nombres": nombre,
        "Apellidos": apellido,
        "Direccion": f"Carrera {random.randint(1, 100)} # {random.randint(1, 100)} - {random.randint(1, 100)}",
        "Ciudad": "Bogotá",
        "Telefono": f"300{random.randint(1000000, 9999999)}",
        "Email": f"{nombre.lower()}.{apellido.lower()}@empresa.com",
        "Cargo": random.choice(cargos),
        "Area": random.choice(areas),
        "Gerencia": random.choice(gerencias),
        "Modalidad": modalidad,
        "Compañia": compania,
        "Sede_Asignada": sede_nombre,
        "latitud": lat,
        "longitud": lon
    }
    data.append(row)

# Crear DataFrame y guardar excel
df = pd.DataFrame(data)
output_path = "colaboradores_prueba.xlsx"
df.to_excel(output_path, index=False)

print(f"✅ Archivo generado exitosamente: {output_path}")
print("Columnas:", df.columns.tolist())
