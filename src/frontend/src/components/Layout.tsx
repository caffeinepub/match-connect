import { Link, useRouterState } from '@tanstack/react-router';
import { Heart, Users, User, Menu, X, MessageCircle, Image } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from './ui/button';
import { useState } from 'react';
import { SiX, SiInstagram } from 'react-icons/si';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { path: '/browse', label: 'Browse', icon: Heart },
    { path: '/matches', label: 'Matches', icon: Users },
    { path: '/messages', label: 'Messages', icon: MessageCircle },
    { path: '/feed', label: 'Feed', icon: Image },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50 via-pink-50 to-coral-50 dark:from-gray-900 dark:via-rose-950 dark:to-pink-950">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-rose-200/50 dark:border-rose-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Heart className="w-8 h-8 text-rose-500 fill-rose-500 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-rose-500 blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">
                Match Connect
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {isAuthenticated && navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentPath === link.path || (link.path === '/messages' && currentPath.startsWith('/messages'));
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-rose-100 dark:hover:bg-rose-900/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
              <Button
                onClick={handleAuth}
                disabled={isLoggingIn}
                variant={isAuthenticated ? 'outline' : 'default'}
                className={
                  isAuthenticated
                    ? 'border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300'
                    : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/30'
                }
              >
                {isLoggingIn ? 'Connecting...' : isAuthenticated ? 'Logout' : 'Login'}
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 flex flex-col gap-2">
              {isAuthenticated && navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentPath === link.path || (link.path === '/messages' && currentPath.startsWith('/messages'));
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-rose-100 dark:hover:bg-rose-900/30'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
              <Button
                onClick={() => {
                  handleAuth();
                  setMobileMenuOpen(false);
                }}
                disabled={isLoggingIn}
                variant={isAuthenticated ? 'outline' : 'default'}
                className={`w-full ${
                  isAuthenticated
                    ? 'border-rose-300 text-rose-700 hover:bg-rose-50'
                    : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white'
                }`}
              >
                {isLoggingIn ? 'Connecting...' : isAuthenticated ? 'Logout' : 'Login'}
              </Button>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg border-t border-rose-200/50 dark:border-rose-900/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>© {new Date().getFullYear()} Match Connect</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Built with</span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              <span>using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-600 dark:text-rose-400 hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-rose-500 transition-colors">
                <SiX className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-rose-500 transition-colors">
                <SiInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
