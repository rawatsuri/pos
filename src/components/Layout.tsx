import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  UserCircle, 
  BarChart2, 
  Settings,
  LogOut,
  Bell
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth';
import BranchSelector from './BranchSelector';
import LanguageSwitcher from './LanguageSwitcher';
import { networkService } from '../services/network';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = React.useState(networkService.isOnline());

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    networkService.addListener('online', handleOnline);
    networkService.addListener('offline', handleOffline);

    return () => {
      networkService.removeListener('online', handleOnline);
      networkService.removeListener('offline', handleOffline);
    };
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: t('navigation.dashboard'), path: '/' },
    { icon: ShoppingCart, label: t('navigation.orders'), path: '/orders' },
    { icon: Package, label: t('navigation.inventory'), path: '/inventory' },
    { icon: Users, label: t('navigation.customers'), path: '/customers' },
    { icon: UserCircle, label: t('navigation.employees'), path: '/employees', roles: ['admin', 'manager'] },
    { icon: BarChart2, label: t('navigation.analytics'), path: '/analytics', roles: ['admin', 'manager'] },
    { icon: Settings, label: t('navigation.settings'), path: '/settings', roles: ['admin'] },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">{t('app.name')}</h1>
          </div>

          {/* Branch Selector */}
          <div className="px-4 mb-6">
            <BranchSelector />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Language Switcher */}
          <div className="px-4 py-2 border-t">
            <LanguageSwitcher />
          </div>

          {/* Offline Indicator */}
          {!isOnline && (
            <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-100">
              <p className="text-sm text-yellow-800 flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                {t('status.offline')}
              </p>
            </div>
          )}

          {/* Logout */}
          <div className="p-4 border-t">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-left text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <LogOut size={20} className="mr-3" />
              <span className="font-medium">{t('auth.logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm">
          <div className="h-full px-6 flex items-center justify-end">
            <button className="p-2 hover:bg-gray-50 rounded-lg relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="ml-4 flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{t(`roles.${user?.role}`)}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;