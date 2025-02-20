"use client";

import { api } from "@/trpc/react";
import React, { useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { numberFormat } from "@/utils/numberFormat";
import { useRouter } from "next/navigation";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const router = useRouter();
  const user = api.session.read.useQuery(undefined, {
    retry: false
  });

  const product = api.products.fetchAll.useQuery(undefined, {
    retry: false
  });

  const dailySales = api.sales.fetchDailySales.useQuery(undefined, {
    retry: false
  });

  const salesNow = api.sales.fetchSalesNow.useQuery(undefined, {
    retry: false
  });

  const totalProduct = product.data?.length;

  const totalProductsSoldToday = salesNow.data?.productSold?.totalQuantity;

  useEffect(() => {
    if (user.error || user.isError) {
      router.push("/login");
    }
    else if (user.isLoading) {
      return;
    }
  }, [user, router]);

  if (user.isLoading || product.isLoading || dailySales.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h2 className="text-4xl font-bold animate-pulse">Loading...</h2>
      </div>
    );
  }

  const salesData = {
    labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
    datasets: [
      {
        label: "Penjualan",
        data: dailySales.data ?? [0, 0, 0, 0, 0, 0, 0],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const
      },
      title: {
        display: true,
        text: "Ringkasan Penjualan"
      }
    }
  };

  return (
    <main className="h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Selamat datang kembali,
          {" "}
          {user.data?.name}
          !
        </h1>
        <p className="text-sm text-gray-600">Berikut adalah yang terjadi di toko hari ini.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Produk</h3>
              <p className="text-xl font-bold text-gray-800">{totalProduct}</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Penjualan Hari Ini</h3>
              <p className="text-xl font-bold text-gray-800">{salesNow.data?.salesData.length ?? 0}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Produk Terjual Hari Ini</h3>
              <p className="text-xl font-bold text-gray-800">{numberFormat(totalProductsSoldToday)}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Pendapatan Hari Ini</h3>
              <p className="text-xl font-bold text-gray-800">
                Rp.
                {" "}
                {numberFormat(salesNow.data?.TotalPrice?.totalPrice)}
              </p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-[calc(100vh-220px)]">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Ringkasan Penjualan</h3>
          <div className="w-full h-[calc(100%-2rem)]">
            <Line
              data={salesData}
              options={{
                ...options,
                maintainAspectRatio: false,
                plugins: {
                  ...options.plugins,
                  legend: {
                    ...options.plugins.legend,
                    labels: {
                      boxWidth: 10,
                      font: {
                        size: 11
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    ticks: {
                      font: {
                        size: 10
                      }
                    }
                  },
                  y: {
                    ticks: {
                      font: {
                        size: 10
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Aktivitas Terbaru</h3>
          <div className="space-y-2 overflow-y-auto h-[calc(100%-2rem)]">
            {salesNow.data?.salesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((sale, index) => (
              <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-medium text-gray-800">
                      Penjualan
                      {" "}
                      {Number(sale.totalQuantity)}
                      {" "}
                      produk
                    </p>
                    <p className="text-xs font-semibold text-green-600">
                      Rp.
                      {" "}
                      {numberFormat(sale.totalPrice)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {Math.floor((Date.now() - new Date(sale.createdAt).getTime()) / (1000 * 60)) > 59
                      ? `${Math.floor((Date.now() - new Date(sale.createdAt).getTime()) / (1000 * 60 * 60))} jam`
                      : `${Math.floor((Date.now() - new Date(sale.createdAt).getTime()) / (1000 * 60))} menit`}
                    {" "}
                    yang lalu
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
