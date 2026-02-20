import { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserMatches, useGetProfileById } from '../hooks/useQueries';
import MatchCard from '../components/MatchCard';
import { Heart, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Variant_like_pass } from '../backend';

export default function MatchesPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: myMatches, isLoading } = useGetUserMatches(identity?.getPrincipal() || null);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading matches...</p>
        </div>
      </div>
    );
  }

  // Filter for mutual likes
  const likedProfiles = myMatches?.filter((m) => m.decision === Variant_like_pass.like) || [];

  if (likedProfiles.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">No Matches Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            Start browsing profiles to find your perfect match!
          </p>
          <button
            onClick={() => navigate({ to: '/browse' })}
            className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-full font-medium hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30"
          >
            Start Browsing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">
              Your Matches
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {likedProfiles.length} profile{likedProfiles.length !== 1 ? 's' : ''} you liked
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {likedProfiles.map((match) => (
              <MatchCard key={match.id.toString()} userId={match.id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
