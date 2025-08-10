"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, ChefHat, Clock } from "lucide-react";

interface Order {
  id: number;
  orderNumber: number;
  quantity: number;
  status: "pending" | "ready" | "completed";
  createdAt: string;
}

export default function DisplayPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const completeOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "completed" }),
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to complete order:", error);
    }
  };

  const callingOrders = orders.filter((order) => order.status === "ready");
  const preparingOrders = orders.filter((order) => order.status === "pending");

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-12 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-light text-black mb-4">呼び出し番号</h1>
          <div className="flex items-center justify-center gap-2 text-lg text-gray-500">
            <Clock className="w-5 h-5" />
            <time className="tabular-nums">
              {time.toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </time>
          </div>
        </header>

        {/* Ready for Pickup Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Volume2 className="w-8 h-8 text-black" />
              <h2 className="text-3xl font-medium text-black">呼び出し中</h2>
            </div>
          </div>

          {callingOrders.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
              {callingOrders.map((order) => (
                <div key={order.id} className="relative group">
                  <div className="aspect-square bg-black text-white rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-800 hover:scale-105">
                    <span className="text-4xl font-light tabular-nums">
                      #{order.orderNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
              <Volume2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">
                呼び出し中の注文はありません
              </p>
            </div>
          )}
        </div>

        {/* Preparing Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <ChefHat className="w-8 h-8 text-gray-600" />
              <h2 className="text-3xl font-medium text-gray-800">調理中</h2>
            </div>
          </div>

          {preparingOrders.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
              {preparingOrders.map((order) => (
                <div key={order.id} className="relative group">
                  <div className="aspect-square bg-gray-100 border-2 border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:border-gray-400 hover:bg-gray-50">
                    <span className="text-2xl font-light text-gray-700 tabular-nums">
                      #{order.orderNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
              <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500">調理中の注文はありません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
