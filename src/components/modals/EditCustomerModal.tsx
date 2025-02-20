"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface EditCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  customerId: number
  initialData: {
    name: string
    phone?: string | null
    address?: string | null
  }
}

export function EditCustomerModal({ isOpen, onClose, onSuccess, customerId, initialData }: EditCustomerModalProps) {
  const [name, setName] = useState(initialData.name);
  const [phone, setPhone] = useState(initialData.phone ?? "");
  const [address, setAddress] = useState(initialData.address ?? "");

  useEffect(() => {
    setName(initialData.name);
    setPhone(initialData.phone ?? "");
    setAddress(initialData.address ?? "");
  }, [initialData]);

  const editCustomer = api.customers.update.useMutation({
    onSuccess: () => {
      toast.success("Customer updated successfully");
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a customer name");
      return;
    }
    editCustomer.mutate({
      id: customerId,
      name,
      phone,
      address
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Customer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Enter address"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editCustomer.status === "pending"}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {editCustomer.status === "pending" ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
