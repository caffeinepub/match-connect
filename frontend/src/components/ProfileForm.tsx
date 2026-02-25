import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { X, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Principal } from '@dfinity/principal';

interface ProfileFormProps {
  existingProfile?: {
    id: Principal;
    displayName: string;
    age: bigint;
    bio: string;
    interests: string[];
  } | null;
  onSuccess?: () => void;
}

export default function ProfileForm({ existingProfile, onSuccess }: ProfileFormProps) {
  const { identity } = useInternetIdentity();
  const saveProfile = useSaveCallerUserProfile();

  const [displayName, setDisplayName] = useState(existingProfile?.displayName || '');
  const [age, setAge] = useState(existingProfile ? Number(existingProfile.age) : '');
  const [bio, setBio] = useState(existingProfile?.bio || '');
  const [interests, setInterests] = useState<string[]>(existingProfile?.interests || []);
  const [newInterest, setNewInterest] = useState('');

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please login first');
      return;
    }

    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    const ageNum = typeof age === 'string' ? parseInt(age, 10) : age;
    if (!ageNum || isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
      toast.error('Please enter a valid age (18-120)');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        id: identity.getPrincipal(),
        displayName: displayName.trim(),
        age: BigInt(ageNum),
        bio: bio.trim() || 'No bio yet',
        interests,
      });

      toast.success('Profile saved successfully!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 border border-rose-100 dark:border-rose-900">
      <div className="space-y-6">
        <div>
          <Label htmlFor="displayName" className="text-gray-900 dark:text-white">
            Name *
          </Label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="mt-2"
            required
          />
        </div>

        <div>
          <Label htmlFor="age" className="text-gray-900 dark:text-white">
            Age *
          </Label>
          <Input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Your age"
            min="18"
            max="120"
            className="mt-2"
            required
          />
        </div>

        <div>
          <Label htmlFor="bio" className="text-gray-900 dark:text-white">
            Bio
          </Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            className="mt-2 min-h-[120px]"
            maxLength={500}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{bio.length}/500 characters</p>
        </div>

        <div>
          <Label className="text-gray-900 dark:text-white">Interests</Label>
          <div className="flex gap-2 mt-2">
            <Input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddInterest();
                }
              }}
              placeholder="Add an interest"
            />
            <Button type="button" onClick={handleAddInterest} variant="outline" size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1 bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 text-rose-700 dark:text-rose-300 px-3 py-1 rounded-full text-sm"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    className="hover:text-rose-900 dark:hover:text-rose-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={saveProfile.isPending}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/30"
        >
          {saveProfile.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Profile'
          )}
        </Button>
      </div>
    </form>
  );
}
