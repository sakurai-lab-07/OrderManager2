"use client";

import React from "react";
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
import { Button } from "@/components/ui/button";
import { X, Megaphone } from "lucide-react";
import { Order } from "@/types/order";

interface CalloutSectionProps {
  orders: Order[];
  isLoading: boolean;
  onDeleteOrderAction: (orderId: number, orderNumber: number) => void;
  onUpdateOrderStatusAction: (orderId: number, status: Order["status"]) => void;
}

export default function CalloutSection({
  orders,
  isLoading,
  onDeleteOrderAction,
  onUpdateOrderStatusAction,
}: CalloutSectionProps) {
  const readyOrders = orders.filter((order) => order.status === "ready");

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="p-2 rounded-md bg-gray-100 text-gray-700">
          <Megaphone className="h-5 w-5" aria-hidden />
        </span>
        <h2 className="text-2xl font-semibold text-gray-800">呼び出し中</h2>
      </div>

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
                        className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 disabled:cursor-not-allowed transition-colors"
                      >
                        <X className="h-4 w-4" />
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
                          {order.orderNumber.toString().padStart(3, "0")}{" "}
                          を取り消します。
                          <br />
                          この操作は取り消せません。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            onDeleteOrderAction(order.id, order.orderNumber)
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
                      onUpdateOrderStatusAction(order.id, "completed")
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
  );
}
