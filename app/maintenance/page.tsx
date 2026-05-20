"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Maintenance {
  id: string;
  assetId: string;
  date: string;
  type: string;
  description: string;
  cost: number | null;
  technician: string | null;
  asset: { name: string; type: string; serial: string | null };
  user: { name: string | null };
}

export default function AllMaintenancesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchMaintenances();
    }
  }, [session]);

  const fetchMaintenances = async () => {
    try {
      const response = await fetch("/api/maintenance");
      const data = await response.json();
      setMaintenances(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeStyle = (type: string) => {
    return type === "preventivo"
      ? { background: "#dbeafe", color: "#1e40af", padding: "4px 8px", borderRadius: "4px", display: "inline-block" }
      : { background: "#fef08a", color: "#854d0e", padding: "4px 8px", borderRadius: "4px", display: "inline-block" };
  };

  const filteredMaintenances = maintenances.filter(m =>
    m.asset.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.technician && m.technician.toLowerCase().includes(search.toLowerCase())) ||
    m.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Cargando mantenimientos...</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            background: "#6b7280",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.875rem"
          }}
        >
          ← Volver al Dashboard
        </button>
      </div>

      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Todos los Mantenimientos</h1>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Buscar por activo, técnico o descripción..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
      </div>

      {filteredMaintenances.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "#f9fafb", borderRadius: "8px" }}>
          No hay mantenimientos registrados.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "white", border: "1px solid #e5e7eb" }}>
            <thead style={{ background: "#f9fafb" }}>
              <tr>
                <th style={{ padding: "12px", textAlign: "left" }}>Fecha</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Activo</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Tipo</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Descripción</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Costo</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Técnico</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Registrado por</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaintenances.map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px" }}>{new Date(m.date).toLocaleDateString()}</td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() => router.push(`/assets/${m.assetId}/maintenance`)}
                      style={{ 
                        color: "#2563eb", 
                        cursor: "pointer", 
                        background: "none", 
                        border: "none",
                        textDecoration: "underline"
                      }}
                    >
                      {m.asset.name}
                    </button>
                   </td>
                  <td style={{ padding: "12px" }}>
                    <span style={getTypeStyle(m.type)}>
                      {m.type === "preventivo" ? "Preventivo" : "Correctivo"}
                    </span>
                   </td>
                  <td style={{ padding: "12px" }}>{m.description}</td>
                  <td style={{ padding: "12px" }}>{m.cost ? `$${m.cost.toFixed(2)}` : "-"}</td>
                  <td style={{ padding: "12px" }}>{m.technician || "-"}</td>
                  <td style={{ padding: "12px" }}>{m.user?.name || "-"}</td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() => router.push(`/assets/${m.assetId}/maintenance`)}
                      style={{
                        background: "#8b5cf6",
                        color: "white",
                        padding: "4px 12px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}