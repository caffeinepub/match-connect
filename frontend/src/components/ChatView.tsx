import { useEffect, useRef, useState, useCallback } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetConversation, useSendMessage, useMarkAsRead, useGetUserProfile } from '../hooks/useQueries';
import { ArrowLeft, Send, Loader2, Heart, ImagePlus, X } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Principal } from '@dfinity/principal';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useChatTheme } from '../hooks/useChatTheme';
import ChatThemePanel from './ChatThemePanel';

const MAX_IMAGE_SIZE_BYTES = 1.5 * 1024 * 1024; // 1.5 MB

interface ChatViewProps {
  partnerId: string;
}

export default function ChatView({ partnerId }: ChatViewProps) {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const partnerPrincipal = Principal.fromText(partnerId);
  const { data: partnerProfile } = useGetUserProfile(partnerPrincipal);
  const { data: conversation, isLoading } = useGetConversation(partnerPrincipal);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();
  const chatTheme = useChatTheme();

  const {
    resolvedSentColor,
    resolvedReceivedColor,
    resolvedBackground,
    resolvedBackgroundImage,
    fontSizeClass,
    settings,
  } = chatTheme;

  const isAuthenticated = !!identity;
  const isSending = sendMessageMutation.isPending || isReadingFile;

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

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error('Image is too large. Please choose an image under 1.5 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPendingImage(dataUrl);
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      toast.error('Failed to read image file.');
      setIsReadingFile(false);
    };
    reader.readAsDataURL(file);

    // Reset file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !pendingImage) return;

    try {
      await sendMessageMutation.mutateAsync({
        recipient: partnerPrincipal,
        content: messageText.trim(),
        image: pendingImage ?? null,
      });
      setMessageText('');
      setPendingImage(null);
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Send message error:', error);
    }
  };

  const removePendingImage = () => {
    setPendingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const headerBg = settings.useCustomColors
    ? resolvedBackground
    : settings.theme.headerBackground;

  const sentTextColor = settings.useCustomColors ? '#1a1a1a' : settings.theme.sentTextColor;
  const receivedTextColor = settings.useCustomColors ? '#1a1a1a' : settings.theme.receivedTextColor;

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col">
      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            onClick={() => setLightboxSrc(null)}
            aria-label="Close image"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxSrc}
            alt="Full size"
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Chat Header */}
      <div
        className="border-b sticky top-[73px] z-40 shadow-sm"
        style={{ backgroundColor: headerBg, borderColor: resolvedSentColor + '40' }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/messages' })}
              className="rounded-full hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            {/* Avatar */}
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md flex-shrink-0 relative"
              style={{ background: `linear-gradient(135deg, ${resolvedSentColor}, ${resolvedReceivedColor})` }}
            >
              {partnerProfile.displayName.charAt(0).toUpperCase()}
              <span className="absolute -bottom-0.5 -right-0.5 text-sm">
                {settings.theme.emoji}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold truncate" style={{ color: sentTextColor }}>
                {partnerProfile.displayName}
              </h2>
              <p className="text-xs opacity-70" style={{ color: sentTextColor }}>
                {Number(partnerProfile.age)} years old
              </p>
            </div>

            {/* Theme Panel Trigger */}
            <div style={{ color: sentTextColor }}>
              <ChatThemePanel chatTheme={chatTheme} />
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto py-6"
        style={{
          backgroundColor: resolvedBackground,
          backgroundImage: resolvedBackgroundImage
            ? `url(${resolvedBackgroundImage})`
            : undefined,
          backgroundSize: '200px 200px',
          backgroundRepeat: 'repeat',
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-3">
            {allMessages.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">{settings.theme.emoji}</div>
                <p
                  className="text-sm font-medium opacity-60"
                  style={{ color: sentTextColor }}
                >
                  No messages yet — say hello!
                </p>
              </div>
            )}

            {allMessages.map((message, index) => {
              const isFirst =
                index === 0 || allMessages[index - 1].isSent !== message.isSent;
              const isLast =
                index === allMessages.length - 1 ||
                allMessages[index + 1].isSent !== message.isSent;

              const hasImage = !!(message as typeof message & { image?: string }).image;
              const imageData = (message as typeof message & { image?: string }).image;

              return (
                <div
                  key={index}
                  className={`flex ${message.isSent ? 'justify-end' : 'justify-start'} chat-message-enter`}
                  style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                >
                  {/* Received avatar */}
                  {!message.isSent && isFirst && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 mt-auto flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${resolvedSentColor}, ${resolvedReceivedColor})`,
                      }}
                    >
                      {partnerProfile.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {!message.isSent && !isFirst && <div className="w-7 mr-2 flex-shrink-0" />}

                  <div
                    className={`max-w-[72%] shadow-sm overflow-hidden ${
                      hasImage ? 'p-1.5' : 'px-4 py-2.5'
                    } ${
                      message.isSent
                        ? isFirst && isLast
                          ? 'rounded-3xl'
                          : isFirst
                          ? 'rounded-3xl rounded-br-lg'
                          : isLast
                          ? 'rounded-3xl rounded-tr-lg'
                          : 'rounded-3xl rounded-r-lg'
                        : isFirst && isLast
                        ? 'rounded-3xl'
                        : isFirst
                        ? 'rounded-3xl rounded-bl-lg'
                        : isLast
                        ? 'rounded-3xl rounded-tl-lg'
                        : 'rounded-3xl rounded-l-lg'
                    }`}
                    style={{
                      backgroundColor: message.isSent
                        ? resolvedSentColor
                        : resolvedReceivedColor,
                    }}
                  >
                    {/* Image content */}
                    {hasImage && imageData && (
                      <div className={message.content ? 'mb-1' : ''}>
                        <img
                          src={imageData}
                          alt="Shared image"
                          className="rounded-2xl cursor-pointer object-cover max-w-[240px] w-full hover:opacity-90 transition-opacity"
                          style={{ maxHeight: '240px' }}
                          onClick={() => setLightboxSrc(imageData)}
                        />
                      </div>
                    )}

                    {/* Text content */}
                    {message.content && (
                      <div className={hasImage ? 'px-2.5 pb-1' : ''}>
                        <p
                          className={`break-words leading-relaxed ${fontSizeClass}`}
                          style={{
                            color: message.isSent ? sentTextColor : receivedTextColor,
                          }}
                        >
                          {message.content}
                        </p>
                      </div>
                    )}

                    {/* Timestamp */}
                    <p
                      className={`text-xs mt-1 opacity-60 ${hasImage ? 'px-2.5 pb-1' : ''}`}
                      style={{
                        color: message.isSent ? sentTextColor : receivedTextColor,
                      }}
                    >
                      {new Date(Number(message.timestamp) / 1000000).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div
        className="border-t sticky bottom-0 shadow-lg"
        style={{
          backgroundColor: settings.useCustomColors
            ? resolvedBackground
            : settings.theme.inputBackground,
          borderColor: resolvedSentColor + '40',
        }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="max-w-4xl mx-auto space-y-2">
            {/* Pending image preview */}
            {pendingImage && (
              <div className="flex items-center gap-2 px-1">
                <div className="relative inline-block">
                  <img
                    src={pendingImage}
                    alt="Image to send"
                    className="h-16 w-16 rounded-xl object-cover border-2"
                    style={{ borderColor: resolvedSentColor + '80' }}
                  />
                  <button
                    type="button"
                    onClick={removePendingImage}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-900 transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-xs opacity-60" style={{ color: sentTextColor }}>
                  Image ready to send
                </span>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              {/* Heart emoji shortcut */}
              <button
                type="button"
                className="flex-shrink-0 text-xl hover:scale-125 transition-transform duration-200 select-none"
                onClick={() => setMessageText(prev => prev + '💕')}
                title="Add heart"
                disabled={isSending}
              >
                <Heart
                  className="w-5 h-5"
                  style={{ color: resolvedSentColor, fill: resolvedSentColor }}
                />
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
                disabled={isSending}
              />

              {/* Image upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
                title="Send image"
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  backgroundColor: pendingImage ? resolvedSentColor : resolvedSentColor + '20',
                  color: pendingImage ? sentTextColor : resolvedSentColor,
                }}
              >
                {isReadingFile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImagePlus className="w-4 h-4" />
                )}
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder={pendingImage ? 'Add a caption (optional)...' : 'Type a message...'}
                  className={`w-full rounded-full px-5 py-2.5 outline-none border-2 transition-all duration-200 ${fontSizeClass}`}
                  style={{
                    backgroundColor: 'white',
                    borderColor: resolvedSentColor + '80',
                    color: '#1a1a1a',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = resolvedSentColor;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${resolvedSentColor}30`;
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = resolvedSentColor + '80';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  disabled={isSending}
                />
              </div>

              <button
                type="submit"
                disabled={(!messageText.trim() && !pendingImage) || isSending}
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                style={{ backgroundColor: resolvedSentColor }}
              >
                {isSending ? (
                  <Loader2
                    className="w-4 h-4 animate-spin"
                    style={{ color: sentTextColor }}
                  />
                ) : (
                  <Send className="w-4 h-4" style={{ color: sentTextColor }} />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
