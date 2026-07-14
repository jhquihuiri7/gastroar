# GastroAR

Carta web de restaurante con una experiencia progresiva para explorar cada plato: AR nativa cuando el dispositivo la soporta, un modo de cámara compatible cuando no, y un visor 3D como último nivel. Se abre desde el QR de la mesa y no requiere instalar una app.

Stack: Next.js 16 (App Router, `output: "standalone"`), React 19 y `<model-viewer>` 4.3.

---

## Experiencia progresiva

La interfaz ofrece dos acciones distintas:

- **Ver en 3D** abre directamente el visor orbitable.
- **Ver en mi mesa** intenta los niveles de la tabla en orden.

| Nivel | Implementación | Qué ofrece |
| --- | --- | --- |
| 1. AR real | `<model-viewer ar>` con `ar-modes="webxr scene-viewer quick-look"` | Detección de superficies y colocación espacial mediante WebXR, Scene Viewer o Quick Look, según el dispositivo. |
| 2. AR Lite | `getUserMedia()` + vídeo de la cámara + modelo 3D superpuesto | Colocación visual manual: mover, girar y cambiar el tamaño del plato. |
| 3. Visor 3D | `<model-viewer camera-controls>` | Modelo orbitable y ampliable sin usar la cámara. |

Un plato sin modelo no simula la experiencia: sus acciones 3D/AR aparecen deshabilitadas y la carta indica que el modelo está en producción.

### Nivel 1: AR real

`src/components/experience/RealArLauncher.tsx` carga el GLB, comprueba si `<model-viewer>` puede activar AR y delega en el primer modo disponible:

- **WebXR** mantiene la sesión dentro del navegador cuando existe soporte `immersive-ar`.
- **Scene Viewer** abre el visor compatible de Android cuando WebXR no está disponible.
- **Quick Look** abre el visor AR de iOS, basado en ARKit.

La colocación usa `ar-placement="floor"` para superficies horizontales y `ar-scale="auto"`, por lo que la escala y el origen correctos deben venir del archivo 3D.

La pantalla expone progreso de carga, reintento ante error y una acción visible para pasar a AR Lite. Si la activación AR se declara incompatible o emite un fallo, el flujo cambia automáticamente al nivel compatible.

#### Límites importantes en iOS

Quick Look es una interfaz nativa del sistema, fuera del DOM de la página. Desde una web no se pueden sustituir sus controles ni colocar dentro de ella el HUD, los textos o los botones propios de GastroAR.

Tampoco existe un callback web fiable para todos los resultados al cerrar Quick Look. Algunos fallos de apertura o conversión pueden ser silenciosos; por eso la página mantiene alternativas explícitas para abrir AR Lite o el visor 3D. Estas limitaciones solo pueden validarse de forma concluyente en Safari sobre un iPhone o iPad físico.

### Nivel 2: AR Lite

`src/components/experience/ArLiteExperience.tsx` solicita la cámara trasera con:

```ts
navigator.mediaDevices.getUserMedia({
  audio: false,
  video: { facingMode: { ideal: "environment" } },
});
```

El vídeo ocupa el fondo y el modelo se renderiza encima. El usuario lo coloca en la retícula y dispone de controles manuales para moverlo, girarlo, hacerlo más pequeño o más grande y restablecer la composición.

AR Lite **no es AR espacial**: no ejecuta SLAM, no detecta planos, no crea un anclaje persistente, no calcula automáticamente la escala real y no ofrece oclusión con objetos del entorno. Es una previsualización compatible sobre la imagen de cámara y se presenta como tal en la interfaz.

La cámara se detiene al salir del modo, al perder la pista o al abandonar la página. Los fallos se clasifican como permiso no autorizado, cámara ausente, cámara ocupada, contexto inseguro o error desconocido. Cuando la cámara no puede iniciarse, el flujo cae al visor 3D; los casos recuperables ofrecen reintento.

En una web normal no existe una URL segura y universal para abrir directamente los ajustes de cámara de iOS. El proyecto solo muestra **Abrir ajustes** si un contenedor nativo proporciona este bridge opcional:

