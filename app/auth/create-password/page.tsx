"use client";

import type { Metadata } from "next";
import React from "react";
import Image from "next/image";
import AuthImage from "@/public/assets/images/auth/forgot-pass-img.png";
import ThemeLogo from "@/components/shared/theme-logo";
import { StaticImg } from "@/types/static-image";
import CreatePasswordComponent from "@/components/auth/create-password-component";

const metadata: Metadata = {
  title: "Create Password & Account Security | WowDash Admin Dashboard",
  description:
    "Set up and manage secure passwords for your account in the WowDash Admin Dashboard built with Next.js and Tailwind CSS.",
};

const forgotPassImage: StaticImg = {
  image: AuthImage,
};

const CreatePassword = () => {
  return (
    <section className="bg-white dark:bg-slate-900 flex flex-wrap min-h-screen">
      {/* Left Image */}
      <div className="lg:w-1/2 hidden lg:block">
        <div className="flex items-center justify-center h-screen flex-col">
          <Image
            src={forgotPassImage.image}
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

            <h4 className="font-semibold mb-3">Create New Password</h4>
            <p className="mb-8 text-secondary-light text-lg">
              Enter your password to unlock the screen!
            </p>
          </div>

          {/* Form */}
          <CreatePasswordComponent />
        </div>
      </div>
    </section>
  );
};

export default CreatePassword;
