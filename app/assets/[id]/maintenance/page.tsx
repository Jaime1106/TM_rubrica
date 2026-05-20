"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Maintenance {
  id: string;
  date: string;
  type: string;
  description: string;
  cost: number | null;
  technician: string | null;
  user: { name: string | null };
}

export default function AssetMaintenancePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "preventivo",
    date: new Date().toISOString().split('T')[0],
    description: "",
    cost: "",
    technician: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchAsset();
      fetchMaintenances();
    }
  }, [session]);

  const fetchAsset = async () => {
    try {
      const response = await fetch(`/api/assets/${params.id}`);
      const data = await response.json();
      setAsset(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchMaintenances = async () => {
    try {
      const response = await fetch(`/api/assets/${params.id}/maintenance`);
      const data = await response.json();
      setMaintenances(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: params.id,
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : null
        })
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          type: "preventivo",
          date: new Date().toISOString().split('T')[0],
          description: "",
          cost: "",
          technician: ""
        });
        fetchMaintenances();
        fetchAsset(); // Actualizar estado del activo
      } else {
        alert("Error al registrar mantenimiento");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al registrar mantenimiento");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este registro de mantenimiento?")) {
      try {
        const response = await fetch(`/api/maintenance/${id}`, {
          method: "DELETE"
        });
        if (response.ok) {
          fetchMaintenances();
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const getTypeStyle = (type: string) => {
    return type === "preventivo" 
      ? { background: "#dbeafe", color: "#1e40af", padding: "4px 8px", borderRadius: "4px", display: "inline-block" }
      : { background: "#fef08a", color: "#854d0e", padding: "4px 8px", borderRadius: "4px", display: "inline-block" };
  };

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Cargando...</div>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Botón volver */}
      <button
        onClick={() => router.back()}
        style={{
          background: "#6b7280",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "1rem"
        }}
      >
        ← Volver
      </button>

      {/* Información del activo */}
      {asset && (
        <div style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            {asset.name}
          </h1>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            <span><strong>Tipo:</strong> {asset.type}</span>
            <span><strong>Serial:</strong> {asset.serial || "N/A"}</span>
            <span><strong>Estado:</strong> 
              <span style={{
                marginLeft: "0.5rem",
                padding: "2px 8px",
                borderRadius: "4px",
                background: asset.status === "ACTIVE" ? "#dcfce7" : "#fef08a"
              }}>
                {asset.status === "ACTIVE" ? "Activo" : 
                 asset.status === "IN_MAINTENANCE" ? "En Mantenimiento" : asset.status}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Botón nuevo mantenimiento */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Historial de Mantenimientos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: "#2563eb",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          {showForm ? "Cancelar" : "+ Nuevo Mantenimiento"}
        </button>
      </div>

      {/* Formulario de mantenimiento */}
      {showForm && (
        <div style={{
          background: "#f9fafb",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          border: "1px solid #e5e7eb"
        }}>
          <h3 style={{ fontWeight: "bold", marginBottom: "1rem" }}>Registrar Mantenimiento</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Tipo *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                >
                  <option value="preventivo">Preventivo</option>
                  <option value="correctivo">Correctivo</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Fecha *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                />
              </div>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Descripción *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", minHeight: "80px" }}
                placeholder="Describa el mantenimiento realizado..."
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Costo</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Técnico</label>
                <input
                  type="text"
                  value={formData.technician}
                  onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                  placeholder="Nombre del técnico"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: submitting ? "#93c5fd" : "#2563eb",
                color: "white",
                padding: "10px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                width: "100%"
              }}
            >
              {submitting ? "Guardando..." : "Guardar Mantenimiento"}
            </button>
          </form>
        </div>
      )}

      {/* Tabla de mantenimientos */}
      {maintenances.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "3rem",
          background: "#f9fafb",
          borderRadius: "8px",
          color: "#666"
        }}>
          No hay mantenimientos registrados para este activo.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "white", border: "1px solid #e5e7eb" }}>
            <thead style={{ background: "#f9fafb" }}>
              <tr>
                <th style={{ padding: "12px", textAlign: "left" }}>Fecha</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Tipo</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Descripción</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Costo</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Técnico</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Registrado por</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {maintenances.map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px" }}>{new Date(m.date).toLocaleDateString()}</td>
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
                      onClick={() => handleDelete(m.id)}
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
      )}
    </div>
  );
}