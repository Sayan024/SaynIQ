import React from 'react';
import { FaGithub, FaTwitter, FaLinkedin, FaHeart } from 'react-icons/fa';
import { APP_INFO, NAV_LINKS } from '../constants';

const Footer = () => {
  return (
    <footer className="bg-dark-soft border-t border-white/5 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold tracking-tight">{APP_INFO.name}</span>
            </div>
            <p className="text-white/50 max-w-sm mb-6">
              {APP_INFO.description}
            </p>
            <div className="flex items-center gap-4">
              <a href={APP_INFO.githubUrl} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors text-xl">
                <FaGithub />
              </a>
              <a href="#" className="text-white/50 hover:text-white transition-colors text-xl">
                <FaTwitter />
              </a>
              <a href="#" className="text-white/50 hover:text-white transition-colors text-xl">
                <FaLinkedin />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-white/50 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-white/50 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-white/50 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-white/50 hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} {APP_INFO.name}. All rights reserved.
          </p>
          <p className="text-white/30 text-sm flex items-center gap-1">
            Built with <FaHeart className="text-primary" /> by <span className="text-white/60">{APP_INFO.developer}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
