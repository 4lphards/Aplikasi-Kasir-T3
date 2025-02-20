"use client";

import { formatToRupiah } from "@/utils/currencyFormat";
import { useEffect, useState } from "react";

interface PaymentConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  total: number
  payment: string
  cashback: number
  customerName?: string
}

export function PaymentConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  total,
  payment,
  cashback,
  customerName
}: PaymentConfirmationModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative z-50 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800">Konfirmasi Pembayaran</h3>
            <p className="mt-1 text-sm text-gray-500">Pastikan detail pembayaran sudah benar</p>
          </div>

          <div className="space-y-3 rounded-lg bg-gray-50 p-4">
            {customerName && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pelanggan</span>
                <span className="font-medium text-gray-900">{customerName}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Belanja</span>
              <span className="font-medium text-gray-900">
                {formatToRupiah(total.toString())}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pembayaran</span>
              <span className="font-medium text-gray-900">{payment}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Kembalian</span>
              <span className={`font-medium ${cashback >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatToRupiah(cashback.toString())}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
