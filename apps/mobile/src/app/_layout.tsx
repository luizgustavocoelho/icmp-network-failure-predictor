import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  Stack,
} from "expo-router";

import {
  StatusBar,
} from "expo-status-bar";

import {
  colors,
} from "../constants/theme";

import {
  AuthProvider,
  useAuth,
} from "../context/AuthContext";

import {
  HostProvider,
} from "../context/HostContext";

import {
  LanguageProvider,
} from "../context/LanguageContext";


function RootNavigator() {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();


  if (isLoading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={
            colors.primary
          }
        />
      </View>
    );
  }


  return (
    <HostProvider>
      <Stack
        screenOptions={{
          headerShown: false,

          contentStyle: {
            backgroundColor:
              colors.background,
          },
        }}
      >
        <Stack.Protected
          guard={
            !isAuthenticated
          }
        >
          <Stack.Screen
            name="login"
          />

          <Stack.Screen
            name="register"
          />
        </Stack.Protected>

        <Stack.Protected
          guard={
            isAuthenticated
          }
        >
          <Stack.Screen
            name="(tabs)"
          />

          <Stack.Screen
            name="hosts"
          />
        </Stack.Protected>
      </Stack>
    </HostProvider>
  );
}


export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <StatusBar
          style="light"
        />

        <RootNavigator />
      </AuthProvider>
    </LanguageProvider>
  );
}


const styles =
  StyleSheet.create({
    loadingContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        colors.background,
    },
  });
