import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const customerLinks = [
  { path: '/dashboard', label: 'Overview', icon: '📊' },
  { path: '/dashboard/orders', label: 'Orders', icon: '📦' },
  { path: '/dashboard/wishlist', label: 'Wishlist', icon: '❤️' },
  { path: '/dashboard/profile', label: 'Profile', icon: '👤' },
];

const vendorLinks = [
  { path: '/vendor/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/vendor/products', label: 'Products', icon: '🌿' },
  { path: '/vendor/inventory', label: 'Inventory', icon: '📋' },
  { path: '/vendor/orders', label: 'Orders', icon: '📦' },
  { path: '/vendor/analytics', label: 'Analytics', icon: '📈' },
  { path: '/vendor/payouts', label: 'Payouts', icon: '💰' },
  { path: '/vendor/store', label: 'Store Settings', icon: '⚙️' },
];

const adminLinks = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/vendors', label: 'Vendors', icon: '🏪' },
  { path: '/admin/products', label: 'Products', icon: '🌿' },
  { path: '/admin/orders', label: 'Orders', icon: '📦' },
  { path: '/admin/payments', label: 'Payments', icon: '💳' },
  { path: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  const links = user?.role === 'ADMIN' ? adminLinks
    : user?.role === 'VENDOR' ? vendorLinks
    : customerLinks;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
