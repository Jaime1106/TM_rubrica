import Link from "next/link";

export default function Home() {
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
        padding: "3rem",
        borderRadius: "1rem",
        textAlign: "center",
        maxWidth: "500px",
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#1f2937" }}>
          Tech Asset Manager
        </h1>
        <p style={{ fontSize: "1.125rem", color: "#666", marginBottom: "1rem" }}>
          Sistema de Gestión de Activos Tecnológicos
        </p>
        <p style={{ marginBottom: "2rem", color: "#888" }}>
          Administra computadores, celulares, impresoras y más
        </p>
        <Link
          href="/login"
          style={{
            background: "#2563eb",
            color: "white",
            padding: "12px 32px",
            borderRadius: "8px",
            textDecoration: "none",
            display: "inline-block",
            fontWeight: "bold"
          }}
        >
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}