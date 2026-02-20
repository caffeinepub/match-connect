import { useEffect, useRef, useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetConversation, useSendMessage, useMarkAsRead, useGetUserProfile } from '../hooks/useQueries';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Principal } from '@dfinity/principal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface ChatViewProps {
  partnerId: string;
}

export default function ChatView({ partnerId }: ChatViewProps) {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const partnerPrincipal = Principal.fromText(partnerId);
  const { data: partnerProfile } = useGetUserProfile(partnerPrincipal);
  const { data: conversation, isLoading } = useGetConversation(partnerPrincipal);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (conversation && conversation.unreadCount > 0) {
      markAsReadMutation.mutate(partnerPrincipal);
    }
  }, [conversation?.unreadCount]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({
        recipient: partnerPrincipal,
        content: messageText.trim(),
      });
      setMessageText('');
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Send message error:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading || !partnerProfile) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  const allMessages = [
    ...(conversation?.sent || []).map(m => ({ ...m, isSent: true })),
    ...(conversation?.received || []).map(m => ({ ...m, isSent: false })),
  ].sort((a, b) => Number(a.timestamp - b.timestamp));

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-rose-200 dark:border-rose-900 sticky top-[73px] z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/messages' })}
              className="text-gray-700 dark:text-gray-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
              {partnerProfile.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {partnerProfile.displayName}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {Number(partnerProfile.age)} years old
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {allMessages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No messages yet. Start the conversation!
                </p>
              </div>
            )}
            {allMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    message.isSent
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-rose-100 dark:border-rose-900'
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.isSent ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {new Date(Number(message.timestamp) / 1000000).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-rose-200 dark:border-rose-900 sticky bottom-0">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border-rose-200 dark:border-rose-900 focus:border-rose-500"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                type="submit"
                disabled={!messageText.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
