import { useState, useRef } from 'react';
import { X, Camera, Loader2 } from 'lucide-react'; // Assuming Loader2 exists, or just use generic spinner
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const EditProfileModal = ({ user, onClose, onUpdate }) => {
    const { updateUser } = useAuth(); // To update context if needed
    const [formData, setFormData] = useState({
        username: user.username || '',
        bio: user.bio || '',
    });
    const [profilePic, setProfilePic] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user.profilePic);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePic(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('username', formData.username);
            data.append('bio', formData.bio);
            if (profilePic) {
                data.append('profilePic', profilePic);
            }

            const response = await api.put('/users/profile', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const updatedUser = response.data;

            // Update auth context
            updateUser(updatedUser);

            // Update parent component state
            if (onUpdate) onUpdate(updatedUser);

            onClose();
        } catch (error) {
            console.error('Update profile error:', error);
            // Handle error (maybe show toast)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-dark-secondary w-full max-w-md rounded-2xl border border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-white font-semibold text-lg">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Profile Pic */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <img
                                src={previewUrl || 'https://via.placeholder.com/100'}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover border-4 border-dark-border group-hover:border-gray-600 transition-colors"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={24} />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <p className="text-primary text-sm font-medium cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            Change Profile Photo
                        </p>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                placeholder="Username"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none h-24"
                                placeholder="Add a bio..."
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
