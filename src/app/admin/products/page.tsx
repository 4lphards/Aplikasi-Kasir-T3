"use client";

import { api } from "@/trpc/react";
import { formatPrice } from "@/utils/numberFormat";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import EditProductModal from "@/components/modals/EditProductModal";
import DeleteProductModal from "@/components/modals/DeleteProductModal";
import DeleteBulkProductModal from "@/components/modals/DeleteBulkProductModal";
import AddProductModal from "@/components/modals/AddProductModal";
import { type z } from "zod";
import { type productSchema } from "@/server/db/schema";

export default function ProductPage() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedProducts, setSelectedProducts] = React.useState<number[]>([]);
  const [showEditPopup, setShowEditPopup] = React.useState<number | null>(null);
  const [showDeletePopup, setShowDeletePopup] = React.useState<number | null>(null);
  const [showDeleteBulkPopup, setShowDeleteBulkPopup] = React.useState<boolean>(false);
  const [showAddPopup, setShowAddPopup] = React.useState<boolean>(false);
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof z.infer<typeof productSchema.select>, direction: "asc" | "desc" } | null>(null);
  const itemsPerPage = 7;
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

  const { data: products, isLoading, refetch } = api.products.fetchAll.useQuery(undefined, {
    retry: false
  });

  const filteredProducts = products?.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  const sortedProducts = React.useMemo(() => {
    if (!filteredProducts) return [];
    if (!sortConfig) return filteredProducts;

    const sortProducts = (products: typeof filteredProducts, key: keyof z.infer<typeof productSchema.select>, direction: "asc" | "desc") => {
      return (products ?? []).sort((a, b) => {
        const aValue = a[key] as unknown as string | number;
        const bValue = b[key] as unknown as string | number;
        if (aValue > bValue) {
          return direction === "asc" ? 1 : -1;
        }
        if (aValue < bValue) {
          return direction === "asc" ? -1 : 1;
        }
        return 0;
      });
    };

    return sortProducts(filteredProducts, sortConfig.key, sortConfig.direction);
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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sortedProducts?.slice(startIndex, endIndex);

  const handleNextPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prevSelected =>
      prevSelected.includes(productId)
        ? prevSelected.filter(id => id !== productId)
        : [...prevSelected, productId]
    );
  };

  return (
    <main className="p-2 font-sans bg-gray-100 min-h-screen">
      {/* Smaller header with less padding */}
      <header className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-white text-center">
          Product Management Dashboard
        </h1>
      </header>

      {/* More compact statistics cards */}
      <section className="grid grid-cols-2 gap-4 mb-4">
        <article className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-800">Total Products</h2>
          <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
        </article>
        <article className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-red-500">
          <h2 className="text-lg font-semibold text-gray-800">Low Stock Alert</h2>
          <p className="text-2xl font-bold text-red-600">{lowStockProducts}</p>
        </article>
      </section>

      {/* More compact search and actions bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
          />
          <svg className="w-4 h-4 absolute left-2 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {selectedProducts.length > 0 && (
            <button
              onClick={() => setShowDeleteBulkPopup(true)}
              className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected
            </button>
          )}
          <button
            onClick={() => setShowAddPopup(true)}
            className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Table section */}
      <section className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-1 py-2 text-xs font-semibold text-gray-500 uppercase">
                <span className="sr-only">Select</span>
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
                Name
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
                Price
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
                Stock
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
              <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentProducts.map(product => (
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
                  {formatPrice(Number(product.price))}
                </td>
                <td className="px-4 py-2 text-sm text-center">{Number(product.stock)}</td>
                <td className="px-4 py-2 text-sm text-center">
                  <div className="flex justify-center gap-1">
                    <button
                      onClick={() => setShowEditPopup(product.id)}
                      className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeletePopup(product.id)}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="flex justify-between items-center mt-4 bg-white p-3 rounded-lg shadow-md text-sm">
        <span className="text-gray-600">
          Page
          {" "}
          {currentPage}
          {" "}
          of
          {" "}
          {Math.ceil((filteredProducts?.length ?? 0) / itemsPerPage)}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            className="px-3 py-1 rounded bg-gray-500 text-white text-sm hover:bg-gray-600 disabled:opacity-50"
            disabled={currentPage <= 1}
          >
            First
          </button>
          <button
            onClick={handlePreviousPage}
            className="px-3 py-1 rounded bg-gray-500 text-white text-sm hover:bg-gray-600 disabled:opacity-50"
            disabled={currentPage <= 1}
          >
            {"<"}
          </button>
          <button
            onClick={handleNextPage}
            className="px-3 py-1 rounded bg-gray-500 text-white text-sm hover:bg-gray-600 disabled:opacity-50"
            disabled={endIndex >= (filteredProducts?.length ?? 0)}
          >
            {">"}
          </button>
          <button
            onClick={() => setCurrentPage(Math.ceil((filteredProducts?.length ?? 0) / itemsPerPage))}
            className="px-3 py-1 rounded bg-gray-500 text-white text-sm hover:bg-gray-600 disabled:opacity-50"
            disabled={endIndex >= (filteredProducts?.length ?? 0)}
          >
            Last
          </button>
        </div>
      </div>

      {showEditPopup !== null && (
        <EditProductModal
          productId={showEditPopup}
          onClose={() => setShowEditPopup(null)}
          refetch={refetch}
        />
      )}
      {showDeletePopup !== null && (
        <DeleteProductModal
          productId={showDeletePopup}
          onClose={() => setShowDeletePopup(null)}
          refetch={refetch}
        />
      )}
      {showDeleteBulkPopup && (
        <DeleteBulkProductModal
          productIds={selectedProducts}
          onClose={() => {
            setShowDeleteBulkPopup(false);
            setSelectedProducts([]);
          }}
          refetch={refetch}
        />
      )}
      {showAddPopup && (
        <AddProductModal
          onClose={() => setShowAddPopup(false)}
          refetch={refetch}
        />
      )}
    </main>
  );
}
