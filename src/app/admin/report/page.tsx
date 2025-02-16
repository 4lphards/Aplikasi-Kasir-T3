"use client";

import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function ReportPage() {
    const router = useRouter();

    const user = api.session.read.useQuery(undefined, {
        retry: false,
    });

    if (user.error) {
        router.push('/login');
        return null;
    }

    if (user.isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <h2 className="text-4xl font-bold animate-pulse">Loading...</h2>
            </div>
        );
    }

    return (
        <main className="p-6 font-sans bg-gray-100 min-h-screen">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-800">Reports</h1>
            </header>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <article className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Sales Report</h2>
                    <p className="text-gray-600">Total Sales: $5000</p>
                </article>
                <article className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Inventory Report</h2>
                    <p className="text-gray-600">Total Inventory: 2000 items</p>
                </article>
                <article className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">User Activity</h2>
                    <p className="text-gray-600">Active Users: 150</p>
                </article>
            </section>
        </main>
    );
}