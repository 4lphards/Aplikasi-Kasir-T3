"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { formatToRupiah, parseRupiahToNumber } from "@/utils/currencyFormat";

interface EditProductModalProps {
  productId: number
  onClose: () => void
  refetch: () => void
}

export default function EditProductModal({ productId, onClose, refetch }: EditProductModalProps) {
  const { data: product } = api.products.fetchById.useQuery({ id: productId });
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  useEffect(() => {
    if (product) {
      setName(product.name ?? "");
      setPrice(formatToRupiah(product.price?.toString() ?? ""));
      setStock(product.stock?.toString() ?? "");
    }
  }, [product]);

  const editProduct = api.products.update.useMutation({
    onSuccess: async () => {
      toast.success("Produk berhasil diperbarui");
      refetch();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !stock) {
      toast.error("Mohon isi semua field yang diperlukan");
      return;
    }
    editProduct.mutate({
      id: productId,
      name,
      price: Number(parseRupiahToNumber(price)),
      stock: Number(stock)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Ubah Data Produk</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Produk
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Masukkan nama produk"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga
            </label>
            <input
              type="text"
              value={price}
              onChange={e => setPrice(formatToRupiah(e.target.value))}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Masukkan harga produk"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stok
            </label>
            <input
              type="number"
              value={stock}
              onChange={e => setStock(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Masukkan jumlah stok"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={editProduct.status === "pending"}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {editProduct.status === "pending" ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
