import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../common/Logo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed w-full z-30 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <Logo size="md" />
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link 
                to="/" 
                className={`font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-blue-600' 
                    : 'text-gray-800 hover:text-blue-600'
                }`}
              >
                Accueil
              </Link>
              <Link 
                to="/services" 
                className={`font-medium transition-colors ${
                  isActive('/services') 
                    ? 'text-blue-600' 
                    : 'text-gray-800 hover:text-blue-600'
                }`}
              >
                Services
              </Link>
              <Link 
                to="/about" 
                className={`font-medium transition-colors ${
                  isActive('/about') 
                    ? 'text-blue-600' 
                    : 'text-gray-800 hover:text-blue-600'
                }`}
              >
                À propos
              </Link>
              <Link 
                to="/contact" 
                className={`font-medium transition-colors ${
                  isActive('/contact') 
                    ? 'text-blue-600' 
                    : 'text-gray-800 hover:text-blue-600'
                }`}
              >
                Contact
              </Link>

              {user ? (
                <Link
                  to={`/dashboard/${user.role}`}
                  className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Tableau de bord
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-800"
              aria-expanded="false"
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-md">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2 rounded-md ${
              isActive('/') 
                ? 'text-blue-600 font-medium' 
                : 'text-gray-800 hover:text-blue-600'
            }`}
          >
            Accueil
          </Link>
          <Link
            to="/services"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2 rounded-md ${
              isActive('/services') 
                ? 'text-blue-600 font-medium' 
                : 'text-gray-800 hover:text-blue-600'
            }`}
          >
            Services
          </Link>
          <Link
            to="/about"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2 rounded-md ${
              isActive('/about') 
                ? 'text-blue-600 font-medium' 
                : 'text-gray-800 hover:text-blue-600'
            }`}
          >
            À propos
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2 rounded-md ${
              isActive('/contact') 
                ? 'text-blue-600 font-medium' 
                : 'text-gray-800 hover:text-blue-600'
            }`}
          >
            Contact
          </Link>
          
          {user ? (
            <Link
              to={`/dashboard/${user.role}`}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-white bg-blue-600 text-center"
            >
              Tableau de bord
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-white bg-blue-600 text-center"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;