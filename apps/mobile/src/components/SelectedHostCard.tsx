import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
} from "expo-router";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  colors,
  radius,
  spacing,
  touchTarget,
  typography,
} from "../constants/theme";

import {
  useHosts,
} from "../context/HostContext";

import {
  useLanguage,
} from "../context/LanguageContext";

import {
  getHostTranslations,
} from "../i18n/hosts";


export default function SelectedHostCard() {
  const {
    selectedHost,
    isLoading,
  } = useHosts();

  const {
    language,
  } = useLanguage();

  const copy =
    getHostTranslations(
      language
    );


  return (
    <Pressable
      onPress={() =>
        router.push(
          "/hosts"
        )
      }
      style={({
        pressed,
      }) => [
        styles.card,
        pressed &&
          styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={
        selectedHost
          ? `${copy.selectedHost}: ${selectedHost.name}, ${selectedHost.ip_address}`
          : copy.addFirstHost
      }
    >
      {isLoading ? (
        <ActivityIndicator
          color={
            colors.primary
          }
        />
      ) : (
        <>
          <View
            style={
              styles.icon
            }
          >
            <Ionicons
              name={
                selectedHost
                  ? "server-outline"
                  : "add-outline"
              }
              size={24}
              color={
                colors.primary
              }
            />
          </View>

          <View
            style={
              styles.content
            }
          >
            <Text
              style={
                styles.label
              }
            >
              {
                selectedHost
                  ? copy.selectedHost
                  : copy.noHosts
              }
            </Text>

            <Text
              style={
                styles.name
              }
              numberOfLines={1}
            >
              {
                selectedHost
                  ? selectedHost.name
                  : copy.addFirstHost
              }
            </Text>

            {selectedHost && (
              <Text
                style={
                  styles.ip
                }
              >
                {
                  selectedHost.ip_address
                }
                {"  •  "}
                {
                  selectedHost.is_active
                    ? copy.monitoringActive
                    : copy.monitoringPaused
                }
              </Text>
            )}
          </View>

          <View
            style={
              styles.action
            }
          >
            <Text
              style={
                styles.actionText
              }
            >
              {
                selectedHost
                  ? copy.changeHost
                  : copy.addHost
              }
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={
                colors.primary
              }
            />
          </View>
        </>
      )}
    </Pressable>
  );
}


const styles =
  StyleSheet.create({
    card: {
      minHeight: 86,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      backgroundColor:
        colors.surface,
      borderColor:
        colors.border,
      borderWidth: 1,
      borderRadius:
        radius.lg,
      padding:
        spacing.md,
      marginBottom:
        spacing.xl,
    },

    cardPressed: {
      opacity: 0.8,
    },

    icon: {
      width:
        touchTarget.minimum,
      height:
        touchTarget.minimum,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        colors.primarySoft,
      borderRadius:
        radius.md,
    },

    content: {
      flex: 1,
    },

    label: {
      color:
        colors.textMuted,
      fontSize:
        typography.small,
      fontWeight: "700",
      marginBottom:
        spacing.xs,
    },

    name: {
      color:
        colors.textPrimary,
      fontSize:
        typography.body,
      fontWeight: "700",
    },

    ip: {
      color:
        colors.textSecondary,
      fontSize:
        typography.small,
      marginTop:
        spacing.xs,
    },

    action: {
      minHeight:
        touchTarget.minimum,
      flexDirection: "row",
      alignItems: "center",
      gap:
        spacing.xs,
    },

    actionText: {
      color:
        colors.primary,
      fontSize:
        typography.small,
      fontWeight: "700",
    },
  });
