import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Clapperboard, MessageCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
    const location = useLocation();
    const { user } = useAuth();

    if (!user) return null;

    const navItems = [
        { icon: Home, path: '/', label: 'Home' },
        { icon: Compass, path: '/explore', label: 'Explore' },
        { icon: Clapperboard, path: '/feed', label: 'Feed' },
        { icon: MessageCircle, path: '/chat', label: 'Message' },
        { icon: User, path: `/profile/${user?._id}`, label: 'Profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-800">
            <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path ||
                        (item.path.includes('/profile') && location.pathname.includes('/profile'));

                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${isActive
                                ? 'text-primary'
                                : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
