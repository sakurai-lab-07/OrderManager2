"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Order {
  id: number;
  orderNumber: number;
  quantity: number;
  status: "pending" | "ready" | "completed";
  createdAt: string;
}

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState<number | null>(null);

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

  // 新しい注文を作成
  const createOrder = async () => {
    if (quantity < 1 || quantity > 5) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        const newOrder = await response.json();
        setLastOrderNumber(newOrder.orderNumber);
        setQuantity(1);
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to create order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 注文ステータスを更新
  const updateOrderStatus = async (
    orderId: number,
    status: Order["status"]
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 自動更新
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // 5秒ごとに更新
    return () => clearInterval(interval);
  }, []);

  const pendingOrders = orders.filter((order) => order.status === "pending");
  const readyOrders = orders.filter((order) => order.status === "ready");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                学祭屋台注文システム
              </h1>
              <p className="text-gray-600 mt-2">担々麺専門店</p>
            </div>
            <a
              href="/display"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              ディスプレイ専用
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">調理中</h3>
            <div className="text-3xl font-bold text-orange-600">
              {pendingOrders.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              呼び出し中
            </h3>
            <div className="text-3xl font-bold text-green-600">
              {readyOrders.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              総注文数
            </h3>
            <div className="text-3xl font-bold text-blue-600">
              {orders.length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 注文作成フォーム */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              新規注文
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商品
                </label>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
                  <span className="text-lg font-medium text-gray-800">
                    担々麺
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  数量 (最大5個)
                </label>
                <Select
                  value={quantity.toString()}
                  onValueChange={(value) => setQuantity(Number(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="数量を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}個
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={createOrder}
                disabled={isLoading}
                className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "注文中..." : "注文する"}
              </Button>

              {/* 注文完了メッセージ */}
              {lastOrderNumber && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <div className="text-green-800 font-semibold">注文完了！</div>
                  <div className="text-xl font-bold text-green-900 mt-1">
                    番号: {lastOrderNumber.toString().padStart(3, "0")}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 調理中の注文 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              調理中
            </h2>

            {pendingOrders.length > 0 ? (
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xl font-bold text-gray-900">
                          {order.orderNumber
                            ? order.orderNumber.toString().padStart(3, "0")
                            : "---"}
                        </div>
                        <div className="text-gray-600">{order.quantity}個</div>
                        <div className="text-sm text-gray-500">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleTimeString(
                                "ja-JP"
                              )
                            : "--:--:--"}
                        </div>
                      </div>
                      <button
                        onClick={() => updateOrderStatus(order.id, "ready")}
                        disabled={isLoading}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        調理完了
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                調理中の注文はありません
              </div>
            )}
          </div>

          {/* 呼び出し中の注文 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              呼び出し中
            </h2>

            {readyOrders.length > 0 ? (
              <div className="space-y-4">
                {readyOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-green-200 bg-green-50 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xl font-bold text-green-800">
                          {order.orderNumber
                            ? order.orderNumber.toString().padStart(3, "0")
                            : "---"}
                        </div>
                        <div className="text-green-700">{order.quantity}個</div>
                        <div className="text-sm text-green-600">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleTimeString(
                                "ja-JP"
                              )
                            : "--:--:--"}
                        </div>
                      </div>
                      <button
                        onClick={() => updateOrderStatus(order.id, "completed")}
                        disabled={isLoading}
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        受け取り完了
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                呼び出し中の注文はありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
