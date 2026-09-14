import {
  Ionicons,
} from "@expo/vector-icons";

import {
  Tabs,
} from "expo-router";

import {
  colors,
  touchTarget,
} from "../../constants/theme";

import {
  useLanguage,
} from "../../context/LanguageContext";

import {
  getAuthTranslations,
} from "../../i18n/auth";


export default function TabLayout() {
  const {
    t,
    language,
  } = useLanguage();

  const authCopy =
    getAuthTranslations(
      language
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor:
          colors.primary,

        tabBarInactiveTintColor:
          colors.textMuted,

        tabBarStyle: {
          backgroundColor:
            colors.surface,

          borderTopColor:
            colors.border,

          borderTopWidth: 1,

          minHeight: 76,

          paddingTop: 8,

          paddingBottom: 10,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },

        tabBarItemStyle: {
          minHeight:
            touchTarget.minimum,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title:
            t("tabOverview"),

          tabBarAccessibilityLabel:
            t("tabOverview"),

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="pulse-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title:
            t("tabHistory"),

          tabBarAccessibilityLabel:
            t("tabHistory"),

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="stats-chart-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="forecast"
        options={{
          title:
            t("tabForecast"),

          tabBarAccessibilityLabel:
            t("tabForecast"),

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="analytics-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="alerts"
        options={{
          title:
            t("tabAlerts"),

          tabBarAccessibilityLabel:
            t("tabAlerts"),

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="notifications-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title:
            authCopy.tabAccount,

          tabBarAccessibilityLabel:
            authCopy.tabAccount,

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="person-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}