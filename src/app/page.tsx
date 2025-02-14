"use client";

import { useRouter } from 'next/navigation';

const Home = () => {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800">Web Kasir Sederhana!</h1>
        <button 
          onClick={handleLoginRedirect} 
          className="mt-8 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          klik untuk login
        </button>
      </div>
    </div>
  );
}

export default Home;