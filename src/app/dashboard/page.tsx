"use client";

import { api } from '@/trpc/react';
import React from 'react';

export default function DashboardPage() {
    const user = api.session.read.useQuery();

    if (user.error) {
        return <div>Error: {user.error.message}</div>;
    }

    if (user.isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <h2 className="text-4xl font-bold">Loading...</h2>
            </div>
        );
    }

    return (
        <main className="p-6 font-sans">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bo ld">Cashier Dashboard</h1>
            </header>
            <section className="flex justify-around mt-8 space-x-4">
                <article className="w-1/3 p-4 border border-gray-300 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Sales Summary</h2>
                    <p>Total Sales: $5000</p>
                    <p>Transactions: 150</p>
                </article>
                <article className="w-1/3 p-4 border border-gray-300 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Inventory</h2>
                    <p>Items in Stock: 200</p>
                    <p>Low Stock Items: 5</p>
                </article>
                <article className="w-1/3 p-4 border border-gray-300 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                    <p>New Orders: 3</p>
                    <p>Pending Deliveries: 2</p>
                </article>
            </section>
        </main>
    );
};