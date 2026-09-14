import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
} from "expo-router";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useState,
} from "react";

import LanguageSelector from "../../components/LanguageSelector";

import {
  colors,
  radius,
  spacing,
  touchTarget,
  typography,
} from "../../constants/theme";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  useLanguage,
} from "../../context/LanguageContext";

import {
  getAuthTranslations,
} from "../../i18n/auth";

import {
  getHostTranslations,
} from "../../i18n/hosts";


export default function ProfileScreen() {
  const {
    user,
    signOut,
  } = useAuth();

  const {
    language,
  } = useLanguage();

  const copy =
    getAuthTranslations(
      language
    );

  const hostCopy =
    getHostTranslations(
      language
    );

  const [
    signingOut,
    setSigningOut,
  ] = useState(false);


  async function handleSignOut() {
    if (signingOut) {
      return;
    }

    setSigningOut(
      true
    );

    try {
      await signOut();
    } finally {
      setSigningOut(
        false
      );
    }
  }


  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.headerText
            }
          >
            <Text
              style={
                styles.eyebrow
              }
            >
              NETWORK MONITOR
            </Text>

            <Text
              style={
                styles.title
              }
            >
              {copy.account}
            </Text>
          </View>

          <LanguageSelector />
        </View>

        <View
          style={
            styles.profileCard
          }
        >
          <View
            style={
              styles.avatar
            }
          >
            <Ionicons
              name="person-outline"
              size={32}
              color={
                colors.primary
              }
            />
          </View>

          <Text
            style={
              styles.name
            }
          >
            {user?.name}
          </Text>

          <Text
            style={
              styles.email
            }
          >
            {user?.email}
          </Text>
        </View>

        <View
          style={
            styles.securityCard
          }
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={28}
            color={
              colors.success
            }
          />

          <View
            style={
              styles.securityText
            }
          >
            <Text
              style={
                styles.securityTitle
              }
            >
              {
                copy.signedInAs
              }
            </Text>

            <Text
              style={
                styles.securityDescription
              }
            >
              {
                copy.secureSession
              }
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() =>
            router.push(
              "/hosts"
            )
          }
          style={({
            pressed,
          }) => [
            styles.manageHostsButton,

            pressed &&
              styles.buttonPressed,
          ]}
          accessibilityRole="button"
        >
          <View
            style={
              styles.manageHostsIcon
            }
          >
            <Ionicons
              name="server-outline"
              size={24}
              color={
                colors.primary
              }
            />
          </View>

          <View
            style={
              styles.manageHostsText
            }
          >
            <Text
              style={
                styles.manageHostsTitle
              }
            >
              {
                hostCopy.manageHosts
              }
            </Text>

            <Text
              style={
                styles.manageHostsDescription
              }
            >
              {
                hostCopy.manageHostsDescription
              }
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={
              colors.textMuted
            }
          />
        </Pressable>

        <Pressable
          onPress={
            handleSignOut
          }
          disabled={
            signingOut
          }
          style={({
            pressed,
          }) => [
            styles.logoutButton,

            (
              pressed ||
              signingOut
            ) &&
              styles.buttonPressed,
          ]}
          accessibilityRole="button"
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color={
              colors.danger
            }
          />

          <Text
            style={
              styles.logoutText
            }
          >
            {
              signingOut
                ? copy.loggingOut
                : copy.logout
            }
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,

      backgroundColor:
        colors.background,
    },

    content: {
      padding:
        spacing.lg,

      paddingBottom: 110,
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      marginBottom:
        spacing.xl,

      gap:
        spacing.md,
    },

    headerText: {
      flex: 1,
    },

    eyebrow: {
      color:
        colors.primary,

      fontSize:
        typography.small,

      fontWeight:
        "800",

      letterSpacing: 1.6,

      marginBottom:
        spacing.sm,
    },

    title: {
      color:
        colors.textPrimary,

      fontSize:
        typography.title,

      fontWeight:
        "700",
    },

    profileCard: {
      alignItems:
        "center",

      backgroundColor:
        colors.surface,

      borderColor:
        colors.border,

      borderWidth: 1,

      borderRadius:
        radius.lg,

      padding:
        spacing.xl,

      marginBottom:
        spacing.lg,
    },

    avatar: {
      width: 72,
      height: 72,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        colors.primarySoft,

      borderRadius:
        radius.full,

      marginBottom:
        spacing.md,
    },

    name: {
      color:
        colors.textPrimary,

      fontSize:
        typography.heading,

      fontWeight:
        "700",
    },

    email: {
      color:
        colors.textSecondary,

      fontSize:
        typography.caption,

      marginTop:
        spacing.sm,
    },

    securityCard: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        spacing.md,

      backgroundColor:
        colors.successBackground,

      borderColor:
        colors.success,

      borderWidth: 1,

      borderRadius:
        radius.lg,

      padding:
        spacing.lg,

      marginBottom:
        spacing.xl,
    },

    securityText: {
      flex: 1,
    },

    securityTitle: {
      color:
        colors.textPrimary,

      fontSize:
        typography.body,

      fontWeight:
        "700",

      marginBottom:
        spacing.xs,
    },

    securityDescription: {
      color:
        colors.textSecondary,

      fontSize:
        typography.caption,

      lineHeight: 20,
    },

    manageHostsButton: {
      minHeight: 86,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        spacing.md,

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
        spacing.lg,
    },

    manageHostsIcon: {
      width:
        touchTarget.minimum,

      height:
        touchTarget.minimum,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        colors.primarySoft,

      borderRadius:
        radius.md,
    },

    manageHostsText: {
      flex: 1,
    },

    manageHostsTitle: {
      color:
        colors.textPrimary,

      fontSize:
        typography.body,

      fontWeight:
        "700",

      marginBottom:
        spacing.xs,
    },

    manageHostsDescription: {
      color:
        colors.textSecondary,

      fontSize:
        typography.small,

      lineHeight: 18,
    },

    logoutButton: {
      minHeight:
        touchTarget.minimum,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        spacing.sm,

      backgroundColor:
        colors.dangerBackground,

      borderColor:
        colors.danger,

      borderWidth: 1,

      borderRadius:
        radius.md,

      paddingHorizontal:
        spacing.lg,
    },

    logoutText: {
      color:
        colors.danger,

      fontSize:
        typography.body,

      fontWeight:
        "700",
    },

    buttonPressed: {
      opacity: 0.7,
    },
  });
