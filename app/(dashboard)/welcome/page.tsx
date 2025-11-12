"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const Welcome = () => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center px-6 max-w-2xl w-full">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
            <Home className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Selamat Datang di ONEPROX
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Terima kasih telah menggunakan sistem manajemen aset ONEPROX. 
            Silakan hubungi administrator untuk mendapatkan akses ke fitur aplikasi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;

