import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
} from "expo-router";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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

import {
  ApiError,
  createHost,
  deleteHost,
  updateHost,
} from "../services/api";

import {
  Host,
} from "../types/api";


function isValidIpAddress(
  value: string
) {
  const trimmed =
    value.trim();

  const ipv4 =
    /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

  if (
    ipv4.test(
      trimmed
    )
  ) {
    return true;
  }

  return trimmed.includes(
    ":"
  );
}


export default function HostsScreen() {
  const {
    hosts,
    selectedHost,
    isLoading,
    error: hostsError,
    refreshHosts,
    selectHost,
  } = useHosts();

  const {
    language,
  } = useLanguage();

  const copy =
    getHostTranslations(
      language
    );

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  const [
    editingHost,
    setEditingHost,
  ] = useState<Host | null>(
    null
  );

  const [
    name,
    setName,
  ] = useState("");

  const [
    ipAddress,
    setIpAddress,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    isActive,
    setIsActive,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    actionError,
    setActionError,
  ] = useState<string | null>(
    null
  );

  const [
    togglingHostId,
    setTogglingHostId,
  ] = useState<number | null>(
    null
  );


  function resetForm() {
    setEditingHost(
      null
    );
    setName("");
    setIpAddress("");
    setDescription("");
    setIsActive(true);
    setActionError(null);
  }


  function openCreate() {
    resetForm();

    setModalVisible(
      true
    );
  }


  function openEdit(
    host: Host
  ) {
    setEditingHost(
      host
    );

    setName(
      host.name
    );

    setIpAddress(
      host.ip_address
    );

    setDescription(
      host.description ?? ""
    );

    setIsActive(
      host.is_active
    );

    setActionError(
      null
    );

    setModalVisible(
      true
    );
  }


  function closeModal() {
    if (saving) {
      return;
    }

    setModalVisible(
      false
    );

    resetForm();
  }


  async function handleSave() {
    const normalizedName =
      name.trim();

    const normalizedIp =
      ipAddress.trim();

    const normalizedDescription =
      description.trim();

    if (
      !normalizedName ||
      !isValidIpAddress(
        normalizedIp
      )
    ) {
      setActionError(
        copy.invalidForm
      );

      return;
    }

    setSaving(
      true
    );

    setActionError(
      null
    );

    try {
      let savedHost:
        Host;

      if (editingHost) {
        savedHost =
          await updateHost(
            editingHost.id,
            {
              name:
                normalizedName,
              ip_address:
                normalizedIp,
              description:
                normalizedDescription ||
                null,
              is_active:
                isActive,
            }
          );
      } else {
        savedHost =
          await createHost(
            {
              name:
                normalizedName,
              ip_address:
                normalizedIp,
              description:
                normalizedDescription ||
                null,
            }
          );

        if (!isActive) {
          savedHost =
            await updateHost(
              savedHost.id,
              {
                name:
                  savedHost.name,
                ip_address:
                  savedHost.ip_address,
                description:
                  savedHost.description,
                is_active:
                  false,
              }
            );
        }
      }

      await refreshHosts();

      await selectHost(
        savedHost.id
      );

      setModalVisible(
        false
      );

      resetForm();
    } catch (caughtError) {
      if (
        caughtError
        instanceof ApiError &&
        caughtError.status === 409
      ) {
        setActionError(
          copy.duplicateHost
        );
      } else {
        setActionError(
          caughtError
            instanceof Error
            ? caughtError.message
            : copy.hostActionError
        );
      }
    } finally {
      setSaving(
        false
      );
    }
  }


  async function handleToggle(
    host: Host
  ) {
    if (
      togglingHostId !== null
    ) {
      return;
    }

    setTogglingHostId(
      host.id
    );

    try {
      await updateHost(
        host.id,
        {
          name:
            host.name,
          ip_address:
            host.ip_address,
          description:
            host.description,
          is_active:
            !host.is_active,
        }
      );

      await refreshHosts();
    } catch (caughtError) {
      Alert.alert(
        copy.manageHosts,
        caughtError
          instanceof Error
          ? caughtError.message
          : copy.hostActionError
      );
    } finally {
      setTogglingHostId(
        null
      );
    }
  }


  function handleDelete(
    host: Host
  ) {
    Alert.alert(
      copy.deleteTitle,
      copy.deleteMessage,
      [
        {
          text:
            copy.cancel,
          style:
            "cancel",
        },
        {
          text:
            copy.deleteConfirm,
          style:
            "destructive",

          onPress: () => {
            void performDelete(
              host
            );
          },
        },
      ]
    );
  }


  async function performDelete(
    host: Host
  ) {
    try {
      await deleteHost(
        host.id
      );

      await refreshHosts();
    } catch (caughtError) {
      Alert.alert(
        copy.manageHosts,
        caughtError
          instanceof Error
          ? caughtError.message
          : copy.hostDeleteError
      );
    }
  }


  async function handleSelect(
    host: Host
  ) {
    await selectHost(
      host.id
    );

    router.back();
  }


  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <View
        style={
          styles.topBar
        }
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          style={
            styles.iconButton
          }
          accessibilityRole="button"
          accessibilityLabel={
            copy.back
          }
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={
              colors.textPrimary
            }
          />
        </Pressable>

        <View
          style={
            styles.topBarText
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
            {
              copy.manageHosts
            }
          </Text>
        </View>

        <Pressable
          onPress={
            openCreate
          }
          style={
            styles.addButton
          }
          accessibilityRole="button"
          accessibilityLabel={
            copy.addHost
          }
        >
          <Ionicons
            name="add"
            size={24}
            color={
              colors.white
            }
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text
          style={
            styles.descriptionText
          }
        >
          {
            copy.manageHostsDescription
          }
        </Text>

        {isLoading && (
          <View
            style={
              styles.stateCard
            }
          >
            <ActivityIndicator
              size="large"
              color={
                colors.primary
              }
            />
          </View>
        )}

        {!isLoading &&
          hostsError && (
            <View
              style={
                styles.errorCard
              }
            >
              <Text
                style={
                  styles.errorText
                }
              >
                {hostsError}
              </Text>
            </View>
          )}

        {!isLoading &&
          hosts.length === 0 && (
            <View
              style={
                styles.emptyCard
              }
            >
              <Ionicons
                name="server-outline"
                size={38}
                color={
                  colors.textMuted
                }
              />

              <Text
                style={
                  styles.emptyTitle
                }
              >
                {
                  copy.noHosts
                }
              </Text>

              <Text
                style={
                  styles.emptyDescription
                }
              >
                {
                  copy.addFirstHost
                }
              </Text>

              <Pressable
                onPress={
                  openCreate
                }
                style={
                  styles.primaryButton
                }
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={
                    colors.white
                  }
                />

                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  {
                    copy.addHost
                  }
                </Text>
              </Pressable>
            </View>
          )}

        {hosts.map(
          (host) => {
            const selected =
              selectedHost?.id ===
              host.id;

            const toggling =
              togglingHostId ===
              host.id;

            return (
              <View
                key={
                  host.id
                }
                style={[
                  styles.hostCard,
                  selected &&
                    styles.hostCardSelected,
                ]}
              >
                <View
                  style={
                    styles.hostHeader
                  }
                >
                  <View
                    style={
                      styles.hostIdentity
                    }
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            host.is_active
                              ? colors.success
                              : colors.textMuted,
                        },
                      ]}
                    />

                    <View
                      style={
                        styles.hostText
                      }
                    >
                      <Text
                        style={
                          styles.hostName
                        }
                      >
                        {
                          host.name
                        }
                      </Text>

                      <Text
                        style={
                          styles.hostIp
                        }
                      >
                        {
                          host.ip_address
                        }
                      </Text>
                    </View>
                  </View>

                  {selected && (
                    <View
                      style={
                        styles.selectedBadge
                      }
                    >
                      <Text
                        style={
                          styles.selectedBadgeText
                        }
                      >
                        {
                          copy.selected
                        }
                      </Text>
                    </View>
                  )}
                </View>

                {host.description && (
                  <Text
                    style={
                      styles.hostDescription
                    }
                  >
                    {
                      host.description
                    }
                  </Text>
                )}

                <View
                  style={
                    styles.monitorRow
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.monitorLabel
                      }
                    >
                      {
                        copy.monitoring
                      }
                    </Text>

                    <Text
                      style={
                        styles.monitorState
                      }
                    >
                      {
                        host.is_active
                          ? copy.monitoringActive
                          : copy.monitoringPaused
                      }
                    </Text>
                  </View>

                  {toggling ? (
                    <ActivityIndicator
                      color={
                        colors.primary
                      }
                    />
                  ) : (
                    <Switch
                      value={
                        host.is_active
                      }
                      onValueChange={() =>
                        void handleToggle(
                          host
                        )
                      }
                      trackColor={{
                        false:
                          colors.border,
                        true:
                          colors.primarySoft,
                      }}
                      thumbColor={
                        host.is_active
                          ? colors.primary
                          : colors.textMuted
                      }
                    />
                  )}
                </View>

                <View
                  style={
                    styles.actions
                  }
                >
                  <Pressable
                    onPress={() =>
                      void handleSelect(
                        host
                      )
                    }
                    style={[
                      styles.actionButton,
                      styles.selectButton,
                    ]}
                  >
                    <Ionicons
                      name={
                        selected
                          ? "checkmark-circle-outline"
                          : "radio-button-off-outline"
                      }
                      size={19}
                      color={
                        colors.primary
                      }
                    />

                    <Text
                      style={
                        styles.selectButtonText
                      }
                    >
                      {
                        selected
                          ? copy.selected
                          : copy.select
                      }
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      openEdit(
                        host
                      )
                    }
                    style={
                      styles.actionButton
                    }
                  >
                    <Ionicons
                      name="create-outline"
                      size={19}
                      color={
                        colors.textPrimary
                      }
                    />

                    <Text
                      style={
                        styles.actionButtonText
                      }
                    >
                      {
                        copy.edit
                      }
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      handleDelete(
                        host
                      )
                    }
                    style={
                      styles.actionButton
                    }
                  >
                    <Ionicons
                      name="trash-outline"
                      size={19}
                      color={
                        colors.danger
                      }
                    />

                    <Text
                      style={
                        styles.deleteText
                      }
                    >
                      {
                        copy.delete
                      }
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          }
        )}
      </ScrollView>

      <Modal
        visible={
          modalVisible
        }
        animationType="slide"
        transparent
        onRequestClose={
          closeModal
        }
      >
        <KeyboardAvoidingView
          style={
            styles.modalBackdrop
          }
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View
            style={
              styles.modalCard
            }
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={
                false
              }
            >
              <View
                style={
                  styles.modalHeader
                }
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  {
                    editingHost
                      ? copy.editHost
                      : copy.addHost
                  }
                </Text>

                <Pressable
                  onPress={
                    closeModal
                  }
                  style={
                    styles.iconButton
                  }
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

              <Text
                style={
                  styles.inputLabel
                }
              >
                {
                  copy.hostName
                }
              </Text>

              <TextInput
                value={
                  name
                }
                onChangeText={
                  setName
                }
                placeholder={
                  copy.hostName
                }
                placeholderTextColor={
                  colors.textMuted
                }
                style={
                  styles.input
                }
                maxLength={100}
              />

              <Text
                style={
                  styles.inputLabel
                }
              >
                {
                  copy.ipAddress
                }
              </Text>

              <TextInput
                value={
                  ipAddress
                }
                onChangeText={
                  setIpAddress
                }
                placeholder="8.8.8.8"
                placeholderTextColor={
                  colors.textMuted
                }
                style={
                  styles.input
                }
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text
                style={
                  styles.inputLabel
                }
              >
                {
                  copy.description
                }
                {" "}
                (
                {
                  copy.optional
                }
                )
              </Text>

              <TextInput
                value={
                  description
                }
                onChangeText={
                  setDescription
                }
                placeholder={
                  copy.description
                }
                placeholderTextColor={
                  colors.textMuted
                }
                style={[
                  styles.input,
                  styles.multilineInput,
                ]}
                multiline
                maxLength={255}
              />

              <View
                style={
                  styles.formSwitchRow
                }
              >
                <View>
                  <Text
                    style={
                      styles.inputLabel
                    }
                  >
                    {
                      copy.monitoring
                    }
                  </Text>

                  <Text
                    style={
                      styles.monitorState
                    }
                  >
                    {
                      isActive
                        ? copy.monitoringActive
                        : copy.monitoringPaused
                    }
                  </Text>
                </View>

                <Switch
                  value={
                    isActive
                  }
                  onValueChange={
                    setIsActive
                  }
                  trackColor={{
                    false:
                      colors.border,
                    true:
                      colors.primarySoft,
                  }}
                  thumbColor={
                    isActive
                      ? colors.primary
                      : colors.textMuted
                  }
                />
              </View>

              {actionError && (
                <View
                  style={
                    styles.errorCard
                  }
                >
                  <Text
                    style={
                      styles.errorText
                    }
                  >
                    {
                      actionError
                    }
                  </Text>
                </View>
              )}

              <Pressable
                onPress={
                  handleSave
                }
                disabled={
                  saving
                }
                style={({
                  pressed,
                }) => [
                  styles.saveButton,
                  (
                    pressed ||
                    saving
                  ) &&
                    styles.buttonPressed,
                ]}
              >
                {saving && (
                  <ActivityIndicator
                    color={
                      colors.white
                    }
                  />
                )}

                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  {
                    saving
                      ? copy.saving
                      : copy.save
                  }
                </Text>
              </Pressable>

              <Pressable
                onPress={
                  closeModal
                }
                disabled={
                  saving
                }
                style={
                  styles.cancelButton
                }
              >
                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  {
                    copy.cancel
                  }
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

    topBar: {
      flexDirection: "row",
      alignItems: "center",
      gap:
        spacing.md,
      paddingHorizontal:
        spacing.lg,
      paddingTop:
        spacing.sm,
      paddingBottom:
        spacing.md,
    },

    topBarText: {
      flex: 1,
    },

    eyebrow: {
      color:
        colors.primary,
      fontSize:
        typography.small,
      fontWeight: "800",
      letterSpacing: 1.4,
      marginBottom:
        spacing.xs,
    },

    title: {
      color:
        colors.textPrimary,
      fontSize:
        typography.heading,
      fontWeight: "700",
    },

    iconButton: {
      width:
        touchTarget.minimum,
      height:
        touchTarget.minimum,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        radius.md,
    },

    addButton: {
      width:
        touchTarget.minimum,
      height:
        touchTarget.minimum,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        colors.primary,
      borderRadius:
        radius.md,
    },

    content: {
      paddingHorizontal:
        spacing.lg,
      paddingBottom:
        spacing.xxl,
    },

    descriptionText: {
      color:
        colors.textSecondary,
      fontSize:
        typography.body,
      lineHeight: 24,
      marginBottom:
        spacing.lg,
    },

    stateCard: {
      minHeight: 140,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        colors.surface,
      borderColor:
        colors.border,
      borderWidth: 1,
      borderRadius:
        radius.lg,
    },

    emptyCard: {
      alignItems: "center",
      justifyContent:
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
    },

    emptyTitle: {
      color:
        colors.textPrimary,
      fontSize:
        typography.subheading,
      fontWeight: "700",
      marginTop:
        spacing.md,
    },

    emptyDescription: {
      color:
        colors.textSecondary,
      fontSize:
        typography.caption,
      textAlign: "center",
      lineHeight: 21,
      marginTop:
        spacing.sm,
      marginBottom:
        spacing.lg,
    },

    primaryButton: {
      minHeight:
        touchTarget.minimum,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap:
        spacing.sm,
      backgroundColor:
        colors.primary,
      borderRadius:
        radius.md,
      paddingHorizontal:
        spacing.lg,
    },

    primaryButtonText: {
      color:
        colors.white,
      fontSize:
        typography.body,
      fontWeight: "700",
    },

    hostCard: {
      backgroundColor:
        colors.surface,
      borderColor:
        colors.border,
      borderWidth: 1,
      borderRadius:
        radius.lg,
      padding:
        spacing.lg,
      marginBottom:
        spacing.md,
    },

    hostCardSelected: {
      borderColor:
        colors.primary,
      backgroundColor:
        colors.surfaceElevated,
    },

    hostHeader: {
      flexDirection: "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",
      gap:
        spacing.md,
    },

    hostIdentity: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap:
        spacing.sm,
    },

    statusDot: {
      width: 10,
      height: 10,
      borderRadius:
        radius.full,
    },

    hostText: {
      flex: 1,
    },

    hostName: {
      color:
        colors.textPrimary,
      fontSize:
        typography.subheading,
      fontWeight: "700",
    },

    hostIp: {
      color:
        colors.textSecondary,
      fontSize:
        typography.caption,
      marginTop:
        spacing.xs,
    },

    selectedBadge: {
      backgroundColor:
        colors.primarySoft,
      borderColor:
        colors.primary,
      borderWidth: 1,
      borderRadius:
        radius.full,
      paddingHorizontal:
        spacing.sm,
      paddingVertical:
        spacing.xs,
    },

    selectedBadgeText: {
      color:
        colors.primary,
      fontSize:
        typography.small,
      fontWeight: "800",
    },

    hostDescription: {
      color:
        colors.textSecondary,
      fontSize:
        typography.caption,
      lineHeight: 20,
      marginTop:
        spacing.md,
    },

    monitorRow: {
      minHeight:
        touchTarget.minimum,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginTop:
        spacing.md,
      paddingTop:
        spacing.md,
      borderTopColor:
        colors.border,
      borderTopWidth: 1,
    },

    monitorLabel: {
      color:
        colors.textPrimary,
      fontSize:
        typography.caption,
      fontWeight: "700",
    },

    monitorState: {
      color:
        colors.textMuted,
      fontSize:
        typography.small,
      marginTop:
        spacing.xs,
    },

    actions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap:
        spacing.sm,
      marginTop:
        spacing.md,
    },

    actionButton: {
      minHeight:
        touchTarget.minimum,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap:
        spacing.xs,
      backgroundColor:
        colors.surfaceElevated,
      borderColor:
        colors.border,
      borderWidth: 1,
      borderRadius:
        radius.md,
      paddingHorizontal:
        spacing.md,
    },

    selectButton: {
      borderColor:
        colors.primary,
      backgroundColor:
        colors.primarySoft,
    },

    actionButtonText: {
      color:
        colors.textPrimary,
      fontSize:
        typography.caption,
      fontWeight: "700",
    },

    selectButtonText: {
      color:
        colors.primary,
      fontSize:
        typography.caption,
      fontWeight: "700",
    },

    deleteText: {
      color:
        colors.danger,
      fontSize:
        typography.caption,
      fontWeight: "700",
    },

    modalBackdrop: {
      flex: 1,
      justifyContent:
        "flex-end",
      backgroundColor:
        "rgba(0, 0, 0, 0.65)",
    },

    modalCard: {
      maxHeight: "92%",
      backgroundColor:
        colors.background,
      borderTopLeftRadius:
        radius.xl,
      borderTopRightRadius:
        radius.xl,
      borderColor:
        colors.border,
      borderWidth: 1,
      padding:
        spacing.lg,
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom:
        spacing.lg,
    },

    modalTitle: {
      flex: 1,
      color:
        colors.textPrimary,
      fontSize:
        typography.heading,
      fontWeight: "700",
    },

    inputLabel: {
      color:
        colors.textSecondary,
      fontSize:
        typography.caption,
      fontWeight: "700",
      marginBottom:
        spacing.sm,
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
      paddingVertical:
        spacing.sm,
      marginBottom:
        spacing.sm,
    },

    multilineInput: {
      minHeight: 96,
      textAlignVertical:
        "top",
    },

    formSwitchRow: {
      minHeight: 70,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginVertical:
        spacing.md,
    },

    errorCard: {
      backgroundColor:
        colors.dangerBackground,
      borderColor:
        colors.danger,
      borderWidth: 1,
      borderRadius:
        radius.md,
      padding:
        spacing.md,
      marginBottom:
        spacing.md,
    },

    errorText: {
      color:
        colors.danger,
      fontSize:
        typography.caption,
      lineHeight: 20,
    },

    saveButton: {
      minHeight: 54,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap:
        spacing.sm,
      backgroundColor:
        colors.primary,
      borderRadius:
        radius.md,
      marginTop:
        spacing.md,
    },

    saveButtonText: {
      color:
        colors.white,
      fontSize:
        typography.body,
      fontWeight: "800",
    },

    cancelButton: {
      minHeight:
        touchTarget.minimum,
      alignItems: "center",
      justifyContent:
        "center",
      marginTop:
        spacing.sm,
    },

    cancelButtonText: {
      color:
        colors.textSecondary,
      fontSize:
        typography.body,
      fontWeight: "700",
    },

    buttonPressed: {
      opacity: 0.75,
    },
  });
