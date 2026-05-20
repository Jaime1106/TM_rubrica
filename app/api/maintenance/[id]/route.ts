import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await prisma.maintenance.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Mantenimiento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar mantenimiento:", error);
    return NextResponse.json(
      { error: "Error al eliminar el mantenimiento" },
      { status: 500 }
    );
  }
}