import React from 'react';
import { Building, Menu, X, LogIn, LogOut, User as UserIcon, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const token = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  const getDashboardLink = () => {
    if (userRole === 'ADMIN') return '/admin/dashboard';
    if (userRole === 'RESIDENT') return '/dashboard/resident';
    if (userRole === 'SUPPLIER') return '/supplier/portal';
    return '/login';
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Notices', path: '/notices' },
    { name: 'Blog', path: '/blog' },
     { name: 'Market Place', path: '/marketplace' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Carnivals', path: '/carnivals' },
    { name: 'Tenders', path: '/tenders' },
  ];

  return (
    <div className="fixed top-8 left-0 right-0 z-[100] flex justify-center px-6">
      <nav className="bg-[#1f1b16]/80 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-full px-3 py-2 flex items-center justify-between w-full max-w-6xl transition-all duration-500">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 pl-6 group">
          <div className="relative">
            <div className="bg-[#a88d5e] p-2 rounded-full text-[#1f1b16] transition-transform duration-500 group-hover:rotate-[360deg]">
              <Building className="w-4 h-4" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-[#a88d5e] animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif italic text-white text-lg leading-none tracking-tight hidden sm:block">
              HomeAvatar
            </span>
            <span className="text-[8px] uppercase tracking-[0.3em] text-[#a88d5e] font-bold hidden sm:block">
              Living Redefined
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                isActive(item.path) 
                ? 'text-[#a88d5e] bg-white/5' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-3 pr-2">
          {token ? (
            <div className="flex items-center gap-3">
              <Link 
                to={getDashboardLink()} 
                className="hidden sm:flex items-center gap-3 px-6 py-2.5 bg-[#a88d5e] text-[#1f1b16] rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-all duration-300 shadow-lg shadow-[#a88d5e]/20"
              >
                <UserIcon size={14} />
                Portal
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2.5 bg-white/5 text-gray-400 rounded-full hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 border border-white/5"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center gap-3 px-8 py-3 bg-white text-[#1f1b16] rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#a88d5e] hover:text-[#1f1b16] transition-all duration-500"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden p-3 bg-white/5 rounded-full text-[#a88d5e] border border-white/5 transition-all"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-[#1f1b16] z-[-1] flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
           <div className="flex flex-col gap-8 text-center">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-3xl font-serif italic transition-all ${
                  isActive(item.path) ? 'text-[#a88d5e]' : 'text-gray-500'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="w-12 h-[1px] bg-[#a88d5e]/30 mx-auto my-4"></div>
            {!token && (
               <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#a88d5e] text-sm font-bold uppercase tracking-[0.4em]"
              >
                Member Login
              </Link>
            )}
           </div>
        </div>
      )}
    </div>
  );
};

export default Header;