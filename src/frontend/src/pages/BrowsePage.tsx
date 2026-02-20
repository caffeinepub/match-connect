import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetProfiles, useGetCallerUserProfile, useGetUserMatches } from '../hooks/useQueries';
import ProfileCard from '../components/ProfileCard';
import { Heart, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function BrowsePage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: allProfiles, isLoading: profilesLoading } = useGetProfiles();
  const { data: myMatches } = useGetUserMatches(identity?.getPrincipal() || null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (profilesLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading profiles...</p>
        </div>
      </div>
    );
  }

  // Filter out current user and already matched/passed profiles
  const myPrincipal = identity.getPrincipal().toString();
  const matchedIds = new Set(myMatches?.map((m) => m.id.toString()) || []);

  const availableProfiles = allProfiles?.filter((profile) => {
    const profileId = profile.id.toString();
    return profileId !== myPrincipal && !matchedIds.has(profileId);
  }) || [];

  const displayProfile = availableProfiles[currentIndex];

  const handleNext = () => {
    if (currentIndex < availableProfiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!displayProfile) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">No More Profiles</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            You've seen all available profiles! Check back later for new matches.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">
              Discover Matches
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {availableProfiles.length - currentIndex} profile{availableProfiles.length - currentIndex !== 1 ? 's' : ''} remaining
            </p>
          </div>
          <ProfileCard profile={displayProfile} onNext={handleNext} />
        </div>
      </div>
    </div>
  );
}
