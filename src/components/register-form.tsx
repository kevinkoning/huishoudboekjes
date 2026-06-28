"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export function RegisterForm() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await signUp(email, password);
      setError(null);
    } catch {
      setError("Registreren mislukt. Gebruik een geldig e-mailadres en een wachtwoord van minimaal 6 tekens.");
    }
  };

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 360, margin: "4rem auto 0" }}>
        <h1 style={{ marginBottom: "1rem" }}>Registreren</h1>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="register-email">E-mail</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="register-password">Wachtwoord</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              Account aanmaken
            </button>
          </div>
          {error && (
            <p className="alert" role="alert">
              {error}
            </p>
          )}
        </form>
        <p style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
          Al een account? <Link href="/">Inloggen</Link>
        </p>
      </div>
    </div>
  );
}
