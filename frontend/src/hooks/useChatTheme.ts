import { useState, useEffect, useCallback } from 'react';
import { useInternetIdentity } from './useInternetIdentity';
import { ChatTheme, DEFAULT_THEME, PRESET_THEMES } from '../utils/chatThemes';

export type FontSize = 'small' | 'medium' | 'large';

export interface ChatThemeSettings {
  theme: ChatTheme;
  fontSize: FontSize;
  useCustomColors: boolean;
  customSentColor: string;
  customReceivedColor: string;
  customBackground: string;
}

const DEFAULT_SETTINGS: ChatThemeSettings = {
  theme: DEFAULT_THEME,
  fontSize: 'medium',
  useCustomColors: false,
  customSentColor: '#F9A8D4',
  customReceivedColor: '#E9D5FF',
  customBackground: '#FFF0F6',
};

function getStorageKey(principalId: string): string {
  return `chatTheme_${principalId}`;
}

export function useChatTheme() {
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString() ?? 'anonymous';

  const [settings, setSettings] = useState<ChatThemeSettings>(DEFAULT_SETTINGS);

  // Load saved settings on mount / when principal changes
  useEffect(() => {
    const key = getStorageKey(principalId);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<ChatThemeSettings>;
        // Re-hydrate the theme object from preset list (in case it was a preset)
        const hydratedTheme = parsed.theme
          ? PRESET_THEMES.find(t => t.id === parsed.theme?.id) ?? parsed.theme
          : DEFAULT_THEME;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed, theme: hydratedTheme });
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
      setSettings(DEFAULT_SETTINGS);
    }
  }, [principalId]);

  const save = useCallback(
    (updated: ChatThemeSettings) => {
      const key = getStorageKey(principalId);
      localStorage.setItem(key, JSON.stringify(updated));
      setSettings(updated);
    },
    [principalId]
  );

  const selectPreset = useCallback(
    (themeId: string) => {
      const preset = PRESET_THEMES.find(t => t.id === themeId);
      if (!preset) return;
      save({ ...settings, theme: preset, useCustomColors: false });
    },
    [settings, save]
  );

  const setCustomColors = useCallback(
    (sentColor: string, receivedColor: string, background: string) => {
      save({
        ...settings,
        useCustomColors: true,
        customSentColor: sentColor,
        customReceivedColor: receivedColor,
        customBackground: background,
      });
    },
    [settings, save]
  );

  const setFontSize = useCallback(
    (fontSize: FontSize) => {
      save({ ...settings, fontSize });
    },
    [settings, save]
  );

  const toggleCustomColors = useCallback(
    (enabled: boolean) => {
      save({ ...settings, useCustomColors: enabled });
    },
    [settings, save]
  );

  // Resolved colors (custom overrides preset)
  const resolvedSentColor = settings.useCustomColors
    ? settings.customSentColor
    : settings.theme.sentBubbleColor;
  const resolvedReceivedColor = settings.useCustomColors
    ? settings.customReceivedColor
    : settings.theme.receivedBubbleColor;
  const resolvedBackground = settings.useCustomColors
    ? settings.customBackground
    : settings.theme.chatBackground;
  const resolvedBackgroundImage = settings.useCustomColors
    ? undefined
    : settings.theme.chatBackgroundImage;

  const fontSizeClass =
    settings.fontSize === 'small'
      ? 'text-sm'
      : settings.fontSize === 'large'
      ? 'text-lg'
      : 'text-base';

  return {
    settings,
    resolvedSentColor,
    resolvedReceivedColor,
    resolvedBackground,
    resolvedBackgroundImage,
    fontSizeClass,
    selectPreset,
    setCustomColors,
    setFontSize,
    toggleCustomColors,
  };
}
