import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const closeAll = () => {
    setMenuOpen(false);
    setMobileNavOpen(false);
  };

  return (
    <header className="glass-strong sticky top-0 z-50 border-b border-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 shrink-0" onClick={closeAll}>
            <span className="text-2xl">🌿</span>
            <div className="hidden xs:block">
              <span className="text-xl font-bold text-gradient">Emiti Dagala</span>
              <span className="block text-xs text-gray-500 -mt-0.5">Nakasero Herbal Market</span>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, vendors, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 glass rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </div>
          </form>

          <nav className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <Link to="/products" className="text-gray-600 hover:text-primary-600 text-sm font-medium">Products</Link>
            <Link to="/vendors" className="text-gray-600 hover:text-primary-600 text-sm font-medium">Vendors</Link>
            <Link to="/categories" className="text-gray-600 hover:text-primary-600 text-sm font-medium">Categories</Link>
            <Link to="/cart" className="text-gray-600 hover:text-primary-600 relative p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
            </Link>
            {user ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 p-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span className="text-sm hidden lg:inline">{user.firstName}</span>
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 glass-strong rounded-xl shadow-glass py-1 z-50">
                      {user.role === 'CUSTOMER' && <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-white/50" onClick={closeAll}>Dashboard</Link>}
                      {user.role === 'VENDOR' && <Link to="/vendor/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-white/50" onClick={closeAll}>Vendor Dashboard</Link>}
                      {user.role === 'ADMIN' && <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-white/50" onClick={closeAll}>Admin Dashboard</Link>}
                      <Link to="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-white/50" onClick={closeAll}>Profile</Link>
                      <hr className="my-1 border-white/30" />
                      <button onClick={() => { logout(); navigate('/'); closeAll(); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-white/50">Logout</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm">Sign In</Link>
            )}
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <Link to="/cart" className="text-gray-600 p-1.5">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
            </Link>
            <button className="p-1.5 text-gray-600" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileNavOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="md:hidden border-t border-white/30 py-4 space-y-1">
            <form onSubmit={handleSearch} className="px-2 mb-3">
              <div className="relative">
                <input type="text" placeholder="Search..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 glass rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
            </form>
            <Link to="/products" className="block px-4 py-2.5 text-gray-700 hover:bg-white/50 rounded-xl text-sm font-medium" onClick={closeAll}>Products</Link>
            <Link to="/vendors" className="block px-4 py-2.5 text-gray-700 hover:bg-white/50 rounded-xl text-sm font-medium" onClick={closeAll}>Vendors</Link>
            <Link to="/categories" className="block px-4 py-2.5 text-gray-700 hover:bg-white/50 rounded-xl text-sm font-medium" onClick={closeAll}>Categories</Link>
            <hr className="my-2 border-white/30" />
            {user ? (
              <>
                <div className="px-4 py-2 text-xs text-gray-400 font-medium uppercase tracking-wide">Account</div>
                {user.role === 'CUSTOMER' && <Link to="/dashboard" className="block px-4 py-2.5 text-gray-700 hover:bg-white/50 rounded-xl text-sm" onClick={closeAll}>📊 Dashboard</Link>}
                {user.role === 'VENDOR' && <Link to="/vendor/dashboard" className="block px-4 py-2.5 text-gray-700 hover:bg-white/50 rounded-xl text-sm" onClick={closeAll}>📊 Vendor Dashboard</Link>}
                {user.role === 'ADMIN' && <Link to="/admin/dashboard" className="block px-4 py-2.5 text-gray-700 hover:bg-white/50 rounded-xl text-sm" onClick={closeAll}>📊 Admin Dashboard</Link>}
                <Link to="/dashboard/orders" className="block px-4 py-2.5 text-gray-700 hover:bg-white/50 rounded-xl text-sm" onClick={closeAll}>📦 My Orders</Link>
                <Link to="/dashboard/profile" className="block px-4 py-2.5 text-gray-700 hover:bg-white/50 rounded-xl text-sm" onClick={closeAll}>👤 Profile</Link>
                <hr className="my-2 border-white/30" />
                <button onClick={() => { logout(); navigate('/'); closeAll(); }} className="block w-full text-left px-4 py-2.5 text-red-600 hover:bg-white/50 rounded-xl text-sm font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2.5 text-primary-600 hover:bg-white/50 rounded-xl text-sm font-medium" onClick={closeAll}>Sign In</Link>
                <Link to="/register" className="block px-4 py-2.5 text-gray-700 hover:bg-white/50 rounded-xl text-sm font-medium" onClick={closeAll}>Create Account</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900/70 backdrop-blur-xl text-white/80 mt-auto border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="text-white text-lg font-semibold mb-1">Emiti Dagala</h3>
            <p className="text-white/60 text-xs mb-2">Nakasero Herbal Market</p>
            <p className="text-sm leading-relaxed text-white/70">Trusted Herbal Marketplace. Connecting you with authentic herbal medicine vendors.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="text-white/70 hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/vendors" className="text-white/70 hover:text-white transition-colors">Vendors</Link></li>
              <li><Link to="/categories" className="text-white/70 hover:text-white transition-colors">Categories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Legal</h4>
            <p className="text-xs leading-relaxed text-white/70">
              Herbal products are not intended to diagnose, treat, cure, or prevent disease unless approved by relevant authorities.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/70">
          <p>Copyright &copy; {new Date().getFullYear()} Emiti Dagala - Byekwaso Ephron. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
