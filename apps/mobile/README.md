# ICMP Network Failure Predictor - Mobile

React Native / Expo client for the ICMP Network Failure Predictor.

## Features

```text
Registration and login
Secure token persistence
Overview
History
Forecast
Alerts
Profile
Host management
English / Portuguese / Spanish
Standalone Android APK
```

## Development

```bash
npm install
npx expo start
```

Configure:

```env
EXPO_PUBLIC_API_URL=http://YOUR_BACKEND_ADDRESS:8000
```

For a standalone/public build, use an API URL reachable by the device.

## Validation

```bash
npx tsc --noEmit
npm run lint
```

Both passed in the final V2 validation.

## Android

Package identifier:

```text
com.luizgcoelho.icmpnetworkpredictor
```

Preview APK build:

```bash
npx eas-cli@latest build -p android --profile preview
```

The final APK was installed and validated on a physical Android device over 5G. It does not require Expo Go or Metro after installation.
