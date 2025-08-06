"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* デスクトップレイアウト */}
          <div className="hidden sm:flex relative items-center">
            <div className="absolute inset-0 flex justify-center items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Order Management
              </h1>
            </div>
            <div className="ml-auto relative z-10">
              <Button asChild>
                <Link
                  href="/display"
                  className="bg-neutral-800 text-white px-4 py-2 rounded-lg hover:bg-neutral-700 transition-colors text-sm"
                >
                  ディスプレイ専用
                </Link>
              </Button>
            </div>
          </div>

          {/* モバイルレイアウト */}
          <div className="sm:hidden space-y-4">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Order Management
              </h1>
            </div>
            <div className="flex justify-center">
              <Button asChild>
                <Link
                  href="/display"
                  className="bg-neutral-800 text-white px-4 py-2 rounded-lg hover:bg-neutral-700 transition-colors text-sm"
                >
                  ディスプレイ専用
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
