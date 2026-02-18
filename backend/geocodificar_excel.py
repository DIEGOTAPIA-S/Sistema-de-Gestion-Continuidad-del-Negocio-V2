
import pandas as pd
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import time
import sys

def geocodificar_base_datos(input_file, output_file):
    """
    Lee un Excel de colaboradores, busca sus coordenadas y guarda un nuevo archivo.
    """
    print(f"📖 Leyendo archivo: {input_file}...")
    try:
        df = pd.read_excel(input_file)
    except FileNotFoundError:
        print("❌ Error: No se encontró el archivo. Asegúrate de poner el nombre correcto.")
        return

    # Verificar columnas necesarias
    required_cols = ['Direccion', 'Ciudad']
    for col in required_cols:
        if col not in df.columns:
            print(f"❌ Error: El Excel debe tener una columna llamada '{col}'")
            return

    # Iniciar Geocodificador (Nominatim es gratuito y abierto)
    # IMPORTANTE: user_agent debe ser único para no ser bloqueado
    geolocator = Nominatim(user_agent="continuidad_negocio_app_v1")

    print(f"🌍 Iniciando geocodificación de {len(df)} registros...")
    print("⏳ Esto puede tardar unos minutos (respetando límites de velocidad de la API)...")

    # Contadores
    found = 0
    not_found = 0

    # Listas para guardar resultados
    latitudes = []
    longitudes = []

    for index, row in df.iterrows():
        address = f"{row['Direccion']}, {row['Ciudad']}, Colombia"
        
        # Si ya tiene coordenadas, las respetamos
        if 'latitud' in df.columns and pd.notna(row['latitud']):
            latitudes.append(row['latitud'])
            longitudes.append(row['longitud'])
            found += 1
            print(f"✅ [{index+1}/{len(df)}] Ya tiene coordenadas: {row['Nombres']}")
            continue

        try:
            # Hacemos la petición
            location = geolocator.geocode(address, timeout=10)
            
            if location:
                latitudes.append(location.latitude)
                longitudes.append(location.longitude)
                found += 1
                print(f"✅ [{index+1}/{len(df)}] Encontrado: {address}")
            else:
                latitudes.append(None)
                longitudes.append(None)
                not_found += 1
                print(f"⚠️ [{index+1}/{len(df)}] No encontrado: {address}")

        except (GeocoderTimedOut, GeocoderServiceError) as e:
            print(f"❌ Error en conexión: {e}")
            latitudes.append(None)
            longitudes.append(None)
            not_found += 1
        
        # 💤 Dormir 1 segundo entre peticiones para no ser bloqueados por Nominatim Free
        time.sleep(1.1)

    # Agregar columnas al DataFrame
    df['latitud'] = latitudes
    df['longitud'] = longitudes

    # Guardar nuevo Excel
    df.to_excel(output_file, index=False)
    print("\n" + "="*50)
    print(f"🎉 Proceso Terminado!")
    print(f"📍 Direcciones encontradas: {found}")
    print(f"🚫 No encontradas: {not_found}")
    print(f"💾 Archivo guardado como: {output_file}")
    print("="*50)
    print("👉 AHORA: Sube este archivo 'listo_para_subir.xlsx' en la pestaña 'Datos' de la aplicación.")

if __name__ == "__main__":
    print("--- GEOCODIFICADOR DE DIRECCIONES ---")
    print("Por favor, asegúrate de que el archivo Excel esté en esta misma carpeta.")
    
    # Opción 1: Preguntar nombre
    while True:
        input_name = input("✍️  Escribe el nombre del archivo (ej: nomina.xlsx): ").strip()
        if input_name.endswith(".xlsx") or input_name.endswith(".xls"):
            INPUT_FILE = input_name
        else:
            INPUT_FILE = input_name + ".xlsx"
        
        if os.path.exists(INPUT_FILE):
            break
        else:
            print(f"❌ No encuentro '{INPUT_FILE}'. Intenta de nuevo.")

    OUTPUT_FILE = "geocodificado_" + INPUT_FILE
    
    geocodificar_base_datos(INPUT_FILE, OUTPUT_FILE)
    
    input("\nPresiona ENTER para salir...")
