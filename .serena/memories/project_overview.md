# TextCast Project Overview

## Purpose
TextCast is a podcast-style text-to-speech app that allows users to consume various content formats (PDF, web articles, manual text) through audio playback, similar to music apps.

## Tech Stack
- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript (strict mode)
- **State Management**: Zustand + AsyncStorage
- **Navigation**: @react-navigation/native v6
- **Audio**: expo-speech
- **Animations**: react-native-reanimated v4 + react-native-gesture-handler
- **UI Components**: @expo/vector-icons, react-native-safe-area-context

## Project Structure
```
/
├── app/                    # Expo Router screens
│   ├── index.tsx          # Home screen
│   ├── _layout.tsx        # Root layout
│   └── add-material.tsx   # Add content screen
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── TextItemCard.tsx
│   │   ├── SwipeableUnifiedPlayer.tsx
│   │   └── GlobalPlayer.tsx
│   ├── types/             # TypeScript type definitions
│   ├── constants/         # Theme and constants
│   ├── stores/           # Zustand state management
│   └── screens/          # Screen components
├── constants/            # Global constants
├── components/           # Legacy Expo components
└── assets/              # Static assets
```

## Key Features
- Multi-format content input (text, URL, file, camera OCR)
- Playlist management with categories
- Music app-style player with mini/full modes
- Swipe gestures for player transitions
- Background audio playback