import React from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface DeleteBulkUserModalProps {
  userIds: number[]
  onClose: () => void
  refetch: () => void
}

const DeleteBulkUserModal: React.FC<DeleteBulkUserModalProps> = ({ userIds, onClose, refetch }) => {
  const deleteUsers = api.users.delete.useMutation({
    onSuccess: () => {
      toast.success("Users deleted successfully");
      refetch();
      onClose();
    },
    onError: () => {
      toast.error("Failed to delete users");
    }
  });

  const handleDelete = () => {
    for (const userId of userIds) {
      deleteUsers.mutate({ id: userId });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Delete Users</h2>
        <p>Are you sure you want to delete these users?</p>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBulkUserModal;
