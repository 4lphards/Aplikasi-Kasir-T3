import React, { useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface AddProductModalProps {
  onClose: () => void
  refetch: () => void
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, refetch }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const addProduct = api.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product added successfully");
      refetch();
      onClose();
    },
    onError: () => {
      toast.error("Failed to add product");
    }
  });

  const handleSubmit = () => {
    addProduct.mutate({ name, price, stock });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add Product</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Price"
          value={price}
          onChange={e => setPrice(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Stock"
          value={stock}
          onChange={e => setStock(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
