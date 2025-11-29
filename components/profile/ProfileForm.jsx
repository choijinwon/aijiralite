// components/profile/ProfileForm.jsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../../utils/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';
import { User, Mail, Image as ImageIcon } from 'lucide-react';

export default function ProfileForm({ user, onUpdate }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      avatar: user?.avatar || '',
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const updated = await api.updateProfile(data);

      if (updated.error) {
        throw new Error(updated.error);
      }

      toast.success('Profile updated successfully');
      onUpdate(updated);
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.message || 'Failed to update profile';
      
      // Handle authentication errors
      if (errorMessage.includes('Authentication') || errorMessage.includes('401')) {
        toast.error('Please sign in again to update your profile');
        // Optionally redirect to sign in
        setTimeout(() => {
          window.location.href = '/auth/signin';
        }, 2000);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email
        </label>
        <Input
          type="email"
          value={user?.email || ''}
          disabled
          className="bg-gray-50"
        />
        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <User className="w-4 h-4" />
          Name
        </label>
        <Input
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' }
          })}
          placeholder="Your name"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Avatar URL
        </label>
        <Input
          {...register('avatar')}
          type="url"
          placeholder="https://example.com/avatar.jpg"
        />
        {errors.avatar && (
          <p className="text-red-500 text-sm mt-1">{errors.avatar.message}</p>
        )}
        {user?.avatar && (
          <div className="mt-2">
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Updating...' : 'Update Profile'}
      </Button>
    </form>
  );
}

