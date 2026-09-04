import { Ionicons } from "@expo/vector-icons";

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useState,
} from "react";

import {
  colors,
  radius,
  spacing,
  touchTarget,
  typography,
} from "../constants/theme";

import {
  useLanguage,
} from "../context/LanguageContext";

import {
  Language,
} from "../i18n/translations";


type LanguageOption = {
  code: Language;
  label: string;
  shortLabel: string;
};


export default function LanguageSelector() {
  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  const [
    visible,
    setVisible,
  ] = useState(false);


  const options: LanguageOption[] = [
    {
      code: "en",
      label: t(
        "languageEnglish"
      ),
      shortLabel: "EN",
    },

    {
      code: "pt",
      label: t(
        "languagePortuguese"
      ),
      shortLabel: "PT-BR",
    },

    {
      code: "es",
      label: t(
        "languageSpanish"
      ),
      shortLabel: "ES",
    },
  ];


  const currentOption =
    options.find(
      (option) =>
        option.code ===
        language
    ) ?? options[0];


  async function selectLanguage(
    selectedLanguage: Language
  ) {
    await setLanguage(
      selectedLanguage
    );

    setVisible(false);
  }


  return (
    <>
      <Pressable
        onPress={() =>
          setVisible(true)
        }
        style={({
          pressed,
        }) => [
          styles.button,

          pressed &&
            styles.buttonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={
          t(
            "changeLanguage"
          )
        }
        accessibilityHint={
          currentOption.label
        }
      >
        <Ionicons
          name="language-outline"
          size={20}
          color={
            colors.primary
          }
        />

        <Text
          style={
            styles.buttonText
          }
        >
          {
            currentOption.shortLabel
          }
        </Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setVisible(false)
        }
      >
        <View
          style={
            styles.overlay
          }
        >
          <Pressable
            style={
              styles.dismissArea
            }
            onPress={() =>
              setVisible(false)
            }
            accessibilityRole="button"
            accessibilityLabel="Close language selector"
          />

          <View
            style={
              styles.modal
            }
            accessibilityViewIsModal
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.modalLabel
                  }
                >
                  {t(
                    "appName"
                  )}
                </Text>

                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  {t(
                    "changeLanguage"
                  )}
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setVisible(
                    false
                  )
                }
                style={
                  styles.closeButton
                }
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={
                    colors.textPrimary
                  }
                />
              </Pressable>
            </View>

            <View
              style={
                styles.options
              }
            >
              {options.map(
                (
                  option
                ) => {
                  const selected =
                    option.code ===
                    language;

                  return (
                    <Pressable
                      key={
                        option.code
                      }
                      onPress={() =>
                        selectLanguage(
                          option.code
                        )
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.option,

                        selected &&
                          styles.optionSelected,

                        pressed &&
                          styles.optionPressed,
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{
                        checked:
                          selected,
                      }}
                      accessibilityLabel={
                        option.label
                      }
                    >
                      <View
                        style={
                          styles.optionTextContainer
                        }
                      >
                        <Text
                          style={[
                            styles.optionTitle,

                            selected &&
                              styles.optionTitleSelected,
                          ]}
                        >
                          {
                            option.label
                          }
                        </Text>

                        <Text
                          style={
                            styles.optionCode
                          }
                        >
                          {
                            option.shortLabel
                          }
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.radio,

                          selected &&
                            styles.radioSelected,
                        ]}
                      >
                        {selected && (
                          <View
                            style={
                              styles.radioDot
                            }
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                }
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}


const styles =
  StyleSheet.create({
    button: {
      minWidth: 82,
      minHeight:
        touchTarget.minimum,

      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",

      gap:
        spacing.sm,

      paddingHorizontal:
        spacing.md,

      backgroundColor:
        colors.surfaceElevated,

      borderColor:
        colors.border,

      borderWidth: 1,

      borderRadius:
        radius.md,
    },

    buttonPressed: {
      opacity: 0.7,
    },

    buttonText: {
      color:
        colors.primary,

      fontSize:
        typography.caption,

      fontWeight: "800",
    },

    overlay: {
      flex: 1,

      justifyContent:
        "flex-end",

      backgroundColor:
        "rgba(0, 0, 0, 0.65)",
    },

    dismissArea: {
      flex: 1,
    },

    modal: {
      backgroundColor:
        colors.surface,

      borderTopLeftRadius:
        radius.xl,

      borderTopRightRadius:
        radius.xl,

      borderColor:
        colors.border,

      borderWidth: 1,

      padding:
        spacing.lg,

      paddingBottom:
        spacing.xl,
    },

    modalHeader: {
      flexDirection: "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        spacing.md,

      marginBottom:
        spacing.lg,
    },

    modalLabel: {
      color:
        colors.primary,

      fontSize:
        typography.small,

      fontWeight: "700",

      letterSpacing: 1,
    },

    modalTitle: {
      color:
        colors.textPrimary,

      fontSize:
        typography.heading,

      fontWeight: "700",

      marginTop:
        spacing.xs,
    },

    closeButton: {
      width:
        touchTarget.minimum,

      height:
        touchTarget.minimum,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        radius.full,

      backgroundColor:
        colors.surfaceElevated,
    },

    options: {
      gap:
        spacing.sm,
    },

    option: {
      minHeight: 64,

      flexDirection: "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      backgroundColor:
        colors.surfaceElevated,

      borderColor:
        colors.border,

      borderWidth: 1,

      borderRadius:
        radius.md,

      paddingHorizontal:
        spacing.lg,

      paddingVertical:
        spacing.md,
    },

    optionSelected: {
      backgroundColor:
        colors.primarySoft,

      borderColor:
        colors.primary,
    },

    optionPressed: {
      opacity: 0.75,
    },

    optionTextContainer: {
      flex: 1,
    },

    optionTitle: {
      color:
        colors.textPrimary,

      fontSize:
        typography.body,

      fontWeight: "600",
    },

    optionTitleSelected: {
      color:
        colors.primary,
    },

    optionCode: {
      color:
        colors.textMuted,

      fontSize:
        typography.small,

      marginTop:
        spacing.xs,
    },

    radio: {
      width: 24,
      height: 24,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 12,

      borderWidth: 2,

      borderColor:
        colors.textMuted,
    },

    radioSelected: {
      borderColor:
        colors.primary,
    },

    radioDot: {
      width: 12,
      height: 12,

      borderRadius: 6,

      backgroundColor:
        colors.primary,
    },
  });