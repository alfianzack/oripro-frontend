"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ThemeLogo from "@/components/shared/theme-logo";
import ResetPasswordComponent from "@/components/auth/reset-password";

const ResetPassword = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const uidParam = searchParams.get('uid');

    if (!tokenParam || !uidParam) {
      router.push('/auth/forgot-password');
      return;
    }

    setToken(tokenParam);
    setUid(uidParam);
  }, [searchParams, router]);

  if (!token || !uid) {
    return null;
  }

  return (
    <section className="bg-white dark:bg-slate-900 flex flex-wrap min-h-screen">
      {/* Left Image */}
      <div className="lg:w-1/2 hidden lg:block relative overflow-hidden">
        <div className="flex items-center justify-center h-screen flex-col relative">
          {/* Background dengan gradient biru */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2160FF] to-[#1A4ECF]"></div>
          
          {/* Elemen geometris L-shaped di kanan atas */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#1A4ECF] rounded-bl-[2rem]"></div>
          
          {/* Elemen geometris L-shaped di kanan bawah */}
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#1A4ECF] rounded-tl-[2rem]"></div>
          
          {/* Konten teks di tengah kiri */}
          <div className="relative z-10 text-center px-8">
            <h1 className="text-white font-bold text-4xl mb-4 tracking-wide">
              ONEPROX
            </h1>
            <p className="text-white text-lg font-light">
              A portal asset management property
            </p>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="lg:w-1/2 w-full py-8 px-6 flex flex-col justify-center">
        <div className="lg:max-w-[464px] w-full mx-auto">
          {/* Logo and heading */}
          <div>
            <div className="mb-2.5 inline-block max-w-[290px]">
              <ThemeLogo />
            </div>

            <h4 className="font-semibold mb-3">Reset Password</h4>
            <p className="mb-8 text-secondary-light text-lg">
              Masukkan password baru untuk akun Anda.
            </p>
          </div>

          {/* Reset Password Form */}
          <ResetPasswordComponent token={token} uid={uid} />
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;

