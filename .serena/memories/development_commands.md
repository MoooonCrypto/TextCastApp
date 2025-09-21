# Development Commands

## Primary Development
- **Start dev server**: `npx expo start --tunnel` (required for debugging)
- **iOS simulator**: `npx expo start --ios`
- **Android**: `npx expo start --android`

## Package Management
- **Install dependencies**: `npm ci` (use lockfile)
- **Add Expo packages**: `npx expo install <package>` (requires confirmation)
- **Fix dependencies**: `npx expo install --fix`

## Code Quality
- **Lint**: `npm run lint` (use when needed)
- **Format**: `npm run format` (use when needed)
- **Type check**: `npm run tsc` (when needed)
- **Test**: `npm run test`

## Project Health
- **Check project**: `npx expo-doctor`
- **Clear cache**: `npx expo start --clear`

## System Commands (Darwin)
- **File operations**: `ls`, `cat`, `find`, `echo`, `mkdir`, `touch`
- **Git**: Manual operations only (no automated git commands)
- **Forbidden**: `sudo`, `pkill`, `rm -rf`

## Important Notes
- Always use `--tunnel` for debugging
- TypeScript strict mode enabled
- Never commit with type errors
- New packages require human confirmation