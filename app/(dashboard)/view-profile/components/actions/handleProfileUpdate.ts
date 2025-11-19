'use server';

import { usersApi, UpdateUserData } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function handleProfileUpdate(formData: FormData) {
  try {
    // Get user ID from form data or we need to get it from client side
    // Since this is a server action, we'll need to pass user ID from client
    const userId = formData.get('userId') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const gender = formData.get('gender') as string;

    if (!userId) {
      return {
        success: false,
        error: 'User ID tidak ditemukan',
      };
    }

    const updateData: UpdateUserData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (gender) updateData.gender = gender;

    const response = await usersApi.updateUser(userId, updateData);

    if (response.success) {
      // Update localStorage user data if in browser
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          const updatedUser = { ...user, ...updateData };
          localStorage.setItem('user_data', JSON.stringify(updatedUser));
        }
      }
      
      return {
        success: true,
        message: 'Profile berhasil diperbarui',
      };
    } else {
      return {
        success: false,
        error: response.error || 'Gagal memperbarui profile',
      };
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan saat memperbarui profile',
    };
  }
}
