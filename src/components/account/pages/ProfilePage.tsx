import React, { useState, useRef } from 'react';
import { Camera, User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { useStore } from '../../../context/StoreContext';

export const ProfilePage: React.FC = () => {
  const { user, profile, updateUserProfile, signOut } = useAuth();
  const { showToast, setActiveView } = useStore();
  const [isEditing, setIsEditing] = useState(false);

  // Prefer live Firebase Auth data (Google/Facebook photo, name, email) over stored profile
  const livePhoto = user?.photoURL || profile?.photoURL || null;
  const liveName = user?.displayName || profile?.displayName || '';
  const liveEmail = user?.email || profile?.email || '';

  const [avatarPreview, setAvatarPreview] = useState<string | null>(livePhoto);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    displayName: liveName,
    email: liveEmail,
    phone: profile?.phone || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({ ...formData, photoURL: avatarPreview });
      showToast('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch {
      showToast('Failed to update profile', 'error');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setActiveView('home');
    showToast('Signed out successfully', 'success');
  };

  // Initials fallback from live auth name or email
  const initials = (liveName || liveEmail || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <AuthLayout title="Profile Settings" image="/allneed.jpeg">
      <div className="bg-white border border-[#EEE8DF] p-6 lg:p-10 space-y-8 shadow-sm">

        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#EEE8DF] pb-4">
          <h2 className="font-serif text-xl uppercase tracking-widest text-[#11100E]">Personal Details</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#A99684] hover:text-[#11100E] transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-2 border-[#EEE8DF] overflow-hidden bg-[#F5F1EB] flex items-center justify-center">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-serif text-2xl text-[#A99684] select-none">{initials}</span>
              )}
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#11100E] rounded-full flex items-center justify-center text-white hover:bg-[#A99684] transition-colors shadow"
                aria-label="Change photo"
              >
                <Camera size={14} />
              </button>
            )}
          </div>
          {isEditing && (
            <p className="text-[10px] text-[#A99684] font-sans tracking-wider uppercase">
              Tap the camera to change photo
            </p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest text-[#A99684] mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-[#C8B5A5] py-2 text-sm text-[#11100E] focus:outline-none focus:border-[#11100E] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest text-[#A99684] mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                className="w-full bg-transparent border-b border-[#C8B5A5] py-2 text-sm text-[#11100E]/50 focus:outline-none transition-colors cursor-not-allowed"
              />
              <p className="text-[10px] text-[#A99684] mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest text-[#A99684] mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-[#C8B5A5] py-2 text-sm text-[#11100E] focus:outline-none focus:border-[#11100E] transition-colors"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[#11100E] text-[#F5F1EB] text-[11px] font-sans uppercase tracking-[0.2em] py-4 hover:bg-[#2C2925] transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setAvatarPreview(livePhoto);
                  setFormData({
                    displayName: liveName,
                    email: liveEmail,
                    phone: profile?.phone || '',
                  });
                }}
                className="flex-1 border border-[#11100E] text-[#11100E] text-[11px] font-sans uppercase tracking-[0.2em] py-4 hover:bg-[#F5F1EB] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-sans uppercase tracking-widest text-[#A99684] mb-1">Full Name</p>
              <p className="text-sm text-[#11100E]">{profile?.displayName || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-sans uppercase tracking-widest text-[#A99684] mb-1">Email Address</p>
              <p className="text-sm text-[#11100E]">{profile?.email || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-sans uppercase tracking-widest text-[#A99684] mb-1">Phone Number</p>
              <p className="text-sm text-[#11100E]">{profile?.phone || '—'}</p>
            </div>
          </div>
        )}

        <div className="pt-8 border-t border-[#EEE8DF]">
          <button
            onClick={handleSignOut}
            className="text-[11px] font-sans uppercase tracking-widest text-[#A99684] hover:text-[#11100E] transition-colors flex items-center gap-2"
          >
            Sign Out
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};
