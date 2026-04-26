"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Asset {
  id: string;
  name: string;
  type: string;
  brand: string | null;
  model: string | null;
  serial: string | null;
  status: string;
  location: string | null;
  purchaseDate: string | null;
  user: { name: string | null; email: string | null };
}

export default function AssetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchAssets();
    }
  }, [session]);

  const fetchAssets = async () => {
    try {
      const response = await fetch("/api/assets");
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error("Error al cargar activos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este activo?")) {
      try {
        const response = await fetch(`/api/assets/${id}`, {
          method: "DELETE"
        });
        if (response.ok) {
          fetchAssets();
        } else {
          alert("Error al eliminar el activo");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(search.toLowerCase()) ||
    (asset.serial && asset.serial.toLowerCase().includes(search.toLowerCase()))
  );

  const getStatusStyle = (status: string) => {
    const styles: Record<string, React.CSSProperties> = {
      ACTIVE: { background: "#dcfce7", color: "#166534", padding: "4px 8px", borderRadius: "4px", display: "inline-block" },
      IN_MAINTENANCE: { background: "#fef08a", color: "#854d0e", padding: "4px 8px", borderRadius: "4px", display: "inline-block" },
      RETIRED: { background: "#e5e7eb", color: "#374151", padding: "4px 8px", borderRadius: "4px", display: "inline-block" },
      LOST: { background: "#fee2e2", color: "#991b1b", padding: "4px 8px", borderRadius: "4px", display: "inline-block" }
    };
    return styles[status] || styles.ACTIVE;
  };

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Cargando activos...</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      {/* Botón para volver al dashboard */}
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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Gestión de Activos</h1>
        <button
          onClick={() => router.push("/assets/new")}
          style={{
            background: "#2563eb",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          + Nuevo Activo
        </button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Buscar por nombre o serial..."
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

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "white", border: "1px solid #e5e7eb" }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Nombre</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Tipo</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Serial</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Estado</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Ubicación</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Asignado a</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((asset) => (
              <tr key={asset.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "12px" }}>{asset.name}</td>
                <td style={{ padding: "12px" }}>{asset.type}</td>
                <td style={{ padding: "12px" }}>{asset.serial || "-"}</td>
                <td style={{ padding: "12px" }}>
                  <span style={getStatusStyle(asset.status)}>
                    {asset.status.replace("_", " ")}
                  </span>
                </td>
                <td style={{ padding: "12px" }}>{asset.location || "-"}</td>
                <td style={{ padding: "12px" }}>{asset.user?.name || "-"}</td>
                <td style={{ padding: "12px" }}>
                  <button
                    onClick={() => router.push(`/assets/${asset.id}/edit`)}
                    style={{
                      background: "#10b981",
                      color: "white",
                      padding: "4px 12px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginRight: "8px"
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    style={{
                      background: "#ef4444",
                      color: "white",
                      padding: "4px 12px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}