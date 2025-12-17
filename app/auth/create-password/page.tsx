"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import ThemeLogo from "@/components/shared/theme-logo";
import ResetPasswordComponent from "@/components/auth/reset-password";
import AuthImage from "@/public/assets/images/auth/forgot-pass-img.png";

const CreatePassword = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const uidParam = searchParams.get("uid");

    if (!tokenParam || !uidParam) {
      router.push("/auth/forgot-password");
      return;
    }

    setToken(tokenParam);
    setUid(uidParam);
  }, [searchParams, router]);

  if (!token || !uid) return null;

  return (
    <section className="bg-white dark:bg-slate-900 flex flex-wrap min-h-screen">
      {/* Left Image */}
      <div className="lg:w-1/2 hidden lg:block">
        <div className="flex items-center justify-center h-screen flex-col">
          <Image
            src={AuthImage}
            alt="Auth Illustration"
            className="object-cover w-full h-full"
          />
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

export default CreatePassword;
