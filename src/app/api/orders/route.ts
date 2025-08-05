import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database";

// 注文一覧を取得
export async function GET() {
  try {
    const orders = db
      .prepare(
        `
      SELECT * FROM orders 
      WHERE status IN ('pending', 'ready')
      ORDER BY created_at ASC
    `
      )
      .all();

    // カラム名をキャメルケースに変換
    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      orderNumber: order.order_number,
      quantity: order.quantity,
      status: order.status,
      createdAt: order.created_at,
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 新しい注文を作成
export async function POST(request: NextRequest) {
  try {
    const { quantity } = await request.json();

    if (!quantity || quantity < 1 || quantity > 5) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    // 注文番号を取得・更新
    const getSequence = db.prepare(
      "SELECT current_number FROM order_sequence WHERE id = 1"
    );
    const updateSequence = db.prepare(
      "UPDATE order_sequence SET current_number = current_number + 1 WHERE id = 1"
    );

    const currentSeq = getSequence.get() as { current_number: number };
    const newOrderNumber = currentSeq.current_number + 1;

    updateSequence.run();

    // 注文を挿入
    const insertOrder = db.prepare(`
      INSERT INTO orders (order_number, quantity, status)
      VALUES (?, ?, 'pending')
    `);

    const result = insertOrder.run(newOrderNumber, quantity);

    return NextResponse.json({
      id: result.lastInsertRowid,
      orderNumber: newOrderNumber,
      quantity,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
