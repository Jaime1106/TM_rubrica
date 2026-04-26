import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

// GET - Obtener un activo específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const asset = await prisma.asset.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { name: true, email: true }
        },
        maintenances: {
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!asset) {
      return NextResponse.json({ error: "Activo no encontrado" }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error al obtener activo:", error);
    return NextResponse.json(
      { error: "Error al obtener el activo" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un activo
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, brand, model, serial, purchaseDate, status, location, userId } = body;

    const asset = await prisma.asset.update({
      where: { id: params.id },
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

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error al actualizar activo:", error);
    return NextResponse.json(
      { error: "Error al actualizar el activo" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un activo
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el activo existe
    const asset = await prisma.asset.findUnique({
      where: { id: params.id }
    });

    if (!asset) {
      return NextResponse.json({ error: "Activo no encontrado" }, { status: 404 });
    }

    await prisma.asset.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Activo eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar activo:", error);
    return NextResponse.json(
      { error: "Error al eliminar el activo" },
      { status: 500 }
    );
  }
}