```js
window.webkit.messageHandlers.openSettings.postMessage(null);
```

Sin ese bridge se muestran instrucciones para revisar el permiso en el navegador, sin fingir que se pueden abrir los ajustes.

### Nivel 3: visor 3D

`src/components/experience/Viewer3D.tsx` carga el mismo GLB con controles de órbita y zoom. Es la salida segura cuando el usuario elige **Ver en 3D**, el dispositivo no puede usar cámara/AR, se deniega el permiso o falla un nivel anterior. La carga usa progreso real, timeout, estado de error y reintento.

El orquestador de los tres niveles está en `src/components/screens/ArViewScreen.tsx`. El registro y el ciclo de carga de `<model-viewer>` se centralizan en `src/hooks/useModelViewer.ts`; la solicitud y limpieza de cámara están en `src/lib/camera.ts`.

---

## Datos y cobertura de modelos

En `src/lib/menu-data.ts`, cada plato puede declarar:

```ts
imageUrl?: string;      // fotografía de tarjeta/detalle
modelGlbUrl?: string;   // GLB para visor 3D, AR Lite y AR real
modelUsdzUrl?: string;  // USDZ opcional para Quick Look en iOS
```

Estado actual:

- Solo `scallops` tiene fotografía y GLB: `/assets/object.glb?v=20260713`.
- Los otros 12 platos todavía no tienen modelo 3D.
- No hay ningún USDZ propio en el repositorio.

Cuando `modelUsdzUrl` no existe, `<model-viewer>` puede convertir el GLB a USDZ en el dispositivo para Quick Look. Esa conversión en runtime es una ayuda, no una garantía de paridad: materiales, texturas, tiempo de conversión y escala deben probarse en iOS real. Para producción es recomendable exportar y validar un USDZ por plato, servirlo con el MIME correcto y asignarlo explícitamente a `modelUsdzUrl`.

No se debe declarar una ruta USDZ inexistente: Quick Look puede fallar sin mostrar un error útil.

### Caché y versionado

Los modelos se sirven con `Cache-Control: public, max-age=31536000, immutable`. Si se reemplaza un archivo manteniendo el mismo nombre, hay que cambiar la versión de su URL en `menu-data.ts`:

```ts
modelGlbUrl: "/assets/object.glb?v=20260713";
```

En la siguiente publicación se incrementa `v` —o se renombra el archivo— para impedir que el navegador reutilice el modelo anterior.

---

## Cabeceras y despliegue

`next.config.ts` aplica estas cabeceras:

- `Permissions-Policy: camera=(self), xr-spatial-tracking=(self)` en todas las rutas.
- `Content-Type: model/gltf-binary` para `.glb`.
- `Content-Type: model/vnd.usdz+zip` para `.usdz`.
- Caché inmutable para ambos formatos.
- `X-Content-Type-Options: nosniff` y una política de referencia restrictiva.

`headers()` se evalúa antes que los archivos de `/public`, así que también cubre los modelos estáticos. El Dockerfile copia `/public` al runtime standalone y arranca el servidor de Next; estas cabeceras siguen aplicándose en Cloud Run.

AR real y `getUserMedia()` requieren un contexto seguro. En producción debe utilizarse HTTPS y no debe haber un proxy o CDN que elimine las cabeceras anteriores.

---

## Modelos 3D

- `assets-src/object.glb`: master sin optimizar (aprox. 8,5 MB). No se despliega porque está excluido en `.dockerignore`.
- `public/assets/object.glb`: archivo servido al cliente (aprox. 665 KB).

### Optimización reproducible

```bash
npm run model:optimize
```

El script ejecuta:

```bash
npx --yes @gltf-transform/cli@4 optimize \
  assets-src/object.glb public/assets/object.glb \
  --compress quantize --texture-compress webp --texture-size 2048 --simplify false
```

Resultado observado: **8,5 MB → 665 KB (aprox. 12,9×)**, sin degradación visual evidente.

