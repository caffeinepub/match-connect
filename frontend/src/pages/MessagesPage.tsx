import { useEffect, useMemo } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserMatches, useGetConversation, useGetUserProfile } from '../hooks/useQueries';
import { MessageCircle, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Variant_like_pass } from '../backend';
import type { Principal } from '@dfinity/principal';

// Pastel avatar gradient pairs per initial letter
function getAvatarGradient(name: string): string {
  const gradients = [
    'linear-gradient(135deg, #F9A8D4, #E9D5FF)',
    'linear-gradient(135deg, #6EE7B7, #A7F3D0)',
    'linear-gradient(135deg, #FB923C, #FDE68A)',
    'linear-gradient(135deg, #93C5FD, #C4B5FD)',
    'linear-gradient(135deg, #FCA5A5, #FCD34D)',
    'linear-gradient(135deg, #67E8F9, #A5F3FC)',
  ];
  const idx = name.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

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

  const avatarGradient = getAvatarGradient(profile.displayName);

  return (
    <div
      onClick={() => navigate({ to: `/messages/${partnerId.toString()}` })}
      className="group relative bg-white dark:bg-gray-900 rounded-3xl p-4 hover:shadow-xl transition-all duration-300 cursor-pointer border border-rose-100/60 dark:border-rose-900/30 hover:-translate-y-0.5 hover:border-rose-200 dark:hover:border-rose-800"
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-rose-50/0 to-pink-50/0 group-hover:from-rose-50/60 group-hover:to-pink-50/40 dark:group-hover:from-rose-950/20 dark:group-hover:to-pink-950/10 transition-all duration-300 pointer-events-none" />

      <div className="relative flex items-center gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-gray-700 text-xl font-bold shadow-md"
            style={{ background: avatarGradient }}
          >
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-[10px] font-bold">{unreadCount}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
              {profile.displayName}
            </h3>
            {lastMessage && (
              <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                {new Date(Number(lastMessage.timestamp) / 1000000).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>

          {lastMessage ? (
            <p
              className={`text-sm truncate ${
                unreadCount > 0
                  ? 'text-gray-800 dark:text-gray-200 font-medium'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {lastMessage.content}
            </p>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              Say hello! 👋
            </p>
          )}
        </div>

        {/* Arrow indicator */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F9A8D4, #E9D5FF)' }}
          >
            <svg className="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
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

  const mutualMatches = useMemo(() => {
    if (!myMatches) return [];
    return myMatches.filter(m => m.decision === Variant_like_pass.like);
  }, [myMatches]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <Loader2 className="w-16 h-16 animate-spin text-rose-300" />
            <MessageCircle className="w-7 h-7 text-rose-500 absolute inset-0 m-auto" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (mutualMatches.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
            style={{ background: 'linear-gradient(135deg, #F9A8D4, #E9D5FF)' }}
          >
            <MessageCircle className="w-14 h-14 text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
            No conversations yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            Start browsing profiles and make matches to begin messaging! 💕
          </p>
          <button
            onClick={() => navigate({ to: '/browse' })}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #F9A8D4, #C084FC)' }}
          >
            <Sparkles className="w-4 h-4" />
            Start Browsing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-2xl">💌</span>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                Messages
              </h1>
              <span className="text-2xl">💌</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {mutualMatches.length} conversation{mutualMatches.length !== 1 ? 's' : ''} waiting
            </p>
          </div>

          {/* Conversation List */}
          <div className="space-y-3">
            {mutualMatches.map((match, i) => (
              <div
                key={match.id.toString()}
                className="conversation-item-enter"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <ConversationItem partnerId={match.id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
