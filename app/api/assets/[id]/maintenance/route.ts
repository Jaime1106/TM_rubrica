import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

// GET - Obtener mantenimientos de un activo específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const maintenances = await prisma.maintenance.findMany({
      where: { assetId: params.id },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(maintenances);
  } catch (error) {
    console.error("Error al obtener mantenimientos:", error);
    return NextResponse.json(
      { error: "Error al obtener los mantenimientos" },
      { status: 500 }
    );
  }
}