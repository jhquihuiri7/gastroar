import type { NextConfig } from "next";

// Cache-Control para los modelos 3D. Si cambia un modelo, renombra el archivo o
// incrementa la versión de su URL en menu-data.ts.
const MODEL_CACHE = "public, max-age=31536000, immutable";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Genera .next/standalone con un server.js mínimo para contenedores (Cloud Run).
  output: "standalone",

  // headers() se evalúa ANTES del filesystem (incluido /public), así que aquí es
  // donde forzamos el Content-Type de los modelos. Sin esto Quick Look (iOS) puede
  // fallar en silencio: Safari solo abre el visor AR si el .usdz llega con
  // model/vnd.usdz+zip, y el server estático de Next no conoce estas extensiones.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Permissions-Policy", value: "camera=(self), xr-spatial-tracking=(self)" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/:path(.*\\.glb)",
        headers: [
          { key: "Content-Type", value: "model/gltf-binary" },
          { key: "Cache-Control", value: MODEL_CACHE },
        ],
      },
      {
        source: "/:path(.*\\.usdz)",
        headers: [
          { key: "Content-Type", value: "model/vnd.usdz+zip" },
          { key: "Cache-Control", value: MODEL_CACHE },
        ],
      },
      {
        source: "/:path(.*\\.mind)",
        headers: [
          { key: "Content-Type", value: "application/octet-stream" },
          { key: "Cache-Control", value: MODEL_CACHE },
        ],
      },
    ];
  },
};

export default nextConfig;
