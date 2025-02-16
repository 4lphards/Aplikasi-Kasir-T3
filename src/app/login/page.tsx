"use client";

import { api } from '@/trpc/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const router = useRouter();

    const { mutate: login } = api.session.create.useMutation({
        onSuccess: (data) => {
            toast.success(`Login successful as ${data.level}`);
            if (data.level === 'admin')
                router.push('/admin/dashboard');
            if (data.level === 'user')
                router.push('/dashboard/cashier');
        }, onError: (error) => {
            toast(error.message);
        }
    });

    const session = api.session.read.useQuery(undefined, {
        retry: false,
    });

    useEffect(() => {
        if (session.error) {
            toast.error('Failed to read session, please login again');
        } else if (session.data) {
            toast('Already logged in, redirecting to dashboard');
            if (session.data.level === 'admin')
                router.push('/admin/dashboard');
            if (session.data.level === 'user')
                router.push('/dashboard/cashier');
        }
    }, [ session.data, session.error ]);
   
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login({ username, password });
    };

    return (
        <div className="flex justify-center items-center h-screen bg-white">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h1 className="mb-8 text-3xl font-bold text-gray-900 text-center">Login</h1>
                <div className="mb-6">
                    <label htmlFor="username" className="block text-gray-700 mb-2">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-gray-700 mb-2">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300">Login</button>
            </form>
        </div>
    );
};