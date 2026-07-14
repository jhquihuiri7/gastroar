"use client";

import { useRef, useState } from "react";

interface Props {
  restaurantId: string;
  label: string;
  accept: string;
  value: string;
  onChange: (url: string) => void;
}

export default function AssetUploader({ restaurantId, label, accept, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setProgress(0);
    try {
      const signRes = await fetch("/api/admin/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, fileName: file.name }),
      });
      const signData = await signRes.json();
      if (!signRes.ok) throw new Error(signData.error ?? "No se pudo iniciar la subida");

      await putWithProgress(signData.uploadUrl, file, signData.contentType, setProgress);

      const finalizeRes = await fetch("/api/admin/uploads/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, objectPath: signData.objectPath }),
      });
      const finalizeData = await finalizeRes.json();
      if (!finalizeRes.ok) throw new Error(finalizeData.error ?? "No se pudo confirmar la subida");

      onChange(finalizeData.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el archivo");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="admin-field">
      <label>{label}</label>
      {value && (
        <div className="admin-uploader__value">
          <a href={value} target="_blank" rel="noreferrer">
            {value.split("/").pop()}
          </a>
          <button type="button" className="btn-small btn-danger-outline" onClick={() => onChange("")}>
            Quitar
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      {progress !== null && <div className="admin-uploader__progress">Subiendo… {progress}%</div>}
      {error && <div className="admin-error">{error}</div>}
    </div>
  );
}

function putWithProgress(
  url: string,
  file: File,
  contentType: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.setRequestHeader("x-goog-content-length-range", "0,52428800");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Subida falló (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Subida falló"));
    xhr.send(file);
  });
}
