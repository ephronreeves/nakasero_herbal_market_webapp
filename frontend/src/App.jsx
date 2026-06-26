import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Vendors from './pages/Vendors';
import VendorDetail from './pages/VendorDetail';
import Categories from './pages/Categories';
import Search from './pages/Search';
import Checkout from './pages/Checkout';
import Cart from './pages/Cart';

import CustomerDashboard from './pages/customer/Dashboard';
import CustomerOrders from './pages/customer/Orders';
import CustomerWishlist from './pages/customer/Wishlist';
import CustomerProfile from './pages/customer/Profile';

import VendorDashboard from './pages/vendor/Dashboard';
import VendorProducts from './pages/vendor/Products';
import VendorOrders from './pages/vendor/Orders';
import VendorAnalytics from './pages/vendor/Analytics';
import VendorPayouts from './pages/vendor/Payouts';
import VendorInventory from './pages/vendor/Inventory';
import VendorStore from './pages/vendor/Store';

import AdminDashboard from './pages/admin/Dashboard';
import AdminVendors from './pages/admin/Vendors';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminPayments from './pages/admin/Payments';
import AdminSettings from './pages/admin/Settings';
import AdminReviews from './pages/admin/Reviews';
import AdminAuditLogs from './pages/admin/AuditLogs';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/vendor/:slug" element={<VendorDetail />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/search" element={<Search />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<ProtectedRoute roles={['CUSTOMER', 'VENDOR', 'ADMIN']}><Checkout /></ProtectedRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute roles={['CUSTOMER']}><DashboardLayout><CustomerDashboard /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/orders" element={<ProtectedRoute roles={['CUSTOMER']}><DashboardLayout><CustomerOrders /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/wishlist" element={<ProtectedRoute roles={['CUSTOMER']}><DashboardLayout><CustomerWishlist /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/profile" element={<ProtectedRoute roles={['CUSTOMER', 'VENDOR', 'ADMIN']}><DashboardLayout><CustomerProfile /></DashboardLayout></ProtectedRoute>} />

        <Route path="/vendor/dashboard" element={<ProtectedRoute roles={['VENDOR']}><DashboardLayout><VendorDashboard /></DashboardLayout></ProtectedRoute>} />
        <Route path="/vendor/products" element={<ProtectedRoute roles={['VENDOR']}><DashboardLayout><VendorProducts /></DashboardLayout></ProtectedRoute>} />
        <Route path="/vendor/orders" element={<ProtectedRoute roles={['VENDOR']}><DashboardLayout><VendorOrders /></DashboardLayout></ProtectedRoute>} />
        <Route path="/vendor/analytics" element={<ProtectedRoute roles={['VENDOR']}><DashboardLayout><VendorAnalytics /></DashboardLayout></ProtectedRoute>} />
        <Route path="/vendor/payouts" element={<ProtectedRoute roles={['VENDOR']}><DashboardLayout><VendorPayouts /></DashboardLayout></ProtectedRoute>} />
        <Route path="/vendor/inventory" element={<ProtectedRoute roles={['VENDOR']}><DashboardLayout><VendorInventory /></DashboardLayout></ProtectedRoute>} />
        <Route path="/vendor/store" element={<ProtectedRoute roles={['VENDOR']}><DashboardLayout><VendorStore /></DashboardLayout></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
        <Route path="/admin/vendors" element={<ProtectedRoute roles={['ADMIN']}><DashboardLayout><AdminVendors /></DashboardLayout></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute roles={['ADMIN']}><DashboardLayout><AdminProducts /></DashboardLayout></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute roles={['ADMIN']}><DashboardLayout><AdminOrders /></DashboardLayout></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute roles={['ADMIN']}><DashboardLayout><AdminPayments /></DashboardLayout></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute roles={['ADMIN']}><DashboardLayout><AdminSettings /></DashboardLayout></ProtectedRoute>} />
        <Route path="/admin/reviews" element={<ProtectedRoute roles={['ADMIN']}><DashboardLayout><AdminReviews /></DashboardLayout></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute roles={['ADMIN']}><DashboardLayout><AdminAuditLogs /></DashboardLayout></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
