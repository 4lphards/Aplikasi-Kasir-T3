"use client";

import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const user = api.session.read.useQuery(undefined, {
    retry: false
  });

  const handleNavigation = (path: string) => {
    router.push(`/admin${path}`);
  };

  const handleLogout = api.session.remove.useMutation({
    onSuccess: () => {
      router.push("/login");
      toast.success("Berhasil keluar");
    }
  });

  useEffect(() => {
    if (user.isLoading) {
      return;
    }
    if (!user.data) {
      router.push("/login");
    }
  }, [user, router]);

  const isActive = (path: string) => pathname === `/admin${path}`;

  return (
    <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-gray-50 text-gray-800">
      <div className="fixed top-0 left-0 w-1/5 flex flex-col bg-white h-full border-r shadow-lg">
        <div className="flex items-center justify-center h-16 border-b bg-indigo-600">
          <h1 className="text-xl font-bold text-white">Web Kasir</h1>
        </div>
        <div className="overflow-y-auto overflow-x-hidden flex-grow">
          <ul className="flex flex-col py-6 space-y-2 px-4">
            <li>
              <a
                onClick={() => handleNavigation("/dashboard")}
                className={`relative flex items-center py-3 px-4 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer
                ${isActive("/dashboard")
      ? "bg-indigo-100 text-indigo-700"
      : "hover:bg-gray-100 text-gray-600 hover:text-indigo-600"}`}
              >
                <span className="inline-flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                </span>
                <span className="ml-3 text-sm font-medium">Dasbor</span>
              </a>
            </li>
            <li>
              <a
                onClick={() => handleNavigation("/transactions")}
                className={`relative flex items-center py-3 px-4 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer
                ${isActive("/transactions")
      ? "bg-indigo-100 text-indigo-700"
      : "hover:bg-gray-100 text-gray-600 hover:text-indigo-600"}`}
              >
                <span className="inline-flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                </span>
                <span className="ml-3 text-sm font-medium">Transaksi</span>
              </a>
            </li>
            {user.data?.level === "admin" && (
              <li>
                <a
                  onClick={() => handleNavigation("/users")}
                  className={`relative flex items-center py-3 px-4 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer
                ${isActive("/users")
                ? "bg-indigo-100 text-indigo-700"
                : "hover:bg-gray-100 text-gray-600 hover:text-indigo-600"}`}
                >
                  <span className="inline-flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </span>
                  <span className="ml-3 text-sm font-medium">Pengguna</span>
                </a>
              </li>
            )}
            <li>
              <a
                onClick={() => handleNavigation("/products")}
                className={`relative flex items-center py-3 px-4 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer
                ${isActive("/products")
      ? "bg-indigo-100 text-indigo-700"
      : "hover:bg-gray-100 text-gray-600 hover:text-indigo-600"}`}
              >
                <span className="inline-flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                </span>
                <span className="ml-3 text-sm font-medium">Produk</span>
              </a>
            </li>
            <li>
              <a
                onClick={() => handleNavigation("/reports")}
                className={`relative flex items-center py-3 px-4 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer
                ${isActive("/reports")
      ? "bg-indigo-100 text-indigo-700"
      : "hover:bg-gray-100 text-gray-600 hover:text-indigo-600"}`}
              >
                <span className="inline-flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                </span>
                <span className="ml-3 text-sm font-medium">Laporan</span>
              </a>
            </li>
          </ul>
        </div>
        <div className="flex-shrink-0 border-t">
          <ul className="flex flex-col py-4 px-4">
            <li>
              <a
                onClick={() => handleLogout.mutate()}
                className="relative flex items-center py-3 px-4 rounded-lg text-red-500 hover:bg-red-50 transition-colors duration-200 ease-in-out cursor-pointer"
              >
                <span className="inline-flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                </span>
                <span className="ml-3 text-sm font-medium">Keluar</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
