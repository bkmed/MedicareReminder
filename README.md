# Medicare Reminder

A comprehensive and intuitive mobile and web application designed to help users manage their medication schedules and doctor appointments effectively. Built with **React Native** for seamless cross-platform performance on iOS, Android, and Web.

## 🚀 Features

- **💊 Medication Management**: Easily add, track, and manage prescriptions with detailed schedules and dosages.
- **🗓️ Appointment Tracking**: Schedule and receive reminders for upcoming doctor visits.
- **🌍 Multi-language Support**: Fully localized in **English**, **French**, **German**, and **Arabic**.
- **🌗 Dark & Light Mode**: Beautiful UI that adapts to your system's theme preference.
- **📶 Offline Support**: robust offline functionality ensuring data access anywhere.
- **📊 Analytics**: Insightful dashboards to track medication adherence and health habits.
- **🔔 Smart Notifications**: Reliable local push notifications for timely reminders.

## 🛠 Tech Stack

- **Core**: [React Native](https://reactnative.dev/), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Navigation**: [React Navigation v7](https://reactnavigation.org/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/), [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: [NativeWind (Tailwind CSS)](https://www.nativewind.dev/)
- **Storage**: [MMKV](https://github.com/mamous/react-native-mmkv), [SQLite](https://github.com/andpor/react-native-sqlite-storage)
- **Backend/Services**: [Firebase](https://firebase.google.com/) (Analytics, App), [Notifee](https://notifee.app/)

## 🔧 Installation & Setup

### Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (>= 18)
- [Watchman](https://facebook.github.io/watchman/)
- **iOS**: [Xcode](https://developer.apple.com/xcode/) (macOS only) & [CocoaPods](https://cocoapods.org/)
- **Android**: [Android Studio](https://developer.android.com/studio) & JDK 17

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/bkmed/MedicareReminder.git
   cd MedicareReminder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
3. **Install iOS Pods (macOS only)**
   ```bash
   cd ios && pod install && cd ..
   ```

## 📱 Running the App

### Android
Start the Metro bundler and run on Android emulator/device:
```bash
npm run start-android
```

### iOS
Start the Metro bundler and run on iOS simulator/device:
```bash
npm run start-ios
```

### Web
Run the development server for the web version:
```bash
npm run start-web-dev
```

## 🌐 Public Link

Access the live version of the application here:

> [**🔗 Medicare Reminder Public Link**](https://bkmed.github.io/MedicareReminder/) 

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
Built with ❤️ by **Ben Khedher Mohamed**
