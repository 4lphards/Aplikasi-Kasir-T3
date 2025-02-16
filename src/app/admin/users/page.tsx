"use client";

import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

export default function UserPage() {
    const [showAddPopup, setShowAddPopup] = React.useState(false);
    const [showDeletePopup, setShowDeletePopup] = React.useState<number | null>(null);
    const [showEditPopup, setShowEditPopup] = React.useState<number | null>(null);
    const [showDeleteBulkPopup, setShowDeleteBulkPopup] = React.useState<'bulk' | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedUsers, setSelectedUsers] = React.useState<number[]>([]);
    const itemsPerPage = 5;

    const router = useRouter();

    const user = api.session.read.useQuery(undefined, {
        retry: false,
    });

    const { data: users, isLoading, refetch } = api.users.fetchAll.useQuery(undefined, {
        retry: false,
    });

    const { mutate: handleDelete } = api.users.delete.useMutation({
        onSuccess: () => {
            toast.success('User deleted successfully');
            refetch(); // Refetch users after deletion
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const { mutate: handleEditUser } = api.users.update.useMutation({
        onSuccess: () => {
            toast.success('User updated successfully');
            setShowEditPopup(null);
            refetch(); // Refetch users after update
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const handleEdit = (event: React.FormEvent) => {
        event.preventDefault();
        const formData = new FormData(event.target as HTMLFormElement);
        const User = {
            id: Number(formData.get('id') as string),
            name: formData.get('name') as string,
            username: formData.get('username') as string,
            password: formData.get('password') as string,
            level: formData.get('level') as "user" | "admin",
        };

        handleEditUser(User);
    };

    const { mutate: handleAddUser } = api.users.create.useMutation({
        onSuccess: () => {
            toast.success('User added successfully');
            setShowAddPopup(false);
            refetch(); // Refetch users after addition
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const handleAdd = (event: React.FormEvent) => {
        event.preventDefault();
        const formData = new FormData(event.target as HTMLFormElement);
        const newUser = {
            name: formData.get('name') as string,
            username: formData.get('username') as string,
            password: formData.get('password') as string,
            level: formData.get('level') as "user" | "admin",
        };

        handleAddUser(newUser);
    };

    React.useEffect(() => {
        if (user.error) {
            router.push('/login');
        }
    }, [user.error, router]);

    if (user.isLoading || isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <h2 className="text-4xl font-bold animate-pulse">Loading...</h2>
            </div>
        );
    }

    const totalAdminUsers = users?.filter((u) => u.level === "admin").length;
    const totalStaffUsers = users?.filter((u) => u.level === "user").length;

    const filteredUsers = users?.filter((u) => u.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers?.slice(startIndex, endIndex);

    const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const handlePreviousPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const handleSelectUser = (userId: number) => {
        setSelectedUsers((prevSelected) =>
            prevSelected.includes(userId)
                ? prevSelected.filter((id) => id !== userId)
                : [...prevSelected, userId]
        );
    };

    const handleBulkDelete = () => {
        selectedUsers.forEach((userId) => handleDelete({ id: userId }));
        setSelectedUsers([]);
    };

    return (
        <main className="p-4 font-sans bg-gray-100 min-h-screen">
            <header className="text-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800">User Management</h1>
            </header>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <article className="p-4 pb-12 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h2 className="text-xl font-semibold mb-2 text-gray-700">Total Users</h2>
                    <p className="text-gray-600">Total Number of Users: {users?.length}</p>
                </article>
                <article className="p-4 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h2 className="text-xl font-semibold mb-2 text-gray-700">Admin Users</h2>
                    <p className="text-gray-600">Total Admin: {totalAdminUsers}</p>
                </article>
                <article className="p-4 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h2 className="text-xl font-semibold mb-2 text-gray-700">Staff Users</h2>
                    <p className="text-gray-600">Total Staff: {totalStaffUsers}</p>
                </article>
            </section >
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="Search by name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-2 border rounded-lg shadow-md"
                />
                <div className='flex gap-8'>
                    {selectedUsers.length > 0 && (
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowDeleteBulkPopup('bulk')}
                                className="px-3 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300"
                            >
                                Delete Selected
                            </button>
                            {showDeleteBulkPopup === 'bulk' && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                    <div className="bg-white p-4 rounded-lg shadow-lg">
                                        <h2 className="text-xl font-bold mb-4">Confirm Bulk Deletion</h2>
                                        <p>Are you sure you want to delete the selected users?</p>
                                        <div className="flex justify-end mt-4">
                                            <button
                                                onClick={() => setShowDeleteBulkPopup(null)}
                                                className="mr-2 px-3 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleBulkDelete();
                                                    setShowDeleteBulkPopup(null);
                                                }}
                                                className="px-3 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <button onClick={() => setShowAddPopup(true)} className="px-3 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                        Add User
                    </button>
                    {showAddPopup && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white p-4 rounded-lg shadow-lg">
                                <h2 className="text-xl font-bold mb-4">Add New User</h2>
                                <form onSubmit={handleAdd}>
                                    <div className="mb-3">
                                        <label className="block text-gray-700">Name</label>
                                        <input name='name' type="text" className="w-full px-2 py-1 border rounded-lg" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="block text-gray-700">Username</label>
                                        <input name='username' type="text" className="w-full px-2 py-1 border rounded-lg" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="block text-gray-700">Password</label>
                                        <input name='password' type="password" className="w-full px-2 py-1 border rounded-lg" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="block text-gray-700">Level</label>
                                        <select name='level' className="w-full px-2 py-1 border rounded-lg">
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="button" onClick={() => setShowAddPopup(false)} className="mr-2 px-3 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-300">
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                                            Add
                                        </button>
                                    </div>
                                </form>
                            </div >
                        </div >
                    )
                    }
                </div>
            </div >
            <section>
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    <thead>
                        <tr>
                            <th className="py-2 px-3 border-b text-center w-20">ID</th>
                            <th className="py-2 px-3 border-b text-center w-40">Name</th>
                            <th className="py-2 px-3 border-b text-center w-40">Username</th>
                            <th className="py-2 px-3 border-b text-center w-20">Level</th>
                            <th className="py-2 px-3 border-b text-center w-40">Created At</th>
                            <th className="py-2 px-3 border-b text-center w-40">Actions</th>
                            <th className="py-2 px-3 border-b text-center w-20">Select</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers?.map((user) => (
                            <tr key={user.id}>
                                <td className="py-2 px-3 border-b text-center w-20">{user.id}</td>
                                <td className="py-2 px-3 border-b text-center w-40">{user.name}</td>
                                <td className="py-2 px-3 border-b text-center w-40">{user.username}</td>
                                <td className="py-2 px-3 border-b text-center w-20">{user.level}</td>
                                <td className="py-2 px-3 border-b text-center w-40">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="py-2 px-3 border-b text-center w-40">
                                    <button
                                        onClick={() => setShowEditPopup(user.id)}
                                        className="mr-2 px-2 py-1 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition duration-300"
                                    >
                                        Edit
                                    </button>
                                    {showEditPopup === user.id && (
                                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                            <div className="bg-white p-4 rounded-lg shadow-lg">
                                                <h2 className="text-xl font-bold mb-4">Edit User</h2>
                                                <form onSubmit={handleEdit}>
                                                    <input type="hidden" name="id" value={user.id} />
                                                    <div className="mb-3">
                                                        <label className="block text-gray-700">Name</label>
                                                        <input name='name' type="text" className="w-full px-2 py-1 border rounded-lg" defaultValue={user.name ?? ''} />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="block text-gray-700">Username</label>
                                                        <input name='username' type="text" className="w-full px-2 py-1 border rounded-lg" defaultValue={user.username} />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="block text-gray-700">Password</label>
                                                        <input name='password' type="password" className="w-full px-2 py-1 border rounded-lg" />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="block text-gray-700">Level</label>
                                                        <select name='level' className="w-full px-2 py-1 border rounded-lg" defaultValue={user.level ?? ''}>
                                                            <option value="user">User</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <button type="button" onClick={() => setShowEditPopup(null)} className="mr-2 px-3 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-300">
                                                            Cancel
                                                        </button>
                                                        <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                                                            Update
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setShowDeletePopup(user.id)}
                                        className="px-2 py-1 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300"
                                    >
                                        Delete
                                    </button>
                                    {showDeletePopup === user.id && (
                                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                            <div className="bg-white p-4 rounded-lg shadow-lg">
                                                <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                                                <p>Are you sure you want to delete this user?</p>
                                                <div className="flex justify-end mt-4">
                                                    <button
                                                        onClick={() => setShowDeletePopup(null)}
                                                        className="mr-2 px-3 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleDelete({ id: user.id });
                                                            setShowDeletePopup(null);
                                                        }}
                                                        className="px-3 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td className="py-2 px-3 border-b text-center w-20">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => handleSelectUser(user.id)}
                                    />
                                </td>
                            </tr >
                        ))
                        }
                    </tbody >
                </table >
                <div className="flex justify-between mt-4">
                    <div className="flex justify-start">
                        {currentPage > 1 && (
                            <button
                                onClick={handlePreviousPage}
                                className="px-3 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
                            >
                                Previous
                            </button>
                        )}
                    </div>
                    <div className="flex justify-end">
                        {endIndex < (filteredUsers?.length || 0) && (
                            <button
                                onClick={handleNextPage}
                                className="px-3 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </section >
        </main >
    );
}