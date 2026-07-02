import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icons';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/services', label: 'Services' },
  { to: '/tarifs', label: 'Tarifs' },
  { to: '/prestataires', label: 'Prestataires' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, logout, isAuthenticated } = useAuth();

  const prenom = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Mon compte';
  const initiale = prenom[0]?.toUpperCase() || 'U';

  const dashboardLink = () => {
    if (userRole === 'admin') return '/admin/dashboard';
    if (userRole === 'prestataire') return '/dashboard/prestataire';
    return '/dashboard/client';
  };

 const handleLogout = async () => {
  setDropdownOpen(false);
  setMobileOpen(false);
  await logout();
  window.location.href = '/';
};

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-[#1B3A6B] font-bold text-xl no-underline">
          <span className="bg-[#3A9E3A] text-white p-2 rounded-xl">
            <Icon name="home" size={18} color="white" />
          </span>
          <span>Teranga <span className="text-[#3A9E3A]">Service</span></span>
        </Link>

        {/* Menu desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all no-underline ${
                location.pathname === link.to ? 'bg-green-50 text-[#3A9E3A]' : 'text-gray-600 hover:bg-gray-50 hover:text-[#3A9E3A]'
              }`}>
              {link.label}
            </Link>
          ))}

          <div className="w-px h-6 bg-gray-200 mx-2" />

          {/* Cloche notifications */}
          <Link to="/notifications"
            className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 hover:bg-green-50 hover:border-[#3A9E3A] transition-all">
            <Icon name="bell" size={16} color="#1B3A6B" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">2</span>
          </Link>

          {isAuthenticated ? (
            <div className="relative ml-2">
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-gray-100 border border-gray-200 text-[#1B3A6B] px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all">
                <span className="w-6 h-6 bg-[#3A9E3A] rounded-full flex items-center justify-center text-white text-xs font-bold">{initiale}</span>
                {prenom}
                <Icon name="chevrondown" size={12} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg w-48 overflow-hidden z-50">
                  <Link to={dashboardLink()} onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-[#1B3A6B] hover:bg-gray-50 no-underline border-b border-gray-100">
                    <Icon name="dashboard" size={14} color="#1B3A6B" /> Dashboard
                  </Link>
                  <Link to="/reserver" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 no-underline border-b border-gray-100">
                    <Icon name="calendar" size={14} color="#6B7280" /> Réserver
                  </Link>
                  <Link to="/messages" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 no-underline border-b border-gray-100">
                    <Icon name="chat" size={14} color="#6B7280" /> Messages
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 text-left">
                    <Icon name="logout" size={14} color="#EF4444" /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link to="/connexion" className="px-4 py-2 text-sm font-semibold text-[#1B3A6B] border border-[#1B3A6B] rounded-lg hover:bg-[#1B3A6B] hover:text-white transition-all no-underline">
                Connexion
              </Link>
              <Link to="/inscription" className="px-4 py-2 text-sm font-semibold bg-[#3A9E3A] text-white rounded-lg hover:bg-[#2d8a2d] transition-all no-underline">
                Inscription
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger mobile */}
        <button className="md:hidden p-2 border border-[#1B3A6B] rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}>
          <Icon name={mobileOpen ? 'x' : 'menu'} size={20} color="#1B3A6B" />
        </button>
      </nav>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="md:hidden bg-[#142d55] border-t border-white/10">
          <div className="px-4 py-2">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 py-3 text-white text-sm border-b border-white/10 no-underline hover:text-[#3A9E3A] transition-colors">
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-4 pb-2">
              {isAuthenticated ? (
                <>
                  <Link to={dashboardLink()} onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center text-white text-sm py-2.5 border border-white/30 rounded-lg no-underline hover:bg-white/10 transition-all">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout}
                    className="flex-1 text-center text-white text-sm py-2.5 bg-red-500 rounded-lg font-semibold hover:bg-red-600 transition-all">
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/connexion" onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center text-white text-sm py-2.5 border border-white/30 rounded-lg no-underline hover:bg-white/10 transition-all">
                    Connexion
                  </Link>
                  <Link to="/inscription" onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center text-white text-sm py-2.5 bg-[#3A9E3A] rounded-lg no-underline font-semibold hover:bg-[#2d8a2d] transition-all">
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
