import os
import django
import json
from decimal import Decimal

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from continuidad.models import EntidadApoyo

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data_fuente', 'infraestructura')

# ============================================================
# WHITELIST ESTRICTA - Solo archivos de emergencia CRITICOS
# ips.geojson EXCLUIDO (10,577 consultorios, opticas, gimnasios, etc.)
# cons.geojson EXCLUIDO (10,577 consultorios privados)
# ============================================================
WHITELIST_FILES = [
    'comandoatencioninmediata.geojson',  # CAIs de Policia
    'estacionpolicia.geojson',           # Estaciones Policia
    'ebom.geojson',                      # Estaciones Bomberos
    'bancosangre.geojson',               # Bancos de Sangre Distritales
    'caps.geojson',                      # Centros de Atencion Salud Distritales
    'stsa.geojson',                      # Clinicas y Hospitales Bogota (Razon_Soci/Direccion/Telefono)
    'Instituciones de salud.json',       # Hospitales publicos - formato records array
]

def map_type(filename):
    """Infiere el tipo basado en el nombre del archivo"""
    name = filename.lower()
    if 'cai' in name or 'comando' in name:
        return 'police'
    if 'polic' in name or 'estacionpolicia' in name:
        return 'police'
    if 'bomber' in name or 'ebom' in name:
        return 'fire_station'
    if 'hospital' in name or 'clinica' in name or 'caps' in name or 'salud' in name or 'bancosangre' in name or 'stsa' in name:
        return 'hospital'
    return None

def clean_database():
    """Limpia los datos previos para empezar de cero con calidad."""
    print("--- Limpiando base de datos de infraestructura ---")
    deleted, _ = EntidadApoyo.objects.all().delete()
    print(f"Eliminados {deleted} registros anteriores.")

def safe_decimal(value):
    """Convierte un valor a Decimal manejando coma como separador decimal (formato colombiano)."""
    if value is None:
        return None
    s = str(value).strip().replace(',', '.')
    try:
        return Decimal(s)
    except Exception:
        return None

def import_instituciones_salud(filepath):
    """
    Importa el archivo Instituciones de salud.json que tiene formato especial:
    { "fields": [...], "records": [[val1, val2, ...], ...] }
    Indices: 0=_id, 1=OBJECTID, 2=CodigoIPS, 3=NombreIPS, 4=NombreSede, 5=NumeroSede,
             6=Direccion, 7=Telefono, 8=Email, 9=Naturaleza, 10=Latitud, 11=Longitud
    Latitud/Longitud usan COMA como separador decimal.
    """
    print(f"--- Procesando (records array): {os.path.basename(filepath)} ---")
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    records = data.get('records', [])
    count = 0
    
    for record in records:
        if not isinstance(record, list) or len(record) < 12:
            continue
        
        nombre = str(record[4] or record[3] or '').strip()
        if not nombre or nombre.lower() in ('null', 'none', 'sin nombre'):
            continue  # Saltar registros sin nombre valido
        
        direccion = str(record[6] or '').strip()
        telefono = str(record[7] or '').strip()
        lat = safe_decimal(record[10])
        lon = safe_decimal(record[11])
        
        if lat is None or lon is None:
            continue
        
        # Normalizar telefono
        if telefono in ('None', 'nan', ''):
            telefono = ''
        
        try:
            EntidadApoyo.objects.update_or_create(
                nombre=nombre[:250],
                latitud=lat,
                longitud=lon,
                defaults={
                    'tipo': 'hospital',
                    'direccion': direccion[:290],
                    'telefono': telefono[:90],
                    'fuente': 'IDECA / Datos Abiertos Bogota'
                }
            )
            count += 1
        except Exception as e:
            print(f"  [ERROR] {nombre}: {e}")
    
    print(f"Hecho. {count} registros importados (Instituciones de salud).")
    return count

