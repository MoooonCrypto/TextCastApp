# Code Style & Conventions

## Language Standards
- **TypeScript**: Strict mode enabled
- **Type safety**: All types must be explicitly defined
- **No `any` types**: Use proper type definitions

## Naming Conventions
- **Components**: PascalCase (e.g., `TextItemCard`)
- **Files**: PascalCase for components, camelCase for utilities
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Interfaces/Types**: PascalCase with descriptive names

## Component Structure
- **Functional components**: Use React.FC<Props> type
- **Props interfaces**: Define as `ComponentNameProps`
- **State management**: Zustand for global state, useState for local
- **Styling**: StyleSheet.create at component bottom

## File Organization
- **Import order**: React imports first, then third-party, then local
- **Export**: Default export at bottom, named exports inline
- **Comments**: Minimal, code should be self-documenting

## React Native Specifics
- **SafeAreaView**: Use from react-native-safe-area-context
- **Animations**: react-native-reanimated v4 with worklets
- **Gestures**: react-native-gesture-handler with Gesture API

## Code Quality Rules
- **ESLint**: Follow configured rules
- **Prettier**: Auto-formatting enabled
- **No console.log**: Remove before production
- **Error handling**: Proper try-catch for async operations