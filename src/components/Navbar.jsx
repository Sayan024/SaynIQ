import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Palette, Check, Home, Layout, Image, Info, 
  Phone, Menu, X, Download, ShieldCheck 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const Navbar = () => {
  const { currentTheme, setCurrentTheme, themes } = useTheme();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [apkLink, setApkLink] = useState("https://drive.usercontent.google.com/download?id=1Ew94c5ItQtYOdYpgoasxGC68J8tBbQod&export=download");
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const configRef = doc(db, 'config', 'app');
        const snap = await getDoc(configRef);
        if (snap.exists() && snap.data().downloadLink) {
          setApkLink(snap.data().downloadLink);
        }
      } catch (e) {}
    };
    fetchLink();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      if (isLanding) {
        const sections = ['home', 'features', 'screenshots', 'about', 'contact'];
        const current = sections.find(section => {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            return rect.top <= 100 && rect.bottom >= 100;
          }
          return false;
        });
        if (current) setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLanding]);

  const navLinks = [
    { name: 'Home', href: '#home', icon: Home, id: 'home' },
    { name: 'Features', href: '#features', icon: Layout, id: 'features' },
    { name: 'Showcase', href: '#screenshots', icon: Image, id: 'screenshots' },
    { name: 'About', href: '#about', icon: Info, id: 'about' },
    { name: 'Contact', href: '#contact', icon: Phone, id: 'contact' },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-300 ${
        scrolled 
          ? 'bg-premium-dark/80 backdrop-blur-2xl border-b border-white/5 py-3 shadow-2xl shadow-black/20' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group relative z-50">
        <div className="w-10 h-10 bg-premium-purple rounded-xl flex items-center justify-center shadow-lg shadow-premium-purple/20 group-hover:scale-110 transition-transform">
          <Zap className="text-white fill-white" size={20} />
        </div>
        <span className="text-2xl font-black tracking-tighter text-white uppercase text-gradient">SaynIQ</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xl">
        {navLinks.map((link) => (
          <a 
            key={link.id}
            href={link.href} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              activeSection === link.id 
                ? 'bg-premium-purple text-white shadow-lg shadow-premium-purple/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <link.icon size={16} className={activeSection === link.id ? 'text-white' : 'text-gray-500'} />
            <span>{link.name}</span>
          </a>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 relative z-50">
        <div className="hidden md:flex items-center gap-6 pr-4 border-r border-white/10">
           <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-premium-lightPurple transition-colors">
              Admin Access
           </Link>
        </div>

        {/* Theme Selector */}
        <div className="relative">
          <button 
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-premium-purple/10 transition-all active:scale-95 flex items-center gap-2 group"
          >
            <Palette size={20} className="group-hover:rotate-12 transition-transform" />
          </button>

          <AnimatePresence>
            {showThemeSelector && (
              <>
                <div className="fixed inset-0 z-0" onClick={() => setShowThemeSelector(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-64 p-3 bg-premium-dark/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10"
                >
                  <div className="px-4 py-3 border-b border-white/5 mb-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Aesthetic Palette</p>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setCurrentTheme(theme.id);
                          setShowThemeSelector(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                          currentTheme === theme.id 
                            ? 'bg-premium-purple/20 text-white border border-premium-purple/30' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-lg shadow-inner flex items-center justify-center" style={{ backgroundColor: theme.color }}>
                             {currentTheme === theme.id && <div className="w-2 h-2 bg-white rounded-full shadow-lg" />}
                          </div>
                          {theme.name}
                        </div>
                        {currentTheme === theme.id && <Check size={16} className="text-premium-lightPurple" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <a 
          href={apkLink}
          className="hidden md:flex px-6 py-3 bg-premium-purple text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-premium-purple/20 hover:bg-premium-purple/90 transition-all hover:scale-105 active:scale-95 items-center gap-2"
        >
          <Download size={16} />
          <span>Get App</span>
        </a>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-3 rounded-xl bg-white/5 border border-white/10 text-white"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-premium-dark/98 backdrop-blur-3xl lg:hidden flex flex-col pt-32 px-8 space-y-8"
          >
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 mb-8">Navigation Hub</p>
              {navLinks.map((link) => (
                <a 
                  key={link.id}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-6 p-5 rounded-3xl text-2xl font-black tracking-tight transition-all ${
                    activeSection === link.id 
                      ? 'bg-premium-purple/20 text-white border border-premium-purple/20' 
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <link.icon size={32} className={activeSection === link.id ? 'text-premium-lightPurple' : 'text-gray-700'} />
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-12 mt-auto pb-12 space-y-6">
              <Link 
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-3 w-full p-6 bg-white/5 border border-white/10 rounded-3xl text-lg font-black text-gray-300"
              >
                <ShieldCheck size={24} />
                Admin Portal
              </Link>
              <a 
                href={apkLink}
                className="flex items-center justify-center gap-3 w-full p-6 bg-premium-purple rounded-3xl text-xl font-black text-white shadow-2xl shadow-premium-purple/20"
              >
                <Download size={24} />
                Download APK
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
