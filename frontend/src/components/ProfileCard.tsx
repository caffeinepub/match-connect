import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAddMatchDecision } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Principal } from '@dfinity/principal';
import { Variant_like_pass } from '../backend';

interface ProfileCardProps {
  profile: {
    id: Principal;
    displayName: string;
    age: bigint;
    bio: string;
    interests: string[];
  };
  onNext: () => void;
}

export default function ProfileCard({ profile, onNext }: ProfileCardProps) {
  const { identity } = useInternetIdentity();
  const addMatchDecision = useAddMatchDecision();
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);

  const handleDecision = async (decision: Variant_like_pass) => {
    if (!identity) return;

    setIsAnimating(true);
    setAnimationDirection(decision === Variant_like_pass.like ? 'right' : 'left');

    try {
      await addMatchDecision.mutateAsync({
        id: profile.id,
        decision,
      });

      if (decision === Variant_like_pass.like) {
        toast.success(`You liked ${profile.displayName}!`);
      }

      setTimeout(() => {
        setIsAnimating(false);
        setAnimationDirection(null);
        onNext();
      }, 300);
    } catch (error) {
      console.error('Error making decision:', error);
      toast.error('Failed to save decision. Please try again.');
      setIsAnimating(false);
      setAnimationDirection(null);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-rose-100 dark:border-rose-900 transition-all duration-300 ${
        isAnimating
          ? animationDirection === 'right'
            ? 'translate-x-[120%] rotate-12 opacity-0'
            : '-translate-x-[120%] -rotate-12 opacity-0'
          : 'translate-x-0 rotate-0 opacity-100'
      }`}
    >
      <div className="aspect-[3/4] bg-gradient-to-br from-rose-200 to-pink-200 dark:from-rose-900 dark:to-pink-900 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-32 h-32 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-5xl font-bold shadow-xl">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {profile.displayName}, {Number(profile.age)}
          </h2>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About</h3>
          <p className="text-gray-600 dark:text-gray-300">{profile.bio}</p>
        </div>

        {profile.interests.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 text-rose-700 dark:text-rose-300 px-4 py-2 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            onClick={() => handleDecision(Variant_like_pass.pass)}
            disabled={addMatchDecision.isPending}
            variant="outline"
            className="flex-1 h-14 border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
          >
            {addMatchDecision.isPending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <img src="/assets/generated/pass-icon.dim_64x64.png" alt="Pass" className="w-8 h-8" />
            )}
          </Button>
          <Button
            onClick={() => handleDecision(Variant_like_pass.like)}
            disabled={addMatchDecision.isPending}
            className="flex-1 h-14 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/30"
          >
            {addMatchDecision.isPending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <img src="/assets/generated/heart-icon.dim_64x64.png" alt="Like" className="w-8 h-8" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
