'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import AvatarUpload from './avatar-upload';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { authApi, User, usersApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const EditProfileTabContent = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            const formData = new FormData(e.currentTarget);
            const name = formData.get('name') as string;
            const email = formData.get('email') as string;
            const phone = formData.get('phone') as string;
            const gender = formData.get('gender') as string;

            const updateData: any = {};
            if (name) updateData.name = name;
            if (email) updateData.email = email;
            if (phone) updateData.phone = phone;
            if (gender) updateData.gender = gender;

            const response = await usersApi.updateUser(user.id, updateData);

            if (response.success) {
                // Update localStorage user data
                const userData = localStorage.getItem('user_data');
                if (userData) {
                    const currentUser = JSON.parse(userData);
                    const updatedUser = { ...currentUser, ...updateData };
                    localStorage.setItem('user_data', JSON.stringify(updatedUser));
                    setUser(updatedUser);
                }
                
                toast.success('Profile berhasil diperbarui');
                router.refresh();
            } else {
                toast.error(response.error || 'Gagal memperbarui profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Terjadi kesalahan saat memperbarui profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-6">
                <p className="text-muted-foreground">Data user tidak ditemukan</p>
            </div>
        );
    }

    return (
        <div>
            <h6 className="text-base text-neutral-600 dark:text-neutral-200 mb-4">Profile Image</h6>
            <div className="mb-6 mt-4">
                <AvatarUpload />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-6">
                    <div className="col-span-12 sm:col-span-6">
                        <div className="mb-5">
                            <Label htmlFor="name" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">
                                Full Name <span className="text-red-600">*</span>
                            </Label>
                            <Input 
                                name="name" 
                                type="text" 
                                id="name" 
                                placeholder="Enter Full Name" 
                                defaultValue={user.name || ''}
                                required 
                            />
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <div className="mb-5">
                            <Label htmlFor="email" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">
                                Email <span className="text-red-600">*</span>
                            </Label>
                            <Input 
                                name="email" 
                                type="email" 
                                id="email" 
                                placeholder="Enter email address" 
                                defaultValue={user.email || ''}
                                required 
                            />
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <div className="mb-5">
                            <Label htmlFor="phone" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Phone</Label>
                            <Input 
                                name="phone" 
                                type="tel" 
                                id="phone" 
                                placeholder="Enter phone number" 
                                defaultValue={user.phone || ''}
                            />
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <div className="mb-5">
                            <Label htmlFor="gender" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Gender</Label>
                            <Select name="gender" defaultValue={user.gender || ''}>
                                <SelectTrigger id="gender">
                                    <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-3">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => router.refresh()}
                        className="h-[48px] border border-red-600 bg-transparent hover:bg-red-600/20 text-red-600 text-base px-14 py-[11px] rounded-lg"
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        className="h-[48px] text-base px-14 py-3 rounded-lg"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            'Save'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditProfileTabContent;
