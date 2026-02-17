import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Bell, Lock, LogOut, Moon, HelpCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const Settings = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const settingSections = [
        {
            title: 'Account',
            items: [
                { icon: User, label: 'Edit Profile', action: () => navigate(`/profile/${user?._id}`) },
                { icon: Lock, label: 'Privacy', action: () => { } },
            ]
        },
        {
            title: 'Preferences',
            items: [
                {
                    icon: Bell,
                    label: 'Notifications',
                    toggle: true,
                    value: notifications,
                    action: () => setNotifications(!notifications)
                },
                {
                    icon: Moon,
                    label: 'Dark Mode',
                    toggle: true,
                    value: darkMode,
                    action: () => setDarkMode(!darkMode)
                },
            ]
        },
        {
            title: 'Support',
            items: [
                { icon: HelpCircle, label: 'Help & Support', action: () => { } },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-black pb-20">
            <Navbar />

            <div className="max-w-2xl mx-auto pt-20 px-4">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-800 rounded-full text-white"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                </div>

                <div className="space-y-6">
                    {settingSections.map((section, idx) => (
                        <div key={idx} className="bg-dark-secondary rounded-2xl overflow-hidden border border-gray-800">
                            <h2 className="px-6 py-4 text-sm font-semibold text-gray-400 bg-black/20">
                                {section.title}
                            </h2>
                            <div className="divide-y divide-gray-800">
                                {section.items.map((item, itemIdx) => (
                                    <button
                                        key={itemIdx}
                                        onClick={item.action}
                                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                                                <item.icon size={20} />
                                            </div>
                                            <span className="text-white font-medium">{item.label}</span>
                                        </div>

                                        {item.toggle ? (
                                            <div className={`w-11 h-6 rounded-full transition-colors relative ${item.value ? 'bg-primary' : 'bg-gray-700'}`}>
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${item.value ? 'left-6' : 'left-1'}`} />
                                            </div>
                                        ) : (
                                            <ChevronLeft size={20} className="text-gray-500 rotate-180" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 border border-red-500/20 transition-colors"
                    >
                        <LogOut size={20} />
                        Log Out
                    </button>
                </div>

                <div className="text-center mt-8 text-gray-500 text-sm">
                    ConnectHub v1.0.0
                </div>
            </div>
        </div>
    );
};

export default Settings;
