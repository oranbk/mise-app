# Mise — React Native App

## Setup

```bash
cd mise
npm install
npx expo start
```

## Dependencies to install
```bash
npm install @react-native-async-storage/async-storage
npx expo install expo-av expo-file-system react-native-google-mobile-ads
```

## Build for Play Store
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
```

## AdMob IDs
- App ID: ca-app-pub-6902161296773045~8310549139
- App Open: ca-app-pub-6902161296773045/7231828222
- Interstitial Before: ca-app-pub-6902161296773045/1135293353
- Interstitial After: ca-app-pub-6902161296773045/8822211680

## API Proxy
All AI calls go through: https://doris-a549f1ef.base44.app/functions/aiProxy
To change API keys: update secrets on Base44 — no app update needed.