- El peso original estaba concentrado en tres texturas PNG de 2048²; por eso la mayor mejora viene de WebP.
- Se usa `quantize` (`KHR_mesh_quantization`) para evitar depender de un decoder externo en tiempo de ejecución.
- No se usa `meshopt`: con la integración actual de `<model-viewer>` el archivo requeriría registrar su decoder antes de cargar.
- No se usa Draco para evitar descargar un decoder externo en la red del restaurante.
- `--simplify false` conserva la silueta del escaneo de fotogrametría, cuya malla ya es relativamente pequeña.

### Escala y origen

El master fue inspeccionado con `gltf-transform`: está expresado en metros y su origen se encuentra en la base (`bboxMin.y = 0`), lo esperado para `ar-placement="floor"`.

Dimensiones reportadas: **7,2 cm × 16,9 cm × 7,2 cm** (ancho × alto × fondo). Estas medidas y la escala percibida deben verificarse con el plato físico antes de publicar el modelo.

---

## Probar en un dispositivo

Desde otro equipo de la red, `http://localhost` no es un contexto seguro. Para desarrollo local:

```bash
npm run dev:https
```

Después abre `https://<IP-del-equipo>:3000` desde el teléfono conectado a la misma red. El certificado de desarrollo puede requerir confianza manual y iOS puede rechazarlo; para una prueba representativa es preferible usar un despliegue o túnel HTTPS con certificado válido.

### Matriz mínima de pruebas

| Caso | Acción | Resultado esperado |
| --- | --- | --- |
| iPhone/iPad + Safari, Quick Look disponible | Ver en mi mesa → abrir AR real | Se abre la UI nativa de Quick Look; al volver, la página continúa operativa y conserva las alternativas. |
| iPhone/iPad con fallo silencioso de Quick Look | Usar AR Lite | Se solicita cámara y aparece la composición manual sobre vídeo. |
| Android + Chrome con WebXR/ARCore | Ver en mi mesa → abrir AR real | Sesión WebXR y colocación espacial dentro del navegador. |
| Android sin WebXR, con Scene Viewer | Ver en mi mesa → abrir AR real | Se abre Scene Viewer; al regresar, la página sigue utilizable. |
| Dispositivo sin AR nativa pero con cámara | Ver en mi mesa | El flujo ofrece o activa AR Lite. |
| Permiso de cámara denegado | Entrar en AR Lite | Mensaje específico, ayuda/reintento cuando corresponde y fallback al visor 3D. |
| Cámara ocupada o pista interrumpida | Entrar o permanecer en AR Lite | La cámara se libera y el flujo pasa al visor 3D con explicación. |
| Escritorio | Ver en 3D | Modelo orbitable con zoom, sin solicitar cámara. |
| Plato sin `modelGlbUrl` | Ver la tarjeta o el detalle | Acciones 3D/AR deshabilitadas y aviso de modelo en producción. |

El anclaje, la detección de plano, la escala percibida, el permiso, la vuelta desde visores nativos y el comportamiento de Safari/Quick Look **requieren un teléfono o tableta físico**. Un emulador no reproduce de forma fiable la cámara, los sensores ni los launchers AR del sistema.

---

## Desarrollo y validación

```bash
npm run dev          # servidor HTTP para desarrollo general
npm run dev:https    # HTTPS experimental para probar cámara/AR en red local
npm run lint
npx tsc --noEmit --incremental false
npm run build
npm run start        # sirve el build de producción
```

Antes de desplegar un modelo nuevo:

1. Optimizar el GLB y comprobarlo en el visor 3D.
2. Verificar dimensiones, origen y orientación contra el plato real.
3. Probar AR Lite y cada launcher nativo disponible en dispositivos físicos.
4. Validar materiales en Quick Look; si la conversión runtime no es suficiente, exportar un USDZ propio.
5. Incrementar la versión `?v=...` y confirmar MIME, caché y `Permissions-Policy` en el entorno publicado.

---

## Consola multi-tenant (`/admin`) y cartas por restaurante (`/r/[slug]`)

Además de la carta estática de `/` (documentada arriba), la app incluye una consola de administración donde cualquier restaurante puede registrarse, cargar su menú con assets AR propios y publicarlo en su propia URL. Resumen de la arquitectura:

