import { Link } from '@tanstack/react-router';
import { Heart, Users, Sparkles, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function LandingPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleGetStarted = async () => {
    if (!isAuthenticated) {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Hero Section */}
      <section
        className="relative py-20 md:py-32 overflow-hidden"
        style={{
          backgroundImage: 'url(/assets/generated/hero-bg.dim_1200x600.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/80 via-pink-500/70 to-coral-500/80 backdrop-blur-sm" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Find Your Perfect Match</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Connect with
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                Someone Special
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Discover meaningful connections based on shared interests and authentic profiles
            </p>
            {isAuthenticated ? (
              <Link to="/browse">
                <Button
                  size="lg"
                  className="bg-white text-rose-600 hover:bg-rose-50 shadow-2xl shadow-rose-900/50 text-lg px-8 py-6 rounded-full"
                >
                  Start Browsing
                  <Heart className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button
                onClick={handleGetStarted}
                disabled={isLoggingIn}
                size="lg"
                className="bg-white text-rose-600 hover:bg-rose-50 shadow-2xl shadow-rose-900/50 text-lg px-8 py-6 rounded-full"
              >
                {isLoggingIn ? 'Connecting...' : 'Get Started'}
                <Heart className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">
            Why Match Connect?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow border border-rose-100 dark:border-rose-900">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Interest-Based Matching</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with people who share your passions and interests for more meaningful conversations
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow border border-rose-100 dark:border-rose-900">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your data is protected with blockchain technology and Internet Identity authentication
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow border border-rose-100 dark:border-rose-900">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Real Connections</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Focus on quality over quantity with authentic profiles and mutual interest matching
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Find Your Match?</h2>
            <p className="text-xl text-white/90 mb-8">
              Join Match Connect today and start your journey to meaningful connections
            </p>
            {isAuthenticated ? (
              <Link to="/browse">
                <Button
                  size="lg"
                  className="bg-white text-rose-600 hover:bg-rose-50 shadow-xl text-lg px-8 py-6 rounded-full"
                >
                  Start Browsing Now
                  <Heart className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button
                onClick={handleGetStarted}
                disabled={isLoggingIn}
                size="lg"
                className="bg-white text-rose-600 hover:bg-rose-50 shadow-xl text-lg px-8 py-6 rounded-full"
              >
                {isLoggingIn ? 'Connecting...' : 'Join Now'}
                <Heart className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
