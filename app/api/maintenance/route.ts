import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

// GET - Obtener todos los mantenimientos
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const maintenances = await prisma.maintenance.findMany({
      include: {
        asset: {
          select: { name: true, type: true, serial: true }
        },
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

// POST - Crear un nuevo mantenimiento
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { assetId, date, type, description, cost, technician } = body;

    if (!assetId || !type || !description) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: activo, tipo y descripción" },
        { status: 400 }
      );
    }

    // Crear mantenimiento
    const maintenance = await prisma.maintenance.create({
      data: {
        assetId,
        date: date ? new Date(date) : new Date(),
        type,
        description,
        cost: cost ? parseFloat(cost) : null,
        technician: technician || null,
        userId: session.user.id
      },
      include: {
        asset: true
      }
    });

    // Si es mantenimiento correctivo, actualizar estado del activo
    if (type === "correctivo") {
      await prisma.asset.update({
        where: { id: assetId },
        data: { status: "IN_MAINTENANCE" }
      });
    }

    return NextResponse.json(maintenance, { status: 201 });
  } catch (error) {
    console.error("Error al crear mantenimiento:", error);
    return NextResponse.json(
      { error: "Error al crear el mantenimiento" },
      { status: 500 }
    );
  }
}