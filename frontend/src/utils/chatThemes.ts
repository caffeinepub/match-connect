export interface ChatTheme {
  id: string;
  name: string;
  sentBubbleColor: string;
  receivedBubbleColor: string;
  sentTextColor: string;
  receivedTextColor: string;
  chatBackground: string;
  chatBackgroundImage?: string;
  inputBackground: string;
  headerBackground: string;
  emoji: string;
}

export const PRESET_THEMES: ChatTheme[] = [
  {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    sentBubbleColor: '#F9A8D4',
    receivedBubbleColor: '#E9D5FF',
    sentTextColor: '#831843',
    receivedTextColor: '#4C1D95',
    chatBackground: '#FFF0F6',
    chatBackgroundImage: '/assets/generated/chat-bg-pastel-dream.dim_400x400.png',
    inputBackground: '#FFF0F6',
    headerBackground: '#FCE7F3',
    emoji: '🌸',
  },
  {
    id: 'night-sky',
    name: 'Night Sky',
    sentBubbleColor: '#4F46E5',
    receivedBubbleColor: '#1E293B',
    sentTextColor: '#EEF2FF',
    receivedTextColor: '#CBD5E1',
    chatBackground: '#0F172A',
    chatBackgroundImage: '/assets/generated/chat-bg-night-sky.dim_400x400.png',
    inputBackground: '#1E293B',
    headerBackground: '#1E293B',
    emoji: '✨',
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    sentBubbleColor: '#FB923C',
    receivedBubbleColor: '#FDE68A',
    sentTextColor: '#431407',
    receivedTextColor: '#78350F',
    chatBackground: '#FFF7ED',
    chatBackgroundImage: '/assets/generated/chat-bg-sunset-glow.dim_400x400.png',
    inputBackground: '#FFF7ED',
    headerBackground: '#FFEDD5',
    emoji: '🌅',
  },
  {
    id: 'mint-fresh',
    name: 'Mint Fresh',
    sentBubbleColor: '#6EE7B7',
    receivedBubbleColor: '#A7F3D0',
    sentTextColor: '#064E3B',
    receivedTextColor: '#065F46',
    chatBackground: '#ECFDF5',
    chatBackgroundImage: '/assets/generated/chat-bg-mint-fresh.dim_400x400.png',
    inputBackground: '#ECFDF5',
    headerBackground: '#D1FAE5',
    emoji: '🌿',
  },
];

export const DEFAULT_THEME: ChatTheme = PRESET_THEMES[0];
