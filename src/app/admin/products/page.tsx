"use client";

import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function ProductPage() {
    const router = useRouter();

    const user = api.session.read.useQuery(undefined, {
        retry: false,
    });

    const products = api.products.fetchAll.useQuery();

    if (user.error) {
        router.push('/login');
        return null;
    }

    if (user.isLoading || products.isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <h2 className="text-4xl font-bold animate-pulse">Loading...</h2>
            </div>
        );
    }

    return (
        <main className="p-6 font-sans bg-gray-100 min-h-screen">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-800">Product Management</h1>
            </header>
            <section className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">ID</th>
                            <th className="py-2 px-4 border-b">Name</th>
                            <th className="py-2 px-4 border-b">Price</th>
                            <th className="py-2 px-4 border-b">Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.data?.map((product) => (
                            <tr key={product.id}>
                                <td className="py-2 px-4 border-b">{product.id}</td>
                                <td className="py-2 px-4 border-b">{product.name}</td>
                                <td className="py-2 px-4 border-b">{product.price}</td>
                                <td className="py-2 px-4 border-b">{product.stock}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </main>
    );
}