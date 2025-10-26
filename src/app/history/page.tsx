"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Calendar, Clock, Package, Trash2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, Line, LineChart, Area, AreaChart, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Order {
  id: number;
  orderNumber: number;
  quantity: number;
  status: string;
  createdAt: string;
  deletedAt?: string;
}

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [chartType, setChartType] = useState<string>("bar");

  // 利用可能な日付リスト
  const availableDates = [
    { value: "all", label: "全期間" },
    { value: "2025-10-25", label: "10月25日" },
    { value: "2025-10-26", label: "10月26日" },
  ];

  // チャートタイプのオプション
  const chartTypes = [
    { value: "bar", label: "バーチャート" },
    { value: "line", label: "ラインチャート" },
    { value: "area", label: "エリアチャート" },
  ];

  // 日付でフィルターされた注文データ
  const filteredOrders = useMemo(() => {
    if (selectedDate === "all") {
      return orders;
    }
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const jstDate = new Date(orderDate.getTime() + (9 * 60 * 60 * 1000));
      const orderDateString = jstDate.toISOString().split('T')[0];
      return orderDateString === selectedDate;
    });
  }, [orders, selectedDate]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders/history");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string, deletedAt?: string) => {
    if (deletedAt) {
      return <Badge variant="destructive">取消済み</Badge>;
    }
    
    switch (status) {
      case "pending":
        return <Badge variant="secondary">調理中</Badge>;
      case "ready":
        return <Badge variant="default">呼び出し中</Badge>;
      case "completed":
        return <Badge variant="outline">完了</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    // UTC時間に9時間を追加してJST（日本標準時）に変換
    const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    
    return {
      date: jstDate.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      time: jstDate.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getTotalOrders = () => filteredOrders.length;
  const getCompletedOrders = () => filteredOrders.filter(order => order.status === "completed").length;
  const getCancelledOrders = () => filteredOrders.filter(order => order.deletedAt).length;
  const getTotalQuantity = () => filteredOrders.reduce((sum, order) => sum + order.quantity, 0);

  // 時間帯別の注文データを生成
  const hourlyOrderData = useMemo(() => {
    const hourlyStats = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      orders: 0,
      quantity: 0,
    }));

    filteredOrders.forEach(order => {
      if (!order.deletedAt) { // 削除された注文は除外
        const date = new Date(order.createdAt);
        const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
        const hour = jstDate.getHours();
        
        hourlyStats[hour].orders += 1;
        hourlyStats[hour].quantity += order.quantity;
      }
    });

    return hourlyStats.filter(stat => stat.orders > 0); // 注文がある時間帯のみ表示
  }, [filteredOrders]);

  const chartConfig = {
    orders: {
      label: "注文数",
      color: "hsl(0, 0%, 20%)", // ダークグレー
    },
    quantity: {
      label: "提供数",
      color: "hsl(0, 0%, 50%)", // ミディアムグレー
    },
  } satisfies ChartConfig;

  // チャートタイプに応じてレンダリング
  const renderChart = () => {
    const commonProps = {
      accessibilityLayer: true,
      data: hourlyOrderData,
    };

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Line 
              dataKey="orders" 
              stroke="var(--color-orders)" 
              strokeWidth={3}
              dot={{ fill: "var(--color-orders)", strokeWidth: 2, r: 4 }}
              name="注文数"
              type="monotone"
            />
            <Line 
              dataKey="quantity" 
              stroke="var(--color-quantity)" 
              strokeWidth={3}
              dot={{ fill: "var(--color-quantity)", strokeWidth: 2, r: 4 }}
              name="提供数"
              type="monotone"
            />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Area 
              dataKey="orders" 
              fill="var(--color-orders)" 
              stroke="var(--color-orders)"
              strokeWidth={2}
              fillOpacity={0.3}
              name="注文数"
              type="monotone"
            />
            <Area 
              dataKey="quantity" 
              fill="var(--color-quantity)" 
              stroke="var(--color-quantity)"
              strokeWidth={2}
              fillOpacity={0.3}
              name="提供数"
              type="monotone"
            />
          </AreaChart>
        );

      default: // bar
        return (
          <BarChart {...commonProps}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar 
              dataKey="orders" 
              fill="var(--color-orders)" 
              radius={4}
              name="注文数"
            />
            <Bar 
              dataKey="quantity" 
              fill="var(--color-quantity)" 
              radius={4}
              name="提供数"
            />
          </BarChart>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-2" />
                管理画面に戻る
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">注文履歴</h1>
            <div className="ml-auto">
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="日付を選択" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map((date) => (
                    <SelectItem key={date.value} value={date.value}>
                      {date.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">総注文数</p>
                  <p className="text-2xl font-bold text-gray-900">{getTotalOrders()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">完了済み</p>
                  <p className="text-2xl font-bold text-gray-900">{getCompletedOrders()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Trash2 className="w-6 h-6 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">取消済み</p>
                  <p className="text-2xl font-bold text-gray-900">{getCancelledOrders()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">総提供数</p>
                  <p className="text-2xl font-bold text-gray-900">{getTotalQuantity()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          {filteredOrders.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      時間帯別注文状況 
                      {selectedDate !== "all" && 
                        ` (${availableDates.find(d => d.value === selectedDate)?.label})`
                      }
                    </CardTitle>
                    <CardDescription>
                      {selectedDate === "all" 
                        ? "全期間の注文パターンを時間帯別に表示しています"
                        : "選択した日付の注文パターンを時間帯別に表示しています"
                      }
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={chartType} onValueChange={setChartType}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="チャート種類" />
                      </SelectTrigger>
                      <SelectContent>
                        {chartTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  {renderChart()}
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {selectedDate === "all" 
                ? "全期間の注文履歴" 
                : `${availableDates.find(d => d.value === selectedDate)?.label} の注文履歴`
              }
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">読み込み中...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {selectedDate === "all" 
                    ? "注文履歴がありません" 
                    : "選択した日付の注文履歴がありません"
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>注文番号</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>注文日時</TableHead>
                    <TableHead>注文時刻</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const { date, time } = formatDateTime(order.createdAt);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.orderNumber}
                        </TableCell>
                        <TableCell>{order.quantity}個</TableCell>
                        <TableCell>
                          {getStatusBadge(order.status, order.deletedAt)}
                        </TableCell>
                        <TableCell>{date}</TableCell>
                        <TableCell>{time}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}