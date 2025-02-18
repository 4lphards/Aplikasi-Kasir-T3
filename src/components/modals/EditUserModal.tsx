import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface EditUserModalProps {
  userId: number
  onClose: () => void
  refetch: () => void
}

const EditUserModal: React.FC<EditUserModalProps> = ({ userId, onClose, refetch }) => {
  const { data: user } = api.users.fetchById.useQuery({ id: userId });
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [password, setPassword] = useState("");
  const [level, setLevel] = useState<"user" | "admin">(user?.level ?? "user");

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setUsername(user.username);
      setLevel(user.level ?? "user");
    }
  }, [user]);

  const updateUser = api.users.update.useMutation({
    onSuccess: () => {
      toast.success("User updated successfully");
      refetch();
      onClose();
    },
    onError: () => {
      toast.error("Failed to update user");
    }
  });

  const handleSubmit = () => {
    updateUser.mutate({ id: userId, name, username, password, level });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit User</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <select
          value={level}
          onChange={e => setLevel(e.target.value as "user" | "admin")}
          className="w-full mb-2 p-2 border rounded"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
