import { NextRequest, NextResponse } from "next/server";
import { pool, initializeDatabase } from "@/lib/database";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();

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

    const client = await pool.connect();

    try {
      const result = await client.query(
        `
        UPDATE orders 
        SET status = $1 
        WHERE id = $2
      `,
        [status, orderId]
      );

      if (result.rowCount === 0) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 注文削除用のDELETEエンドポイント
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();

    const { id } = await params;
    const orderId = parseInt(id);

    if (!orderId) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      const result = await client.query(
        `
        DELETE FROM orders 
        WHERE id = $1
      `,
        [orderId]
      );

      if (result.rowCount === 0) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
