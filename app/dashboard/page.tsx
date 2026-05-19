import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  // Obtener estadísticas
  const totalAssets = await prisma.asset.count();
  const activeAssets = await prisma.asset.count({ where: { status: "ACTIVE" } });
  const inMaintenance = await prisma.asset.count({ where: { status: "IN_MAINTENANCE" } });
  const retiredAssets = await prisma.asset.count({ where: { status: "RETIRED" } });
  const lostAssets = await prisma.asset.count({ where: { status: "LOST" } });

  // Obtener activos recientes
  const recentAssets = await prisma.asset.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true }
      }
    }
  });

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
        Dashboard
      </h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Bienvenido, {session.user?.name || session.user?.email}
      </p>

      {/* Tarjetas de estadísticas */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem"
      }}>
        <div style={{
          background: "#dbeafe",
          padding: "1.5rem",
          borderRadius: "0.5rem",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{totalAssets}</div>
          <div style={{ color: "#1e40af" }}>Total Activos</div>
        </div>

        <div style={{
          background: "#dcfce7",
          padding: "1.5rem",
          borderRadius: "0.5rem",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{activeAssets}</div>
          <div style={{ color: "#166534" }}>Activos Activos</div>
        </div>

        <div style={{
          background: "#fef08a",
          padding: "1.5rem",
          borderRadius: "0.5rem",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{inMaintenance}</div>
          <div style={{ color: "#854d0e" }}>En Mantenimiento</div>
        </div>

        <div style={{
          background: "#fee2e2",
          padding: "1.5rem",
          borderRadius: "0.5rem",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{retiredAssets + lostAssets}</div>
          <div style={{ color: "#991b1b" }}>Inactivos</div>
        </div>
      </div>

      {/* Últimos activos */}
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Últimos Activos Registrados
      </h2>
      
      <div style={{
        background: "white",
        borderRadius: "0.5rem",
        border: "1px solid #e5e7eb",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Nombre</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Tipo</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Estado</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Asignado a</th>
            </tr>
          </thead>
          <tbody>
            {recentAssets.map((asset) => (
              <tr key={asset.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "12px" }}>{asset.name}</td>
                <td style={{ padding: "12px" }}>{asset.type}</td>
                <td style={{ padding: "12px" }}>
                  <span style={{
                    background: asset.status === "ACTIVE" ? "#dcfce7" : 
                               asset.status === "IN_MAINTENANCE" ? "#fef08a" : "#fee2e2",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.875rem"
                  }}>
                    {asset.status === "ACTIVE" ? "Activo" :
                     asset.status === "IN_MAINTENANCE" ? "En Mantenimiento" :
                     asset.status === "RETIRED" ? "Retirado" : "Perdido"}
                  </span>
                </td>
                <td style={{ padding: "12px" }}>{asset.user?.name || "Sin asignar"}</td>
              </tr>
            ))}
            {recentAssets.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                  No hay activos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Botones de acción */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        <a
          href="/assets"
          style={{
            background: "#2563eb",
            color: "white",
            padding: "10px 20px",
            borderRadius: "4px",
            textDecoration: "none"
          }}
        >
          Ver Todos los Activos
        </a>
        <a
          href="/assets/new"
          style={{
            background: "#10b981",
            color: "white",
            padding: "10px 20px",
            borderRadius: "4px",
            textDecoration: "none"
          }}
        >
          + Registrar Nuevo Activo
        </a>
      </div>
    </div>
  );
}