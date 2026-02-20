import { useEffect, useMemo } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserMatches, useGetConversation, useGetUserProfile } from '../hooks/useQueries';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Variant_like_pass } from '../backend';
import type { Principal } from '@dfinity/principal';

function ConversationItem({ partnerId }: { partnerId: Principal }) {
  const navigate = useNavigate();
  const { data: profile } = useGetUserProfile(partnerId);
  const { data: conversation } = useGetConversation(partnerId);

  if (!profile) return null;

  const allMessages = [
    ...(conversation?.sent || []),
    ...(conversation?.received || []),
  ].sort((a, b) => Number(a.timestamp - b.timestamp));

  const lastMessage = allMessages[allMessages.length - 1];
  const unreadCount = Number(conversation?.unreadCount || 0);

  return (
    <div
      onClick={() => navigate({ to: `/messages/${partnerId.toString()}` })}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer border border-rose-100 dark:border-rose-900 group"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
          {profile.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {profile.displayName}
            </h3>
            {unreadCount > 0 && (
              <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {lastMessage && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {lastMessage.content}
            </p>
          )}
          {!lastMessage && (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              No messages yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: myMatches, isLoading } = useGetUserMatches(identity?.getPrincipal() || null);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  // Get mutual matches (both users liked each other)
  const mutualMatches = useMemo(() => {
    if (!myMatches) return [];
    
    const myLikes = myMatches.filter(m => m.decision === Variant_like_pass.like);
    // For now, we'll show all liked profiles as potential conversations
    // In a real app, you'd need to check if they also liked back
    return myLikes;
  }, [myMatches]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (mutualMatches.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">No Conversations Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            Start browsing profiles and make matches to begin messaging!
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
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">
              Messages
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {mutualMatches.length} conversation{mutualMatches.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="space-y-3">
            {mutualMatches.map((match) => (
              <ConversationItem key={match.id.toString()} partnerId={match.id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