- **Auth**: Firebase Authentication (email/password) + cookie de sesión httpOnly verificada en `src/proxy.ts` (el `middleware.ts` de versiones anteriores de Next.js) para todo `/admin/**`.
- **Datos**: Firestore — `restaurants/{slug}` (slug = ID del documento) con subcolección `dishes`. Toda la escritura pasa por `src/lib/restaurants.ts` y revalida ownership en cada API route (`src/lib/admin-auth.ts`), no solo en el proxy.
- **Assets AR**: subida directa del navegador a Google Cloud Storage vía URLs firmadas v4 (`src/app/api/admin/uploads/`), sin pasar el archivo por el servidor de la app.
- **Carta pública**: `src/app/r/[slug]/page.tsx` resuelve el restaurante y renderiza `TenantGastroApp`, la misma UI/lógica AR de `GastroApp.tsx` pero recibiendo el menú por props en vez del `DISHES` hardcodeado.

El detalle de decisiones de diseño (por qué subcolección y no array embebido, por qué slug como ID, etc.) vive en el plan de implementación original de esta feature, no se duplica aquí.

### Poner en marcha el entorno

1. Crear un proyecto Firebase (Auth + Firestore Native) y un bucket de GCS.
2. Copiar `.env.example` a `.env.local` y completarlo. Para firmar URLs de subida en local hace falta la key de una service account con `roles/storage.admin` (ver comentario en `.env.example`) — en Cloud Run no hace falta, la identidad del servicio firma de forma nativa.
3. `npm run seed:demo -- <tuUid>` — migra el menú hardcodeado de `menu-data.ts` como el restaurante `demo`, para probar el flujo con datos reales antes de dar de alta un restaurante desde cero. `<tuUid>` es el UID de tu cuenta (Firebase Console → Authentication, o créala en `/admin/signup`) para que el restaurante aparezca en tu panel.
4. `npm run dev` y entra a `/admin/signup` (o visita `/r/demo` directamente si corriste el seed).

### Deploy

`deploy.sh` construye y despliega a Cloud Run en dos pasos:

1. `gcloud builds submit --config cloudbuild.yaml` construye la imagen. Las variables `NEXT_PUBLIC_FIREBASE_*` se pasan como `--build-arg` (vía `cloudbuild.yaml`), porque Next.js las incrusta en el bundle del cliente durante `next build`, no en tiempo de ejecución. **Importante**: `gcloud run deploy --source --set-build-env-vars` solo llega a builds con buildpacks, no a un build con Dockerfile — se ignora en silencio ahí, por eso el build explícito con `cloudbuild.yaml`.
2. `gcloud run deploy --image` despliega esa imagen ya construida, con `FIREBASE_PROJECT_ID`/`GCS_BUCKET_NAME` como env vars de runtime.

El servicio corre con la cuenta de servicio `firebase-adminsdk-fbsvc@<proyecto>.iam.gserviceaccount.com` (creada automáticamente por Firebase), que ya tiene los roles necesarios para Firestore, Auth admin y firmar URLs de GCS sin necesidad de una key en producción.

### CORS del bucket

El navegador sube los assets directo a GCS (`AssetUploader.tsx` hace un `PUT` con `XMLHttpRequest` a la URL firmada) y `<model-viewer>` los lee luego con `fetch()` para poder mostrar progreso — ambas cosas son peticiones cross-origin desde el dominio de la app hacia `storage.googleapis.com`, así que el bucket necesita CORS explícito o el navegador las bloquea en el preflight.

`gcs-cors.json` (repo root) define las reglas: `GET`/`HEAD` abiertos a cualquier origen (son assets públicos de cartas, sin credenciales) y `PUT` restringido a los orígenes conocidos de la app. Aplicar o actualizar:

```bash
gcloud storage buckets update gs://<bucket> --cors-file=gcs-cors.json
```

Si cambia la URL del servicio de Cloud Run (nuevo dominio, dominio propio, etc.), hay que agregarla a la lista `origin` del bloque `PUT` en `gcs-cors.json` y reaplicar.
