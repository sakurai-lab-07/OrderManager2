import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const { id } = await params;
    const orderId = parseInt(id);

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    if (!["pending", "ready", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updateOrder = db.prepare(`
      UPDATE orders 
      SET status = ? 
      WHERE id = ?
    `);

    const result = updateOrder.run(status, orderId);

    if (result.changes === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
