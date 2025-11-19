'use client';

import React, { useEffect, useState } from 'react';
import { authApi, User } from '@/lib/api';

const ViewProfileSidebar = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await authApi.getCurrentUser();
                setUser(userData);
            } catch (error) {
                console.error('Error loading user:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    if (loading) {
        return (
            <div className="user-grid-card relative border border-slate-200 dark:border-slate-600 rounded-2xl overflow-hidden bg-white dark:bg-[#273142] h-full">
                <div className="p-6">
                    <div className="animate-pulse">
                        <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="user-grid-card relative border border-slate-200 dark:border-slate-600 rounded-2xl overflow-hidden bg-white dark:bg-[#273142] h-full">
                <div className="p-6 text-center">
                    <p className="text-muted-foreground">Data user tidak ditemukan</p>
                </div>
            </div>
        );
    }

    return (
        <div className="user-grid-card relative border border-slate-200 dark:border-slate-600 rounded-2xl overflow-hidden bg-white dark:bg-[#273142] h-full">
            <img src="assets/images/user-grid/user-grid-bg1.png" alt="" className="w-full object-fit-cover" />
            <div className="pb-6 ms-6 mb-6 me-6 -mt-[100px]">
                <div className="text-center border-b border-slate-200 dark:border-slate-600">
                    <img src="assets/images/user-grid/user-grid-img14.png" alt="" className="border br-white border-width-2-px w-200-px h-[200px] rounded-full object-fit-cover mx-auto" />
                    <h6 className="mb-0 mt-4">{user.name || 'N/A'}</h6>
                    <span className="text-secondary-light mb-4">{user.email}</span>
                </div>
                <div className="mt-6">
                    <h6 className="text-xl mb-4">Personal Info</h6>
                    <ul>
                        <li className="flex items-center gap-1 mb-3">
                            <span className="w-[30%] text-base font-semibold text-neutral-600 dark:text-neutral-200">Full Name</span>
                            <span className="w-[70%] text-secondary-light font-medium">: {user.name || '-'}</span>
                        </li>
                        <li className="flex items-center gap-1 mb-3">
                            <span className="w-[30%] text-base font-semibold text-neutral-600 dark:text-neutral-200"> Email</span>
                            <span className="w-[70%] text-secondary-light font-medium">: {user.email}</span>
                        </li>
                        <li className="flex items-center gap-1 mb-3">
                            <span className="w-[30%] text-base font-semibold text-neutral-600 dark:text-neutral-200"> Phone Number</span>
                            <span className="w-[70%] text-secondary-light font-medium">: {user.phone || '-'}</span>
                        </li>
                        <li className="flex items-center gap-1 mb-3">
                            <span className="w-[30%] text-base font-semibold text-neutral-600 dark:text-neutral-200"> Role</span>
                            <span className="w-[70%] text-secondary-light font-medium">: {user.role?.name || '-'}</span>
                        </li>
                        <li className="flex items-center gap-1 mb-3">
                            <span className="w-[30%] text-base font-semibold text-neutral-600 dark:text-neutral-200"> Status</span>
                            <span className="w-[70%] text-secondary-light font-medium">: {user.status || '-'}</span>
                        </li>
                        <li className="flex items-center gap-1 mb-3">
                            <span className="w-[30%] text-base font-semibold text-neutral-600 dark:text-neutral-200"> Gender</span>
                            <span className="w-[70%] text-secondary-light font-medium">: {user.gender || '-'}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ViewProfileSidebar;