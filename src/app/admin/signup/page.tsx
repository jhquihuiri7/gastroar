"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { auth } from "@/lib/firebase-client";
import { exchangeSessionCookie, firebaseAuthErrorMessage } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();
      await exchangeSessionCookie(idToken);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(firebaseAuthErrorMessage(err));
      setPending(false);
    }
  }

  return (
    <div className="admin-auth">
      <div className="admin-auth__card">
        <h1 className="admin-auth__title">Crear cuenta</h1>
        <p className="admin-auth__subtitle">Registra tu cuenta para dar de alta tu restaurante.</p>

        {error && <div className="admin-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="admin-field">
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Creando…" : "Crear cuenta"}
          </button>
        </form>

        <div className="admin-auth__switch">
          ¿Ya tienes cuenta? <a href="/admin/login">Inicia sesión</a>
        </div>
      </div>
    </div>
  );
}
