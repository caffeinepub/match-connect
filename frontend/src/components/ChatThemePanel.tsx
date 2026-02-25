import React from 'react';
import { Palette, Check, Type } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { PRESET_THEMES } from '../utils/chatThemes';
import { useChatTheme, FontSize } from '../hooks/useChatTheme';

interface ChatThemePanelProps {
  chatTheme: ReturnType<typeof useChatTheme>;
}

const FONT_SIZES: { label: string; value: FontSize; icon: string }[] = [
  { label: 'Small', value: 'small', icon: 'A' },
  { label: 'Medium', value: 'medium', icon: 'A' },
  { label: 'Large', value: 'large', icon: 'A' },
];

export default function ChatThemePanel({ chatTheme }: ChatThemePanelProps) {
  const {
    settings,
    selectPreset,
    setCustomColors,
    setFontSize,
    toggleCustomColors,
  } = chatTheme;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-white/20 transition-all"
          title="Customize chat theme"
        >
          <Palette className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Palette className="w-5 h-5 text-pink-500" />
            Chat Theme
          </SheetTitle>
        </SheetHeader>

        {/* Preset Themes */}
        <div className="space-y-3 mb-6">
          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Preset Themes
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {PRESET_THEMES.map(theme => {
              const isActive = settings.theme.id === theme.id && !settings.useCustomColors;
              return (
                <button
                  key={theme.id}
                  onClick={() => selectPreset(theme.id)}
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                    isActive
                      ? 'border-pink-500 shadow-lg shadow-pink-200'
                      : 'border-transparent hover:border-pink-200'
                  }`}
                >
                  {/* Theme preview */}
                  <div
                    className="h-20 w-full flex flex-col justify-end p-2 gap-1"
                    style={{
                      backgroundColor: theme.chatBackground,
                      backgroundImage: theme.chatBackgroundImage
                        ? `url(${theme.chatBackgroundImage})`
                        : undefined,
                      backgroundSize: '100px 100px',
                      backgroundRepeat: 'repeat',
                    }}
                  >
                    <div className="flex justify-end">
                      <div
                        className="rounded-2xl px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: theme.sentBubbleColor,
                          color: theme.sentTextColor,
                        }}
                      >
                        Hi! {theme.emoji}
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div
                        className="rounded-2xl px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: theme.receivedBubbleColor,
                          color: theme.receivedTextColor,
                        }}
                      >
                        Hey! 💕
                      </div>
                    </div>
                  </div>
                  <div
                    className="py-1.5 px-2 text-center text-xs font-semibold"
                    style={{ backgroundColor: theme.headerBackground, color: theme.sentTextColor }}
                  >
                    {theme.name}
                  </div>
                  {isActive && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Custom Colors */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Custom Colors
            </Label>
            <button
              onClick={() => toggleCustomColors(!settings.useCustomColors)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                settings.useCustomColors ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  settings.useCustomColors ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.useCustomColors && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground">Your bubble</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: settings.customSentColor }}
                  />
                  <input
                    type="color"
                    value={settings.customSentColor}
                    onChange={e =>
                      setCustomColors(
                        e.target.value,
                        settings.customReceivedColor,
                        settings.customBackground
                      )
                    }
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground">Their bubble</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: settings.customReceivedColor }}
                  />
                  <input
                    type="color"
                    value={settings.customReceivedColor}
                    onChange={e =>
                      setCustomColors(
                        settings.customSentColor,
                        e.target.value,
                        settings.customBackground
                      )
                    }
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground">Background</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: settings.customBackground }}
                  />
                  <input
                    type="color"
                    value={settings.customBackground}
                    onChange={e =>
                      setCustomColors(
                        settings.customSentColor,
                        settings.customReceivedColor,
                        e.target.value
                      )
                    }
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Font Size */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" />
            Font Size
          </Label>
          <div className="flex gap-2">
            {FONT_SIZES.map(({ label, value, icon }) => {
              const isActive = settings.fontSize === value;
              const sizeClass =
                value === 'small' ? 'text-xs' : value === 'large' ? 'text-lg' : 'text-sm';
              return (
                <button
                  key={value}
                  onClick={() => setFontSize(value)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                    isActive
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400'
                      : 'border-border hover:border-pink-200 text-muted-foreground'
                  }`}
                >
                  <span className={`font-bold ${sizeClass}`}>{icon}</span>
                  <span className="text-xs">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
