"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

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
        setQuantity(1);
        fetchOrders();

        // Toast通知で注文完了を表示
        toast.success("注文が完了しました！", {
          description: `番号: ${newOrder.orderNumber
            .toString()
            .padStart(3, "0")} (${quantity}個)`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error("注文に失敗しました", {
        description: "もう一度お試しください",
      });
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

        // ステータス変更の通知
        if (status === "ready") {
          toast.success("調理完了しました！", {
            description: "お客様をお呼びしてください",
          });
        } else if (status === "completed") {
          toast.success("注文が完了しました", {
            description: "ありがとうございました",
          });
        }
      } else {
        throw new Error("Status update failed");
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("ステータス更新に失敗しました", {
        description: "もう一度お試しください",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 注文を削除（取消し）
  const deleteOrder = async (orderId: number, orderNumber: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchOrders();
        toast.success("注文を取り消しました", {
          description: `番号: ${orderNumber.toString().padStart(3, "0")}`,
          duration: 3000,
        });
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Failed to delete order:", error);
      toast.error("注文の取り消しに失敗しました", {
        description: "もう一度お試しください",
      });
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      {/* メインコンテンツエリア */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    数量 (最大5杯)
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
                          {num}杯
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={createOrder}
                  disabled={isLoading}
                  className="w-full bg-black py-3 px-4 rounded-lg font-medium disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "注文中..." : "注文する"}
                </Button>
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
                          <div className="text-gray-600">
                            {order.quantity}個
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.createdAt
                              ? (() => {
                                  const date = new Date(order.createdAt);
                                  return date.toLocaleTimeString("ja-JP", {
                                    timeZone: "Asia/Tokyo",
                                    hour12: false,
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  });
                                })()
                              : "--:--:--"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                disabled={isLoading}
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-300 px-2 py-2 hover:text-red-800 hover:bg-red-50 hover:border-red-400 disabled:cursor-not-allowed transition-colors"
                              >
                                取消
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  注文を取り消しますか？
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  注文番号{" "}
                                  {order.orderNumber
                                    .toString()
                                    .padStart(3, "0")}{" "}
                                  を取り消します。
                                  <br />
                                  この操作は取り消せません。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  キャンセル
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteOrder(order.id, order.orderNumber)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  はい
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button
                            onClick={() => updateOrderStatus(order.id, "ready")}
                            disabled={isLoading}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:cursor-not-allowed transition-colors"
                          >
                            調理完了
                          </Button>
                        </div>
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
                          <div className="text-green-700">
                            {order.quantity}個
                          </div>
                          <div className="text-sm text-green-600">
                            {order.createdAt
                              ? (() => {
                                  const date = new Date(order.createdAt);
                                  return date.toLocaleTimeString("ja-JP", {
                                    timeZone: "Asia/Tokyo",
                                    hour12: false,
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  });
                                })()
                              : "--:--:--"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                disabled={isLoading}
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-300 px-2 py-2 hover:text-red-800 hover:bg-red-50 hover:border-red-400 disabled:cursor-not-allowed transition-colors"
                              >
                                取消
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  注文を取り消しますか？
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  注文番号{" "}
                                  {order.orderNumber
                                    .toString()
                                    .padStart(3, "0")}{" "}
                                  を取り消します。
                                  <br />
                                  この操作は取り消せません。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  キャンセル
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteOrder(order.id, order.orderNumber)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  取り消し
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button
                            onClick={() =>
                              updateOrderStatus(order.id, "completed")
                            }
                            disabled={isLoading}
                            className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg disabled:cursor-not-allowed transition-colors"
                          >
                            受け取り完了
                          </Button>
                        </div>
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
        {/* メインコンテンツエリア終了 */}
      </div>

      <Footer />
    </div>
  );
}
