"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await login(email, password);
      setError(null);
    } catch {
      setError("Inloggen mislukt");
    }
  };

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 360, margin: "4rem auto 0" }}>
        <h1 style={{ marginBottom: "1rem" }}>Inloggen</h1>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="password">Wachtwoord</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              Inloggen
            </button>
          </div>
          {error && (
            <p className="alert" role="alert">
              {error}
            </p>
          )}
        </form>
        <p style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
          Nog geen account? <Link href="/registreren">Registreren</Link>
        </p>
      </div>
    </div>
  );
}
