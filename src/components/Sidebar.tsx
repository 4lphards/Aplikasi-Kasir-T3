'use client';

import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    const handleNavigation = (path: string) => {
        router.push(`/admin${path}`);
    };

    const { mutate: handleLogout } = api.session.remove.useMutation({
        onSuccess: async () => {
            await router.replace('/login');
        },
    });

    const isActive = (path: string) => pathname === `/admin${path}`;

    return (
        <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-gray-50 text-gray-800">
            <div className="fixed top-0 left-0 w-1/5 flex flex-col bg-white h-full border-r">
                <div className="flex items-center justify-center h-14 border-b">
                    Menu
                </div>
                <div className="overflow-y-auto overflow-x-hidden flex-grow">
                    <ul className="flex flex-col py-4 space-y-1">
                        <li>
                            <a onClick={() => handleNavigation('/dashboard')} className={`relative flex flex-row items-center h-11 focus:outline-none ${isActive('/dashboard') ? 'bg-gray-50 text-gray-800 border-indigo-500' : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-transparent'} border-l-4 pr-6 cursor-pointer`}>
                                <span className="inline-flex justify-center items-center ml-4">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                                </span>
                                <span className="ml-2 text-sm tracking-wide truncate">Dashboard</span>
                            </a>
                        </li>
                        <li>
                            <a onClick={() => handleNavigation('/users')} className={`relative flex flex-row items-center h-11 focus:outline-none ${isActive('/users') ? 'bg-gray-50 text-gray-800 border-indigo-500' : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-transparent'} border-l-4 pr-6 cursor-pointer`}>
                                <span className="inline-flex justify-center items-center ml-4">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                </span>
                                <span className="ml-2 text-sm tracking-wide truncate">Users</span>
                            </a>
                        </li>
                        <li>
                            <a onClick={() => handleNavigation('/products')} className={`relative flex flex-row items-center h-11 focus:outline-none ${isActive('/products') ? 'bg-gray-50 text-gray-800 border-indigo-500' : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-transparent'} border-l-4 pr-6 cursor-pointer`}>
                                <span className="inline-flex justify-center items-center ml-4">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                                </span>
                                <span className="ml-2 text-sm tracking-wide truncate">Products</span>
                            </a>
                        </li>
                        <li>
                            <a onClick={() => handleNavigation('/report')} className={`relative flex flex-row items-center h-11 focus:outline-none ${isActive('/report') ? 'bg-gray-50 text-gray-800 border-indigo-500' : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-transparent'} border-l-4 pr-6 cursor-pointer`}>
                                <span className="inline-flex justify-center items-center ml-4">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                </span>
                                <span className="ml-2 text-sm tracking-wide truncate">Report</span>
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="flex-shrink-0">
                    <ul className="flex flex-col py-4 space-y-1">
                        <li>
                            <a onClick={() => handleLogout()} className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6 cursor-pointer">
                                <span className="inline-flex justify-center items-center ml-4">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                </span>
                                <span className="ml-2 text-sm tracking-wide truncate">Logout</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
