"use client";

import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const router = useRouter();
  const user = api.session.read.useQuery(undefined, {
    retry: false
  });

  useEffect(() => {
    if (user.error || user.isError) {
      router.push("/login");
    }
    else if (user.isLoading) {
      return;
    }
    else if (user.data?.level !== "admin") {
      router.push("/cashier/dashboard");
    }
  }, [user, router]);

  const product = api.products.fetchAll.useQuery(undefined, {
    retry: false
  });

  const totalProduct = product.data?.length;

  const totalStock = product.data?.reduce((acc, curr) => acc + (curr.stock ? parseInt(curr.stock, 10) : 0), 0);

  if (user.isLoading || product.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h2 className="text-4xl font-bold animate-pulse">Loading...</h2>
      </div>
    );
  }

  const salesData = {
    labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    datasets: [
      {
        label: "Sales",
        data: [1000, 1200, 1500, 1700, 2000, 2200, 2500],
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
        text: "Sales Summary"
      }
    }
  };

  return (
    <main className="p-6 font-sans bg-gray-100 min-h-screen">
      <header className="text-center mb-4">
        <h1 className="text-4xl font-extrabold text-gray-800">Admin Dashboard</h1>
      </header>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Inventory</h2>
          <p className="text-gray-600">
            Total Number of Products:
            {totalProduct}
          </p>
          <p className="text-gray-600">
            Total Stock of Products:
            {totalStock}
          </p>
        </article>
        <article className="p-6 col-span-2 row-span-2 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Line data={salesData} options={options} />
        </article>
        <article className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Transactions</h2>
          <p className="text-gray-600">Transactions Today: 30</p>
          <p className="text-gray-600">Transactions This Week: 150</p>
        </article>
      </section>
    </main>
  );
}
