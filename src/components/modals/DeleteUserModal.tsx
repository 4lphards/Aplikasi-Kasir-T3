"use client";

import React from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface DeleteUserModalProps {
  userId: number
  onClose: () => void
  refetch: () => void
}

export default function DeleteUserModal({ userId, onClose, refetch }: DeleteUserModalProps) {
  const deleteUser = api.users.delete.useMutation({
    onSuccess: async () => {
      toast.success("Pengguna berhasil dihapus");
      refetch();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Hapus Pengguna</h2>
        <p className="text-gray-600 mb-6">Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Batal
          </button>
          <button
            onClick={() => deleteUser.mutate({ id: userId })}
            disabled={deleteUser.status === "pending"}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {deleteUser.status === "pending" ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