def import_geojson(filepath):
    filename = os.path.basename(filepath)
    
    # Archivo de formato especial - procesado por funcion dedicada
    if filename == 'Instituciones de salud.json':
        return import_instituciones_salud(filepath)
    
    # Solo procesar archivos en la whitelist
    if filename not in WHITELIST_FILES:
        return 0

    tipo_mapped = map_type(filename)
    if tipo_mapped is None:
        return 0

    print(f"--- Procesando JSON/GeoJSON: {filename} ---")
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    count = 0
    features = data.get('features', [])
    
    if not features:
        if isinstance(data, list):
            features = data
        elif 'data' in data and isinstance(data['data'], list):
            features = data['data']

    for item in features:
        lat, lon = None, None
        props = {}

        if isinstance(item, dict) and 'geometry' in item:
            geom = item.get('geometry')
            if geom:
                coords = geom.get('coordinates', [])
                if len(coords) >= 2:
                    lon, lat = coords[0], coords[1]
            props = item.get('properties', {})
        elif isinstance(item, dict):
            props = item
            lat = (props.get('latitud') or props.get('LATITUD') or props.get('lat') or
                   props.get('y') or props.get('Y') or props.get('CAILATITUD') or props.get('EPOLATITUD'))
            lon = (props.get('longitud') or props.get('LONGITUD') or props.get('lon') or
                   props.get('x') or props.get('X') or props.get('CAILONGITU') or props.get('EPOLONGITU'))

        if lat is None or lon is None:
            continue
            
        nombre = (
            props.get('CAIDESCRIP') or          # CAI
            props.get('EBONOMBRE') or            # Bomberos
            props.get('EPODESCRIP') or           # Policia
            props.get('CAPS') or                 # CAPS
            props.get('Razon_Soci') or           # stsa.geojson
            props.get('EPONOMBRE') or
            props.get('nombre') or props.get('NOMBRE_ENT') or props.get('NOMBRE') or 
            props.get('NOM_ESTA') or props.get('RAZON_SOCI') or ""
        )
        nombre = str(nombre).strip()
        
        # Saltar registros sin nombre valido
        if not nombre or nombre.lower() in ('null', 'none', 'sin nombre', 'n/a'):
            continue
        
        # Extraer Direccion
        direccion = (
            props.get('CAIDIR_SIT') or
            props.get('EBODIRECCI') or
            props.get('EPODIR_SIT') or
            props.get('Direccion') or            # CAPS y stsa (D mayuscula)
            props.get('direccion') or props.get('DIRECCION') or props.get('DIR_ESTA') or ""
        )
        
        # Extraer Telefono
        telefono = (
            props.get('CAITELEFON') or
            props.get('EBOTELEFON') or
            props.get('EPOTELEFON') or
            props.get('Telefono') or             # stsa.geojson (T mayuscula)
            props.get('telefono') or props.get('TELEFONO') or props.get('TEL_ESTA') or ""
        )

        tel_str = str(telefono).strip()
        if tel_str in ('', ' ', 'None', 'nan', '0.0', '0'):
            tel_str = ''
        
        try:
            EntidadApoyo.objects.update_or_create(
                nombre=nombre[:250],
                latitud=Decimal(str(float(lat))),
                longitud=Decimal(str(float(lon))),
                defaults={
                    'tipo': tipo_mapped,
                    'direccion': str(direccion).strip()[:290],
                    'telefono': tel_str[:90],
                    'fuente': 'IDECA / Datos Abiertos Bogota'
                }
            )
            count += 1
        except Exception as e:
            print(f"  [ERROR] {nombre}: {e}")
            continue
    
    print(f"Hecho. {count} registros importados.")
    return count

def main():
    if not os.path.exists(DATA_DIR):
        print(f"Error: La carpeta {DATA_DIR} no existe.")
        return

    clean_database()

    files = [f for f in os.listdir(DATA_DIR) if f.endswith(('.json', '.geojson'))]
    
    total = 0
    for f in files:
        path = os.path.join(DATA_DIR, f)
        total += import_geojson(path)
    
    print(f"\nIMPORTACION FINALIZADA. {total} entidades criticas cargadas.")

if __name__ == "__main__":
    main()
