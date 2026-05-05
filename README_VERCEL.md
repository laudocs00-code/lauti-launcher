# Despliegue en Vercel - Lauti Launcher Web

Este proyecto está configurado para desplegarse en **Vercel** de forma profesional, utilizando **Serverless Functions** para el backend y hosting estático para el frontend.

## Características
- **Hosting Estático**: La web (HTML/CSS/JS) se sirve automáticamente.
- **Backend Seguro (API)**: Las funciones en `/api` manejan el registro y login.
- **Verificación Premium**: El registro incluye una verificación real con la API de Mojang (evita que usuarios "no-premium" registren nombres de cuentas originales).
- **Sincronización Total**: La web y el Launcher comparten la misma base de datos en Firebase.

## Pasos para desplegar

1. **Instalar Vercel CLI (Opcional)**:
   ```bash
   npm install -g vercel
   ```

2. **Desplegar**:
   Abre una terminal en la carpeta `web` y ejecuta:
   ```bash
   vercel
   ```
   Sigue las instrucciones en pantalla.

3. **Configurar Variables de Entorno**:
   En el panel de control de Vercel (dashboard), añade la siguiente variable:
   - `FIREBASE_URL`: La URL de tu Realtime Database (ej: `https://tu-proyecto.firebaseio.com/`).

## Estructura
- `/index.html`: Página principal.
- `/api/register.js`: Función que valida Mojang y guarda en Firebase.
- `/api/login.js`: Función que valida credenciales.
- `vercel.json`: Configuración de rutas.

---
**Nota**: El archivo `server.js` es solo para pruebas locales y no es necesario en Vercel.
