import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

// GET - Obtener todos los activos
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const assets = await prisma.asset.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error("Error al obtener activos:", error);
    return NextResponse.json(
      { error: "Error al obtener los activos" },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo activo
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, brand, model, serial, purchaseDate, status, location, userId } = body;

    // Validar campos requeridos
    if (!name || !type || !status) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: nombre, tipo y estado" },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.create({
      data: {
        name,
        type,
        brand: brand || null,
        model: model || null,
        serial: serial || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        status,
        location: location || null,
        userId: userId || session.user.id
      }
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("Error al crear activo:", error);
    return NextResponse.json(
      { error: "Error al crear el activo" },
      { status: 500 }
    );
  }
}