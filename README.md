# MGCalc

Calculadora comercial de lotes de Mala Gardens con:

- lectura de lotes desde Google Sheets via Apps Script
- cotizacion PDF
- impresion
- interfaz responsive
- despliegue listo para Vercel

## 1. Estructura del Google Sheet

La hoja debe llamarse `Lotes` y usar estos encabezados:

```text
ID | ESTADO | MANZANA | NUM_LOTE | AREA | PRECIO_M2
```

## 2. Apps Script

1. Abre tu Google Sheet.
2. Ve a `Extensiones > Apps Script`.
3. Copia el contenido de `apps-script/Code.gs`.
4. Reemplaza `REEMPLAZAR_CON_TU_SPREADSHEET_ID`.
5. Implementa como `Aplicacion web`.
6. Acceso: `Cualquier usuario con el enlace`.
7. Copia la URL de despliegue.

## 3. Variables de entorno

Crea un archivo `.env` local con:

```text
VITE_LOTS_API_URL=TU_URL_DE_APPS_SCRIPT
```

## 4. Ejecutar localmente

Google Drive suele fallar al instalar `node_modules`. Para desarrollo local, copia el proyecto a una ruta como `C:\MGCalc` y ejecuta:

```bash
npm install
npm run dev
```

## 5. Publicar en Vercel

1. Sube este proyecto a GitHub.
2. Entra a Vercel y crea `New Project`.
3. Importa el repositorio.
4. Agrega la variable `VITE_LOTS_API_URL` en Vercel.
5. Deploy.

## 6. Dominio personalizado

Puedes usar un subdominio como:

```text
cotizador.malagardens.pe
```

Lo conectas desde `Project Settings > Domains` en Vercel y luego apuntas el DNS desde tu proveedor de dominio.

## 7. Sincronizacion

Los cambios en Google Sheets se reflejan en la app al recargar o usar el boton `Actualizar lotes`.

Si cambias codigo del Apps Script, debes volver a desplegar esa aplicacion web.
