import { useEffect, useMemo } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserMatches, useGetFeed, useGetUserProfile } from '../hooks/useQueries';
import { Image as ImageIcon, Loader2, Plus } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Variant_like_pass } from '../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CreatePostForm from '../components/CreatePostForm';
import { Button } from '@/components/ui/button';

function PostCard({ post }: { post: any }) {
  const { data: profile } = useGetUserProfile(post.owner);

  const imageUrl = post.photo.getDirectURL();
  const timestamp = new Date(Number(post.timestamp) / 1000000);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-rose-100 dark:border-rose-900">
      {/* Post Header */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
          {profile?.displayName.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {profile?.displayName || 'Unknown'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {timestamp.toLocaleDateString()} at {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Post Image */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-900">
        <img
          src={imageUrl}
          alt={post.caption}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Post Caption */}
      {post.caption && (
        <div className="p-4">
          <p className="text-gray-900 dark:text-white">{post.caption}</p>
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: myMatches, isLoading: matchesLoading } = useGetUserMatches(identity?.getPrincipal() || null);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  // Get mutual matches
  const mutualMatchIds = useMemo(() => {
    if (!myMatches) return [];
    return myMatches
      .filter(m => m.decision === Variant_like_pass.like)
      .map(m => m.id);
  }, [myMatches]);

  const { data: posts, isLoading: feedLoading } = useGetFeed(mutualMatchIds);

  // Sort posts by timestamp (newest first)
  const sortedPosts = useMemo(() => {
    if (!posts) return [];
    return [...posts].sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [posts]);

  if (!isAuthenticated) {
    return null;
  }

  if (matchesLoading || feedLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading feed...</p>
        </div>
      </div>
    );
  }

  if (mutualMatchIds.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">No Posts Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            Start browsing profiles and make matches to see their posts!
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

  if (sortedPosts.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">
                Feed
              </h1>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                  </DialogHeader>
                  <CreatePostForm />
                </DialogContent>
              </Dialog>
            </div>
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-rose-100 dark:border-rose-900">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No posts yet from your matches. Be the first to share!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">
                Feed
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {sortedPosts.length} post{sortedPosts.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                </DialogHeader>
                <CreatePostForm />
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-6">
            {sortedPosts.map((post, index) => (
              <PostCard key={index} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
