import pandas as pd
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
import time
import sys

def geocodificar_excel(input_file, output_file):
    print(f"📂 Leyendo archivo: {input_file}")
    
    try:
        df = pd.read_excel(input_file)
    except Exception as e:
        print(f"❌ Error leyendo Excel: {e}")
        return

    # Verificar columnas requeridas
    required_cols = ['Direccion', 'Ciudad']
    for col in required_cols:
        if col not in df.columns:
            print(f"❌ Falta la columna '{col}' en el Excel.")
            print(f"   Columnas detectadas: {list(df.columns)}")
            return

    print("🌍 Iniciando servicio de geocodificación (Nominatim)...")
    geolocator = Nominatim(user_agent="sistema_continuidad_negocio_v1")
    geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1.5) # Respetar límites de API

    # Crear columna completa para búsqueda
    df['Direccion_Completa'] = df['Direccion'].astype(str) + ', ' + df['Ciudad'].astype(str) + ', Colombia'

    print(f"⏳ Procesando {len(df)} registros. Esto puede tardar unos minutos...")
    
    # Listas para resultados
    latitudes = []
    longitudes = []
    
    # Preservar todas las columnas originales (incluyendo Gerencia)
    # Pandas lo hace por defecto, pero aseguramos que el output tenga todo.
    
    for index, row in df.iterrows():
        address = row['Direccion_Completa']
        try:
            print(f"   📍 Buscando ({index+1}/{len(df)}): {address[:50]}...", end='\r')
            location = geocode(address)
            
            if location:
                latitudes.append(location.latitude)
                longitudes.append(location.longitude)
            else:
                latitudes.append(None)
                longitudes.append(None)
                
        except Exception as e:
            print(f"\n   ⚠️ Error en fila {index}: {e}")
            latitudes.append(None)
            longitudes.append(None)

    df['latitud'] = latitudes
    df['longitud'] = longitudes

    # Guardar resultado
    print(f"\n💾 Guardando resultados en: {output_file}")
    df.to_excel(output_file, index=False)
    print("✅ ¡Proceso completado con éxito!")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python geocodificador.py <archivo_entrada.xlsx>")
    else:
        input_excel = sys.argv[1]
        output_excel = input_excel.replace(".xlsx", "_GEOCODIFICADO.xlsx")
        geocodificar_excel(input_excel, output_excel)
