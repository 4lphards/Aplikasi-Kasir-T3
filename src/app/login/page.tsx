"use client";

import { api } from '@/trpc/react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const router = useRouter();

    const { mutate: login } = api.session.create.useMutation({
        onSuccess: (data) => {
            toast(`Login successful as ${data.name}`);
            router.push('/dashboard');
        }, onError: (error) => {
            toast(error.message);
        }
    });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle login logic here
        login({ username, password });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md w-80">
                <h1 className="mb-6 text-2xl font-bold text-gray-800 text-center">login</h1>
                <div className="mb-4">
                    <label htmlFor="username" className="block text-gray-700 mb-2">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 mb-2">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
                <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Login</button>
            </form>
        </div>
    );
};