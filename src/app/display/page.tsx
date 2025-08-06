"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

interface Order {
  id: number;
  orderNumber: number;
  quantity: number;
  status: "pending" | "ready" | "completed";
  createdAt: string;
}

export default function DisplayPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  // 注文一覧を取得
  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  // 自動更新
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000); // 3秒ごとに更新
    return () => clearInterval(interval);
  }, []);

  const readyOrders = orders.filter((order) => order.status === "ready");

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 text-center">
            <h1 className="text-5xl font-bold mb-4">呼び出し番号</h1>
            <div className="text-gray-500 text-lg">
              自動更新中 - {new Date().toLocaleTimeString("ja-JP")}
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツエリア */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {readyOrders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {readyOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white text-black rounded-2xl p-8 text-center transform hover:scale-105 transition-transform duration-300 shadow-xl"
                >
                  <div className="text-7xl font-bold mb-4">
                    {order.orderNumber
                      ? order.orderNumber.toString().padStart(3, "0")
                      : "---"}
                  </div>
                  <div className="text-xl font-semibold text-gray-600">
                    {order.quantity}杯
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="text-gray-500 text-9xl mb-8 font-bold">---</div>
              <div className="text-3xl text-gray-400">
                現在、呼び出し中の注文はありません
              </div>
              <div className="text-xl text-gray-500 mt-4">
                準備ができ次第、番号を表示します
              </div>
            </div>
          )}

          {/* フッター */}
          <div className="mt-16 text-center">
            <div className="mt-4 space-x-4">
              <Link
                href="/"
                className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                注文画面へ
              </Link>
            </div>
          </div>
        </div>
        {/* メインコンテンツエリア終了 */}
      </div>

      <Footer />
    </div>
  );
}
