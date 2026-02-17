import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const { user } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const tabs = [
        { name: 'Shorts', path: '/' },
        { name: 'Feed', path: '/feed' },
        { name: 'Chat', path: '/chat' },
        { name: 'Profile', path: `/profile/${user?._id}` },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-secondary border-b border-dark-border">
            {/* Top Row */}
            <div className="flex items-center justify-between px-4 py-3">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent-pink rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">C</span>
                    </div>
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">ConnectHub</span>
                </Link>

                <div className="flex items-center gap-4">
                    <Link to="/explore" className="text-gray-400 hover:text-white transition-colors">
                        <Search size={22} />
                    </Link>

                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="block focus:outline-none"
                        >
                            <img
                                src={user?.profilePic || 'https://via.placeholder.com/40'}
                                alt="Profile"
                                className="w-9 h-9 rounded-full object-cover border-2 border-dark-border hover:border-primary transition-colors"
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && user && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-dark-secondary rounded-xl shadow-lg border border-gray-800 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                                <Link
                                    to={`/profile/${user._id}`}
                                    className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-b border-gray-800"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    My Profile
                                </Link>
                                <Link
                                    to="/settings"
                                    className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    Settings
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>



            {/* Tab Navigation - Hidden on Home/Shorts page */}
            {location.pathname !== '/' && (
                <div className="flex items-center px-4 gap-1">
                    {tabs.map((tab) => {
                        const isActive = location.pathname === tab.path ||
                            (tab.path.includes('/profile') && location.pathname.includes('/profile'));

                        return (
                            <Link
                                key={tab.name}
                                to={tab.path}
                                className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${isActive
                                    ? 'text-white'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                {tab.name}
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
