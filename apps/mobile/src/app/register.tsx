import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
} from "expo-router";

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useState,
} from "react";

import LanguageSelector from "../components/LanguageSelector";

import {
  colors,
  radius,
  spacing,
  touchTarget,
  typography,
} from "../constants/theme";

import {
  useAuth,
} from "../context/AuthContext";

import {
  useLanguage,
} from "../context/LanguageContext";

import {
  getAuthTranslations,
} from "../i18n/auth";


export default function RegisterScreen() {
  const {
    signUp,
  } = useAuth();

  const {
    language,
  } = useLanguage();

  const copy =
    getAuthTranslations(
      language
    );

  const [
    name,
    setName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  async function handleRegister() {
    if (submitting) {
      return;
    }

    setError(
      null
    );

    if (
      password.length < 8
    ) {
      setError(
        copy.passwordTooShort
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        copy.passwordsDoNotMatch
      );

      return;
    }

    setSubmitting(
      true
    );

    try {
      await signUp(
        name,
        email,
        password
      );
    } catch (caughtError) {
      if (
        caughtError
        instanceof Error
      ) {
        setError(
          caughtError.message
        );
      } else {
        setError(
          copy.registerError
        );
      }
    } finally {
      setSubmitting(
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
      <KeyboardAvoidingView
        style={
          styles.flex
        }
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={
              styles.topRow
            }
          >
            <Pressable
              onPress={() =>
                router.back()
              }
              style={
                styles.backButton
              }
              accessibilityRole="button"
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={
                  colors.textPrimary
                }
              />
            </Pressable>

            <LanguageSelector />
          </View>

          <Text
            style={
              styles.appName
            }
          >
            NETWORK MONITOR
          </Text>

          <Text
            style={
              styles.title
            }
          >
            {
              copy.registerTitle
            }
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            {
              copy.registerSubtitle
            }
          </Text>

          <View
            style={
              styles.form
            }
          >
            <Text
              style={
                styles.label
              }
            >
              {copy.name}
            </Text>

            <TextInput
              value={name}
              onChangeText={
                setName
              }
              placeholder={
                copy.name
              }
              placeholderTextColor={
                colors.textMuted
              }
              autoCapitalize="words"
              style={
                styles.input
              }
            />

            <Text
              style={
                styles.label
              }
            >
              {copy.email}
            </Text>

            <TextInput
              value={email}
              onChangeText={
                setEmail
              }
              placeholder="name@example.com"
              placeholderTextColor={
                colors.textMuted
              }
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={
                styles.input
              }
            />

            <Text
              style={
                styles.label
              }
            >
              {copy.password}
            </Text>

            <TextInput
              value={
                password
              }
              onChangeText={
                setPassword
              }
              placeholder="••••••••"
              placeholderTextColor={
                colors.textMuted
              }
              secureTextEntry
              autoCapitalize="none"
              style={
                styles.input
              }
            />

            <Text
              style={
                styles.label
              }
            >
              {
                copy.confirmPassword
              }
            </Text>

            <TextInput
              value={
                confirmPassword
              }
              onChangeText={
                setConfirmPassword
              }
              placeholder="••••••••"
              placeholderTextColor={
                colors.textMuted
              }
              secureTextEntry
              autoCapitalize="none"
              style={
                styles.input
              }
            />

            {error && (
              <View
                style={
                  styles.errorBox
                }
              >
                <Text
                  style={
                    styles.errorText
                  }
                >
                  {error}
                </Text>
              </View>
            )}

            <Pressable
              onPress={
                handleRegister
              }
              disabled={
                submitting
              }
              style={({
                pressed,
              }) => [
                styles.primaryButton,

                (
                  pressed ||
                  submitting
                ) &&
                  styles.buttonPressed,
              ]}
            >
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                {
                  submitting
                    ? copy.registering
                    : copy.register
                }
              </Text>
            </Pressable>

            <View
              style={
                styles.footer
              }
            >
              <Text
                style={
                  styles.footerText
                }
              >
                {
                  copy.haveAccount
                }
              </Text>

              <Pressable
                onPress={() =>
                  router.replace(
                    "/login"
                  )
                }
                style={
                  styles.linkButton
                }
              >
                <Text
                  style={
                    styles.linkText
                  }
                >
                  {
                    copy.backToLogin
                  }
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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

    flex: {
      flex: 1,
    },

    content: {
      paddingHorizontal:
        spacing.lg,

      paddingBottom:
        spacing.xl,
    },

    topRow: {
      minHeight: 64,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    backButton: {
      width:
        touchTarget.minimum,

      height:
        touchTarget.minimum,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    appName: {
      color:
        colors.primary,

      fontSize:
        typography.small,

      fontWeight:
        "800",

      letterSpacing: 1.6,

      marginTop:
        spacing.xl,

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

      marginBottom:
        spacing.sm,
    },

    subtitle: {
      color:
        colors.textSecondary,

      fontSize:
        typography.body,

      lineHeight: 24,

      marginBottom:
        spacing.xl,
    },

    form: {
      gap:
        spacing.sm,
    },

    label: {
      color:
        colors.textSecondary,

      fontSize:
        typography.caption,

      fontWeight:
        "600",

      marginTop:
        spacing.sm,
    },

    input: {
      minHeight:
        touchTarget.minimum,

      backgroundColor:
        colors.surface,

      borderColor:
        colors.border,

      borderWidth: 1,

      borderRadius:
        radius.md,

      color:
        colors.textPrimary,

      fontSize:
        typography.body,

      paddingHorizontal:
        spacing.md,
    },

    errorBox: {
      backgroundColor:
        colors.dangerBackground,

      borderColor:
        colors.danger,

      borderWidth: 1,

      borderRadius:
        radius.md,

      padding:
        spacing.md,

      marginTop:
        spacing.sm,
    },

    errorText: {
      color:
        colors.danger,

      fontSize:
        typography.caption,
    },

    primaryButton: {
      minHeight: 52,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        colors.primary,

      borderRadius:
        radius.md,

      marginTop:
        spacing.md,
    },

    primaryButtonText: {
      color:
        colors.white,

      fontSize:
        typography.body,

      fontWeight:
        "700",
    },

    buttonPressed: {
      opacity: 0.7,
    },

    footer: {
      marginTop:
        spacing.lg,

      alignItems:
        "center",

      gap:
        spacing.sm,
    },

    footerText: {
      color:
        colors.textSecondary,

      fontSize:
        typography.caption,
    },

    linkButton: {
      minHeight:
        touchTarget.minimum,

      justifyContent:
        "center",
    },

    linkText: {
      color:
        colors.primary,

      fontSize:
        typography.body,

      fontWeight:
        "700",
    },
  });