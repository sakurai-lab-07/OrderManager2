"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

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
  const pendingOrders = orders.filter((order) => order.status === "pending");

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 text-center">
            <h1 className="text-5xl font-bold mb-4">呼び出し番号</h1>
            <div className="text-gray-500 text-lg">
              自動更新中 -{" "}
              {new Date().toLocaleTimeString("ja-JP", {
                timeZone: "Asia/Tokyo",
                hour12: false,
              })}
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツエリア */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* 呼び出し中の注文 */}
          {readyOrders.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center mb-6 text-green-600">
                呼び出し中
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                {readyOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-green-50 border-2 border-green-200 text-black rounded-2xl p-6 text-center transform hover:scale-105 transition-transform duration-300 shadow-xl min-h-[180px] flex flex-col justify-center"
                  >
                    <div className="text-4xl 2xl:text-5xl font-bold mb-3 text-green-800">
                      {order.orderNumber
                        ? order.orderNumber < 100
                          ? `#${order.orderNumber.toString().padStart(2, "0")}`
                          : `#${order.orderNumber.toString().padStart(3, "0")}`
                        : "---"}
                    </div>
                    <div className="text-lg 2xl:text-xl font-semibold text-green-700">
                      {order.quantity}杯
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 調理中の注文 */}
          {pendingOrders.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center mb-6 text-orange-600">
                調理中
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-orange-50 border-2 border-orange-200 text-black rounded-2xl p-6 text-center transform hover:scale-105 transition-transform duration-300 shadow-xl min-h-[180px] flex flex-col justify-center"
                  >
                    <div className="text-4xl 2xl:text-5xl font-bold mb-3 text-orange-800">
                      {order.orderNumber
                        ? order.orderNumber < 100
                          ? `#${order.orderNumber.toString().padStart(2, "0")}`
                          : `#${order.orderNumber.toString().padStart(3, "0")}`
                        : "---"}
                    </div>
                    <div className="text-lg 2xl:text-xl font-semibold text-orange-700">
                      {order.quantity}杯
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 注文がない場合 */}
          {readyOrders.length === 0 && pendingOrders.length === 0 && (
            <div className="text-center py-24">
              <div className="text-gray-500 text-9xl mb-8 font-bold">---</div>
              <div className="text-3xl text-gray-400">
                現在、注文はありません
              </div>
              <div className="text-xl text-gray-500 mt-4">
                注文が入り次第、番号を表示します
              </div>
            </div>
          )}

          {/* フッター */}
          <div className="mt-16 text-center">
            <div className="mt-4 space-x-4">
              <Button asChild>
                <Link
                  href="/"
                  className="inline-bloc text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  注文画面へ
                </Link>
              </Button>
            </div>
          </div>
        </div>
        {/* メインコンテンツエリア終了 */}
      </div>

      <Footer />
    </div>
  );
}
