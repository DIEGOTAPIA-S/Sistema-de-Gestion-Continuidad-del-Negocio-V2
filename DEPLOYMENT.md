# DEPLOYMENT.md — Guía de Despliegue en Producción
**Sistema:** SGCN v2.5 — Sistema de Gestión de Continuidad del Negocio  
**Stack:** Django 5 (Python) + React (Node.js) + PostgreSQL  
**Para:** Área de TI / Infraestructura

---

## Prerrequisitos en el servidor

```
- Sistema Operativo: Ubuntu 22.04 LTS (recomendado) o Windows Server 2019+
- Python: 3.11+
- Node.js: 20 LTS
- PostgreSQL: 15+
- Nginx: última versión estable
```

---

## Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/DIEGOTAPIA-S/Sistema-de-Gestion-Continuidad-del-Negocio-V2.git sgcn
cd sgcn
```

---

## Paso 2 — Configurar el archivo `.env`

Crear el archivo `backend/.env` con los valores reales de producción:

```env
# ============================================================
# DJANGO
# ============================================================
# Generar con: python -c "import secrets; print(secrets.token_urlsafe(50))"
SECRET_KEY=GENERAR_CLAVE_LARGA_Y_ALEATORIA_AQUI

DEBUG=False

# Dominio(s) del sistema separados por coma (sin https://)
ALLOWED_HOSTS=sgcn.empresa.com

# ============================================================
# BASE DE DATOS (PostgreSQL)
# ============================================================
DB_ENGINE=django.db.backends.postgresql
DB_NAME=sgcn_db
DB_USER=sgcn_user
DB_PASSWORD=CONTRASEÑA_SEGURA_BD
DB_HOST=localhost
DB_PORT=5432

# ============================================================
# CORREO (Microsoft 365)
# REQUISITO: habilitar "SMTP Auth" en Microsoft 365 Admin Center
# para la cuenta que se configure aqui.
# ============================================================
EMAIL_HOST_USER=notificaciones@empresa.com
EMAIL_HOST_PASSWORD=CONTRASEÑA_DE_LA_CUENTA
DEFAULT_FROM_EMAIL=notificaciones@empresa.com

# ============================================================
# CORS y CSRF
# URL completa del frontend incluyendo https://
# ============================================================
CORS_ALLOWED_ORIGINS=https://sgcn.empresa.com
CSRF_TRUSTED_ORIGINS=https://sgcn.empresa.com
```

> ⚠️ **Este archivo NUNCA debe subirse a Git.** Ya está en `.gitignore`.

---

## Paso 3 — Instalar dependencias del Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate         # Linux/Mac
# o: venv\Scripts\activate       # Windows

# Instalar dependencias
pip install -r requirements.txt

# Instalar Gunicorn (servidor de producción para Django)
pip install gunicorn
```

---

## Paso 4 — Configurar la Base de Datos

```bash
# Crear base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE sgcn_db;"
psql -U postgres -c "CREATE USER sgcn_user WITH PASSWORD 'CONTRASEÑA_AQUI';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE sgcn_db TO sgcn_user;"

# Ejecutar migraciones
python manage.py migrate

# Crear el primer usuario administrador
python manage.py createsuperuser
```

---

## Paso 5 — Compilar el Frontend

```bash
cd ../frontend-react

# Instalar dependencias de Node.js
npm install

# Compilar para producción (genera la carpeta /dist)
npm run build
```

---

## Paso 6 — Configurar Gunicorn (servidor Django)

Crear el archivo `/etc/systemd/system/sgcn.service`:

```ini
[Unit]
Description=SGCN Django Application
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/ruta/al/proyecto/backend
ExecStart=/ruta/al/proyecto/backend/venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    config.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl start sgcn
systemctl enable sgcn    # Inicia automáticamente al reiniciar el servidor
```

---

## Paso 7 — Configurar Nginx (servidor web)

Crear el archivo `/etc/nginx/sites-available/sgcn`:

```nginx
server {
    listen 80;
    server_name sgcn.empresa.com;

    # Redirigir HTTP a HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name sgcn.empresa.com;

    # Certificado SSL (ver Paso 8)
    ssl_certificate /etc/ssl/certs/sgcn.crt;
    ssl_certificate_key /etc/ssl/private/sgcn.key;

    # Archivos del frontend compilado
    root /ruta/al/proyecto/frontend-react/dist;
    index index.html;

    # Servir el frontend (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Redirigir peticiones /api/ al servidor Django
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Panel de administración Django
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }

    # Archivos estáticos de Django (admin panel)
    location /static/ {
        alias /ruta/al/proyecto/backend/staticfiles/;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/sgcn /etc/nginx/sites-enabled/
nginx -t     # Verificar configuración
systemctl reload nginx
```

---

## Paso 8 — Certificado SSL (HTTPS)

### Opción A: Certificado de la CA corporativa (recomendada si existe)
Instalar el certificado `.crt` y la llave `.key` en las rutas indicadas en Nginx.

### Opción B: Let's Encrypt (gratuito, requiere dominio público)
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d sgcn.empresa.com
```

---

## Paso 9 — Archivos estáticos de Django

```bash
cd backend
python manage.py collectstatic
```

---

## Paso 10 — Verificación final

```bash
# Verificar que Django pasa el checklist de producción
python manage.py check --deploy
# No debe aparecer ningún ERROR (pueden haber warnings menores)

# Verificar que Gunicorn está corriendo
systemctl status sgcn

# Verificar que Nginx está corriendo
systemctl status nginx
```

---

## ⚠️ Requisito Microsoft 365 (IMPORTANTE)

Para que el sistema pueda enviar correos de verificación 2FA, TI debe:

1. Ir al **Microsoft 365 Admin Center** → **Settings** → **Org settings** → **Modern Authentication**
2. Habilitar **"Authenticated SMTP"** para la cuenta `notificaciones@empresa.com`
3. Asegurarse de que la cuenta no tenga MFA habilitado (o crear una cuenta de servicio dedicada)

Sin este paso, el correo de recuperación de 2FA no funcionará.

---

## Variables de entorno — Referencia rápida

| Variable | Descripción | Ejemplo |
|---|---|---|
| `SECRET_KEY` | Clave secreta de Django | String de 50+ chars aleatorios |
| `DEBUG` | Modo debug | `False` en producción |
| `ALLOWED_HOSTS` | Dominios permitidos | `sgcn.empresa.com` |
| `DB_NAME` | Nombre BD PostgreSQL | `sgcn_db` |
| `DB_USER` | Usuario BD | `sgcn_user` |
| `DB_PASSWORD` | Contraseña BD | Contraseña segura |
| `DB_HOST` | Host BD | `localhost` o IP |
| `EMAIL_HOST_USER` | Cuenta correo M365 | `notif@empresa.com` |
| `EMAIL_HOST_PASSWORD` | Contraseña cuenta M365 | Contraseña de la cuenta |
| `CORS_ALLOWED_ORIGINS` | URL frontend | `https://sgcn.empresa.com` |
| `CSRF_TRUSTED_ORIGINS` | URL frontend (CSRF) | `https://sgcn.empresa.com` |
