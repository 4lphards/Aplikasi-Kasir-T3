import React, { useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface EditProductModalProps {
  productId: number
  onClose: () => void
  refetch: () => void
}

const EditProductModal: React.FC<EditProductModalProps> = ({ productId, onClose, refetch }) => {
  const { data: product } = api.products.fetchById.useQuery({ id: productId });
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [stock, setStock] = useState(product?.stock ?? "");

  const updateProduct = api.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully");
      refetch();
      onClose();
    },
    onError: () => {
      toast.error("Failed to update product");
    }
  });

  const handleSubmit = () => {
    updateProduct.mutate({ id: productId, name, price, stock });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Product</h2>
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

export default EditProductModal;
