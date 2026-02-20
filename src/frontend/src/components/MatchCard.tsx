import { useGetProfileById } from '../hooks/useQueries';
import { Loader2 } from 'lucide-react';
import type { Principal } from '@dfinity/principal';

interface MatchCardProps {
  userId: Principal;
}

export default function MatchCard({ userId }: MatchCardProps) {
  const { data: profile, isLoading } = useGetProfileById(userId);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-rose-100 dark:border-rose-900 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-rose-100 dark:border-rose-900 group cursor-pointer">
      <div className="aspect-square bg-gradient-to-br from-rose-200 to-pink-200 dark:from-rose-900 dark:to-pink-900 flex items-center justify-center group-hover:scale-105 transition-transform">
        <div className="w-24 h-24 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl">
          {profile.displayName.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {profile.displayName}, {Number(profile.age)}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">{profile.bio}</p>
        {profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 text-rose-700 dark:text-rose-300 px-2 py-1 rounded-full text-xs"
              >
                {interest}
              </span>
            ))}
            {profile.interests.length > 3 && (
              <span className="text-gray-500 dark:text-gray-400 text-xs px-2 py-1">
                +{profile.interests.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
