"use client";

export async function exchangeSessionCookie(idToken: string): Promise<void> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    throw new Error("No se pudo crear la sesión");
  }
}

export function firebaseAuthErrorMessage(error: unknown): string {
  const code = error instanceof Error && "code" in error ? String((error as { code: string }).code) : "";
  switch (code) {
    case "auth/email-already-in-use":
      return "Ese correo ya tiene una cuenta.";
    case "auth/invalid-email":
      return "El correo no es válido.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Correo o contraseña incorrectos.";
    default:
      return "Ocurrió un error. Intenta de nuevo.";
  }
}
