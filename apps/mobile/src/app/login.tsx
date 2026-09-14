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

import {
  ApiError,
} from "../services/api";


export default function LoginScreen() {
  const {
    signIn,
  } = useAuth();

  const {
    language,
  } = useLanguage();

  const copy =
    getAuthTranslations(
      language
    );

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

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


  async function handleLogin() {
    if (submitting) {
      return;
    }

    setError(
      null
    );

    setSubmitting(
      true
    );

    try {
      await signIn(
        email,
        password
      );
    } catch (caughtError) {
      if (
        caughtError
        instanceof ApiError &&
        caughtError.status === 401
      ) {
        setError(
          copy.invalidCredentials
        );
      } else {
        setError(
          copy.loginError
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
              styles.languageRow
            }
          >
            <LanguageSelector />
          </View>

          <View
            style={
              styles.hero
            }
          >
            <View
              style={
                styles.iconContainer
              }
            >
              <Ionicons
                name="pulse"
                size={32}
                color={
                  colors.primary
                }
              />
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
              {copy.loginTitle}
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              {
                copy.loginSubtitle
              }
            </Text>
          </View>

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
              autoComplete="email"
              style={
                styles.input
              }
              accessibilityLabel={
                copy.email
              }
            />

            <Text
              style={
                styles.label
              }
            >
              {copy.password}
            </Text>

            <View
              style={
                styles.passwordContainer
              }
            >
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
                secureTextEntry={
                  !showPassword
                }
                autoCapitalize="none"
                autoCorrect={false}
                style={
                  styles.passwordInput
                }
                accessibilityLabel={
                  copy.password
                }
              />

              <Pressable
                onPress={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
                style={
                  styles.eyeButton
                }
                accessibilityRole="button"
              >
                <Ionicons
                  name={
                    showPassword
                      ? "eye-off-outline"
                      : "eye-outline"
                  }
                  size={22}
                  color={
                    colors.textSecondary
                  }
                />
              </Pressable>
            </View>

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
                handleLogin
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
              accessibilityRole="button"
            >
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                {
                  submitting
                    ? copy.signingIn
                    : copy.signIn
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
                {copy.noAccount}
              </Text>

              <Pressable
                onPress={() =>
                  router.push(
                    "/register"
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
                    copy.createAccount
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
      flexGrow: 1,

      paddingHorizontal:
        spacing.lg,

      paddingBottom:
        spacing.xl,
    },

    languageRow: {
      minHeight:
        touchTarget.minimum,

      alignItems:
        "flex-end",

      justifyContent:
        "center",
    },

    hero: {
      marginTop:
        spacing.xl,

      marginBottom:
        spacing.xl,
    },

    iconContainer: {
      width: 64,
      height: 64,

      borderRadius:
        radius.lg,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        colors.primarySoft,

      marginBottom:
        spacing.lg,
    },

    appName: {
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

      marginBottom:
        spacing.sm,
    },

    subtitle: {
      color:
        colors.textSecondary,

      fontSize:
        typography.body,

      lineHeight: 24,
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

    passwordContainer: {
      minHeight:
        touchTarget.minimum,

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        colors.surface,

      borderColor:
        colors.border,

      borderWidth: 1,

      borderRadius:
        radius.md,
    },

    passwordInput: {
      flex: 1,

      minHeight:
        touchTarget.minimum,

      color:
        colors.textPrimary,

      fontSize:
        typography.body,

      paddingHorizontal:
        spacing.md,
    },

    eyeButton: {
      width:
        touchTarget.minimum,

      height:
        touchTarget.minimum,

      alignItems:
        "center",

      justifyContent:
        "center",
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