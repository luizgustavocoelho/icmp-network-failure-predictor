import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { colors } from "../constants/theme";
import {
  LanguageProvider,
} from "../context/LanguageContext";


export default function RootLayout() {
  return (
    <LanguageProvider>
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </LanguageProvider>
  );
}