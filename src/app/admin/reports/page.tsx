"use client";

import { api } from "@/trpc/react";
import { formatToRupiah } from "@/utils/currencyFormat";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useState } from "react";

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerId, setCustomerId] = useState("");

  const { data: sales } = api.sales.fetchAll.useQuery(undefined, {
    retry: false
  });
  const { data: customers } = api.customers.fetchAll.useQuery(undefined, {
    retry: false
  });
  const { data: saleDetails } = api.saleDetails.fetchAll.useQuery(undefined, {
    retry: false
  });
  const { data: products } = api.products.fetchAll.useQuery(undefined, {
    retry: false
  });

  const filteredSales = sales?.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return (
      (!start || saleDate >= start)
      && (!end || saleDate <= end)
      && (!customerId || sale.customerId === parseInt(customerId))
    );
  });

  const getSaleDetails = (saleId: number) => {
    return saleDetails?.filter(detail => detail.saleId === saleId) ?? [];
  };

  const getProductName = (productId: number) => {
    return products?.find(product => product.id === productId)?.name ?? "";
  };

  const getCustomerName = (customerId: number) => {
    return customers?.find(customer => customer.id === customerId)?.name ?? "kosong";
  };

  return (
    <main className="h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Penjualan</h1>
        <p className="text-sm text-gray-600">Lihat riwayat transaksi dan analisis penjualan</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <article className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-800">Total Transaksi</h2>
          <p className="text-2xl font-bold text-blue-600">{filteredSales?.length ?? 0}</p>
        </article>
        <article className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-green-500">
          <h2 className="text-lg font-semibold text-gray-800">Total Pendapatan</h2>
          <p className="text-2xl font-bold text-green-600">
            {formatToRupiah(
              filteredSales?.reduce((sum, sale) => sum + (sale.totalPrice ?? 0), 0).toString() ?? "0"
            )}
          </p>
        </article>
        <article className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-yellow-500">
          <h2 className="text-lg font-semibold text-gray-800">Total Pelanggan</h2>
          <p className="text-2xl font-bold text-yellow-600">
            {new Set(filteredSales?.map(sale => sale.customerId).filter(id => id !== null)).size}
          </p>
        </article>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tanggal Akhir</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Pelanggan</label>
            <select
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Semua Pelanggan</option>
              {customers?.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-330px)] bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto h-full relative">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0" style={{ zIndex: 1 }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  No. Transaksi
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Detail Produk
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSales?.map(sale => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    #
                    {sale.id}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {format(new Date(sale.createdAt), "dd MMMM yyyy HH:mm", {
                      locale: id
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm">{getCustomerName(sale.customerId!)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatToRupiah(sale.totalPrice?.toString() ?? "0")}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <ul className="list-inside list-disc">
                      {getSaleDetails(sale.id).map(detail => (
                        <li key={detail.id}>
                          {getProductName(detail.productId!)}
                          {" "}
                          -
                          {detail.quantity}
                          {" "}
                          x
                          {" "}
                          {formatToRupiah(detail.price?.toString() ?? "0")}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
