"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // No mostrar navbar mientras se verifica la sesión
  if (status === "loading") {
    return null;
  }

  // No mostrar navbar si no hay sesión
  if (!session) {
    return null;
  }

  // No mostrar navbar en la página de login
  if (pathname === "/login") {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut({ 
        redirect: false,
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      window.location.href = "/login";
    }
  };

  return (
    <nav style={{
      background: "#1f2937",
      color: "white",
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "1rem"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <Link href="/dashboard" style={{
          color: "white",
          textDecoration: "none",
          fontSize: "1.25rem",
          fontWeight: "bold"
        }}>
          Tech Asset Manager
        </Link>
        
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href="/dashboard" style={{
            color: "white",
            textDecoration: "none",
            padding: "0.5rem",
            background: pathname === "/dashboard" ? "#374151" : "transparent",
            borderRadius: "4px"
          }}>
            Dashboard
          </Link>
          <Link href="/assets" style={{
            color: "white",
            textDecoration: "none",
            padding: "0.5rem",
            background: pathname === "/assets" || pathname?.startsWith("/assets/") ? "#374151" : "transparent",
            borderRadius: "4px"
          }}>
            Activos
          </Link>
          <Link href="/maintenance" style={{
            color: "white",
            textDecoration: "none",
            padding: "0.5rem",
            background: pathname === "/maintenance" ? "#374151" : "transparent",
            borderRadius: "4px"
          }}>
            Mantenimientos
          </Link>
        </div>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ fontSize: "0.875rem" }}>
          {session.user?.name || session.user?.email}
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: "#ef4444",
            color: "white",
            padding: "0.25rem 0.75rem",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.875rem"
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}