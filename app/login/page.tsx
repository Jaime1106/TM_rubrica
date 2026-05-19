"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales incorrectas");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError("Error al iniciar sesión");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }}>
      <div style={{
        background: "white",
        padding: "2rem",
        borderRadius: "0.5rem",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        width: "24rem"
      }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", textAlign: "center" }}>
          Tech Asset Manager
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
            <input
              type="email"
              name="email"
              required
              style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "0.25rem" }}
              placeholder="jdelacru38@cuc.edu.co"
            />
          </div>
          
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Contraseña</label>
            <input
              type="password"
              name="password"
              required
              style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "0.25rem" }}
              placeholder="123456"
            />
          </div>
          
          {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "#93c5fd" : "#2563eb",
              color: "white",
              padding: "0.5rem",
              border: "none",
              borderRadius: "0.25rem",
              cursor: "pointer"
            }}
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}