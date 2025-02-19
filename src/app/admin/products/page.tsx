"use client";

import { api } from "@/trpc/react";
import { numberFormat } from "@/utils/numberFormat";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import EditProductModal from "@/components/modals/EditProductModal";
import DeleteProductModal from "@/components/modals/DeleteProductModal";
import DeleteBulkProductModal from "@/components/modals/DeleteBulkProductModal";
import AddProductModal from "@/components/modals/AddProductModal";
import { type z } from "zod";
import { type productSchema } from "@/server/db/schema";

const LOW_STOCK_THRESHOLD = 10;

export default function ProductPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedProducts, setSelectedProducts] = React.useState<number[]>([]);
  const [showEditPopup, setShowEditPopup] = React.useState<number | null>(null);
  const [showDeletePopup, setShowDeletePopup] = React.useState<number | null>(null);
  const [showDeleteBulkPopup, setShowDeleteBulkPopup] = React.useState<boolean>(false);
  const [showAddPopup, setShowAddPopup] = React.useState<boolean>(false);
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof z.infer<typeof productSchema.select>, direction: "asc" | "desc" } | null>(null);
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
  }, [user, router]);

  const { data: products, isLoading, refetch } = api.products.fetchAll.useQuery(undefined, {
    retry: false
  });

  const filteredProducts = products?.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  const sortedProducts = React.useMemo(() => {
    if (!filteredProducts) return [];
    if (!sortConfig) return filteredProducts;

    return [...filteredProducts].sort((a, b) => {
      switch (sortConfig.key) {
        case "name":
          return sortConfig.direction === "asc"
            ? (a.name ?? "").localeCompare(b.name ?? "")
            : (b.name ?? "").localeCompare(a.name ?? "");
        case "price":
          const priceA = Number(a.price);
          const priceB = Number(b.price);
          return sortConfig.direction === "asc"
            ? priceA - priceB
            : priceB - priceA;
        case "stock":
          const stockA = Number(a.stock);
          const stockB = Number(b.stock);
          return sortConfig.direction === "asc"
            ? stockA - stockB
            : stockB - stockA;
        default:
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];
          if (aValue === bValue) return 0;
          if (aValue === null) return 1;
          if (bValue === null) return -1;
          return sortConfig.direction === "asc"
            ? aValue < bValue ? -1 : 1
            : aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredProducts, sortConfig]);

  const requestSort = (key: keyof z.infer<typeof productSchema.select>) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  if (user.isLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h2 className="text-4xl font-bold animate-pulse">Loading...</h2>
      </div>
    );
  }

  const totalProducts = products?.length;
  const lowStockProducts = products?.filter(p => Number(p.stock) < 10).length;

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prevSelected =>
      prevSelected.includes(productId)
        ? prevSelected.filter(id => id !== productId)
        : [...prevSelected, productId]
    );
  };

  return (
    <main className="h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
        <p className="text-sm text-gray-600">Kelola inventaris dan produk Anda</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <article className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-800">Total Produk</h2>
          <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
        </article>
        <article className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-red-500">
          <h2 className="text-lg font-semibold text-gray-800">Peringatan Stok Rendah</h2>
          <p className="text-2xl font-bold text-red-600">{lowStockProducts}</p>
        </article>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
          />
          <svg className="w-4 h-4 absolute left-2 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex gap-2">
          {selectedProducts.length > 0 && (
            <button
              onClick={() => setShowDeleteBulkPopup(true)}
              className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hapus Terpilih
            </button>
          )}
          <button
            onClick={() => setShowAddPopup(true)}
            className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Change the height calculation to add bottom padding */}
      <div className="h-[calc(100vh-270px)] bg-white rounded-lg shadow-md overflow-hidden mb-4">
        <div className="overflow-x-auto h-full relative">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0" style={{ zIndex: 1 }}>
              <tr>
                <th className="w-8 px-1 py-2 text-xs font-semibold text-gray-500 uppercase">
                  <span className="sr-only">Pilih</span>
                </th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  ID
                  <button onClick={() => requestSort("id")}>
                    {sortConfig?.key === "id" && sortConfig.direction === "asc"
                      ? (
                          <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 10l5-5 5 5H5z" />
                          </svg>
                        )
                      : (
                          <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M15 10l-5 5-5-5h10z" />
                          </svg>
                        )}
                  </button>
                </th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Nama
                  <button onClick={() => requestSort("name")}>
                    {sortConfig?.key === "name" && sortConfig.direction === "asc"
                      ? (
                          <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 10l5-5 5 5H5z" />
                          </svg>
                        )
                      : (
                          <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M15 10l-5 5-5-5h10z" />
                          </svg>
                        )}
                  </button>
                </th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Harga
                  <button onClick={() => requestSort("price")}>
                    {sortConfig?.key === "price" && sortConfig.direction === "asc"
                      ? (
                          <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 10l5-5 5 5H5z" />
                          </svg>
                        )
                      : (
                          <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M15 10l-5 5-5-5h10z" />
                          </svg>
                        )}
                  </button>
                </th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Stok
                  <button onClick={() => requestSort("stock")}>
                    {sortConfig?.key === "stock" && sortConfig.direction === "asc"
                      ? (
                          <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 10l5-5 5 5H5z" />
                          </svg>
                        )
                      : (
                          <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M15 10l-5 5-5-5h10z" />
                          </svg>
                        )}
                  </button>
                </th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedProducts?.map((product) => {
                const isLowStock = Number(product.stock) < LOW_STOCK_THRESHOLD;
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="w-8 px-1 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2 text-sm text-center">{product.id}</td>
                    <td className="px-4 py-2 text-sm text-center">{product.name}</td>
                    <td className="px-4 py-2 text-sm text-center">
                      Rp.
                      {numberFormat(product.price)}
                    </td>
                    <td className="px-4 py-2 text-sm text-center">
                      <span className={`${isLowStock ? "text-red-600 font-medium" : "text-gray-800"}`}>
                        {Number(product.stock)}
                        {isLowStock && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Stok Rendah
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => setShowEditPopup(product.id)}
                          className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Ubah
                        </button>
                        <button
                          onClick={() => setShowDeletePopup(product.id)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="relative" style={{ zIndex: 50 }}>
        {showEditPopup !== null && (
          <EditProductModal
            productId={showEditPopup}
            onClose={() => {
              setShowEditPopup(null);
              void refetch(); // Add refetch after edit
            }}
            refetch={refetch}
          />
        )}
        {showDeletePopup !== null && (
          <DeleteProductModal
            productId={showDeletePopup}
            onClose={() => {
              setShowDeletePopup(null);
              void refetch(); // Add refetch after delete
            }}
            refetch={refetch}
          />
        )}
        {showDeleteBulkPopup && (
          <DeleteBulkProductModal
            productIds={selectedProducts}
            onClose={() => {
              setShowDeleteBulkPopup(false);
              setSelectedProducts([]);
              void refetch(); // Add refetch after bulk delete
            }}
            refetch={refetch}
          />
        )}
        {showAddPopup && (
          <AddProductModal
            onClose={() => {
              setShowAddPopup(false);
              void refetch(); // Add refetch after add
            }}
            refetch={refetch}
          />
        )}
      </div>
    </main>
  );
}
