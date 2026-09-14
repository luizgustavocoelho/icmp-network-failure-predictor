import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import SelectedHostCard
  from "../../components/SelectedHostCard";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../constants/theme";

import {
  useHosts,
} from "../../context/HostContext";

import {
  useLanguage,
} from "../../context/LanguageContext";

import {
  getAlerts,
} from "../../services/api";

import {
  AlertSeverity,
  NetworkAlert,
} from "../../types/api";


export default function AlertsScreen() {
  const {
    language,
    t,
  } = useLanguage();

  const {
    selectedHost,
  } = useHosts();

  const selectedHostId =
    selectedHost?.id ?? null;

  const [
    alerts,
    setAlerts,
  ] =
    useState<NetworkAlert[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(false);


  const loadAlerts =
    useCallback(
      async (
        isRefresh = false
      ) => {
        try {
          if (isRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError(false);

          if (selectedHostId === null) {
            setAlerts([]);
            return;
          }

          const data =
            await getAlerts(
              selectedHostId,
              100
            );

          setAlerts(data);
        } catch (
          requestError
        ) {
          console.error(
            requestError
          );

          setError(true);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [selectedHostId]
    );


  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, [loadAlerts])
  );


  const summary =
    useMemo(() => {
      return {
        total:
          alerts.length,

        warning:
          alerts.filter(
            (alert) =>
              alert.severity ===
              "warning"
          ).length,

        critical:
          alerts.filter(
            (alert) =>
              alert.severity ===
              "critical"
          ).length,
      };
    }, [alerts]);


  function locale() {
    if (language === "pt") {
      return "pt-BR";
    }

    if (language === "es") {
      return "es-ES";
    }

    return "en-US";
  }


  function formatDate(
    value: string
  ) {
    return new Intl.DateTimeFormat(
      locale(),
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(
      new Date(value)
    );
  }


  function alertColor(
    severity: AlertSeverity
  ) {
    if (
      severity === "critical"
    ) {
      return colors.danger;
    }

    if (
      severity === "warning"
    ) {
      return colors.warning;
    }

    return colors.primary;
  }


  function alertBackground(
    severity: AlertSeverity
  ) {
    if (
      severity === "critical"
    ) {
      return (
        colors.dangerBackground
      );
    }

    if (
      severity === "warning"
    ) {
      return (
        colors.warningBackground
      );
    }

    return colors.primarySoft;
  }


  function alertIcon(
    severity: AlertSeverity
  ): keyof typeof Ionicons.glyphMap {
    if (
      severity === "critical"
    ) {
      return "alert-circle-outline";
    }

    if (
      severity === "warning"
    ) {
      return "warning-outline";
    }

    return "information-circle-outline";
  }


  function alertTitle(
    severity: AlertSeverity
  ) {
    if (
      severity === "critical"
    ) {
      return t(
        "alertCriticalTitle"
      );
    }

    if (
      severity === "warning"
    ) {
      return t(
        "alertWarningTitle"
      );
    }

    return t(
      "alertInfoTitle"
    );
  }


  function alertDescription(
    severity: AlertSeverity
  ) {
    if (
      severity === "critical"
    ) {
      return t(
        "alertCriticalDescription"
      );
    }

    if (
      severity === "warning"
    ) {
      return t(
        "alertWarningDescription"
      );
    }

    return t(
      "alertInfoDescription"
    );
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
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() =>
              loadAlerts(true)
            }
            tintColor={
              colors.primary
            }
          />
        }
      >
        <Text
          style={
            styles.eyebrow
          }
        >
          {t("appName")}
        </Text>

        <Text
          style={
            styles.title
          }
        >
          {t(
            "alertsTitle"
          )}
        </Text>

        <Text
          style={
            styles.description
          }
        >
          {t(
            "alertsDescription"
          )}
        </Text>

        <SelectedHostCard />

        {loading && (
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

            <Text
              style={
                styles.stateText
              }
            >
              {t(
                "loadingData"
              )}
            </Text>
          </View>
        )}

        {!loading &&
          error && (
            <View
              style={
                styles.errorCard
              }
            >
              <Ionicons
                name="cloud-offline-outline"
                size={32}
                color={
                  colors.danger
                }
              />

              <Text
                style={
                  styles.errorTitle
                }
              >
                {t(
                  "connectionError"
                )}
              </Text>

              <Text
                style={
                  styles.errorDescription
                }
              >
                {t(
                  "connectionErrorDescription"
                )}
              </Text>
            </View>
          )}

        {!loading &&
          !error &&
          alerts.length ===
            0 && (
            <View
              style={
                styles.emptyCard
              }
              accessible
              accessibilityLabel={`${t(
                "noAlerts"
              )}. ${t(
                "noAlertsDescription"
              )}`}
            >
              <View
                style={
                  styles.emptyIcon
                }
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={34}
                  color={
                    colors.success
                  }
                />
              </View>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                {t(
                  "noAlerts"
                )}
              </Text>

              <Text
                style={
                  styles.emptyDescription
                }
              >
                {t(
                  "noAlertsDescription"
                )}
              </Text>
            </View>
          )}

        {!loading &&
          !error &&
          alerts.length >
            0 && (
            <>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                {t(
                  "alertsSummary"
                )}
              </Text>

              <View
                style={
                  styles.summaryRow
                }
              >
                <View
                  style={
                    styles.summaryCard
                  }
                >
                  <Text
                    style={
                      styles.summaryNumber
                    }
                  >
                    {
                      summary.total
                    }
                  </Text>

                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    {t(
                      "totalAlerts"
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.summaryCard
                  }
                >
                  <Text
                    style={[
                      styles.summaryNumber,
                      {
                        color:
                          colors.warning,
                      },
                    ]}
                  >
                    {
                      summary.warning
                    }
                  </Text>

                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    {t(
                      "warningAlerts"
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.summaryCard
                  }
                >
                  <Text
                    style={[
                      styles.summaryNumber,
                      {
                        color:
                          colors.danger,
                      },
                    ]}
                  >
                    {
                      summary.critical
                    }
                  </Text>

                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    {t(
                      "criticalAlerts"
                    )}
                  </Text>
                </View>
              </View>

              <Text
                style={
                  styles.sectionTitle
                }
              >
                {t(
                  "recentAlerts"
                )}
              </Text>

              {alerts.map(
                (alert) => (
                  <View
                    key={
                      alert.id
                    }
                    style={[
                      styles.alertCard,

                      {
                        borderColor:
                          alertColor(
                            alert.severity
                          ),
                      },
                    ]}
                    accessible
                    accessibilityLabel={`${alertTitle(
                      alert.severity
                    )}. ${alertDescription(
                      alert.severity
                    )}. ${formatDate(
                      alert.created_at
                    )}.`}
                  >
                    <View
                      style={[
                        styles.alertIcon,

                        {
                          backgroundColor:
                            alertBackground(
                              alert.severity
                            ),
                        },
                      ]}
                    >
                      <Ionicons
                        name={alertIcon(
                          alert.severity
                        )}
                        size={28}
                        color={alertColor(
                          alert.severity
                        )}
                      />
                    </View>

                    <View
                      style={
                        styles.alertContent
                      }
                    >
                      <View
                        style={
                          styles.alertHeader
                        }
                      >
                        <Text
                          style={
                            styles.alertTitle
                          }
                        >
                          {alertTitle(
                            alert.severity
                          )}
                        </Text>

                        <Text
                          style={[
                            styles.readState,

                            {
                              color:
                                alert.is_read
                                  ? colors.textMuted
                                  : colors.primary,
                            },
                          ]}
                        >
                          {
                            alert.is_read
                              ? t(
                                  "readAlert"
                                )
                              : t(
                                  "unreadAlert"
                                )
                          }
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.alertDescription
                        }
                      >
                        {alertDescription(
                          alert.severity
                        )}
                      </Text>

                      <Text
                        style={
                          styles.alertDate
                        }
                      >
                        {formatDate(
                          alert.created_at
                        )}
                      </Text>
                    </View>
                  </View>
                )
              )}
            </>
          )}
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

    eyebrow: {
      color:
        colors.primary,
      fontSize:
        typography.small,
      fontWeight: "700",
      letterSpacing: 1.6,
      marginBottom:
        spacing.sm,
    },

    title: {
      color:
        colors.textPrimary,
      fontSize:
        typography.title,
      fontWeight: "700",
    },

    description: {
      color:
        colors.textSecondary,
      fontSize:
        typography.body,
      lineHeight: 24,
      marginTop:
        spacing.sm,
      marginBottom:
        spacing.xl,
    },

    sectionTitle: {
      color:
        colors.textPrimary,
      fontSize:
        typography.subheading,
      fontWeight: "700",
      marginBottom:
        spacing.md,
    },

    summaryRow: {
      flexDirection: "row",
      gap:
        spacing.sm,
      marginBottom:
        spacing.xl,
    },

    summaryCard: {
      flex: 1,
      minHeight: 100,
      alignItems:
        "center",
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
        spacing.sm,
    },

    summaryNumber: {
      color:
        colors.textPrimary,
      fontSize: 28,
      fontWeight: "800",
    },

    summaryLabel: {
      color:
        colors.textMuted,
      fontSize:
        typography.small,
      textAlign:
        "center",
      marginTop:
        spacing.xs,
    },

    alertCard: {
      flexDirection: "row",
      gap:
        spacing.md,
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderRadius:
        radius.lg,
      padding:
        spacing.lg,
      marginBottom:
        spacing.md,
    },

    alertIcon: {
      width: 50,
      height: 50,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius:
        radius.md,
    },

    alertContent: {
      flex: 1,
    },

    alertHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      gap:
        spacing.sm,
    },

    alertTitle: {
      flex: 1,
      color:
        colors.textPrimary,
      fontSize:
        typography.body,
      fontWeight: "700",
    },

    readState: {
      fontSize:
        typography.small,
      fontWeight: "700",
    },

    alertDescription: {
      color:
        colors.textSecondary,
      fontSize:
        typography.caption,
      lineHeight: 20,
      marginTop:
        spacing.sm,
    },

    alertDate: {
      color:
        colors.textMuted,
      fontSize:
        typography.small,
      marginTop:
        spacing.md,
    },

    emptyCard: {
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
    },

    emptyIcon: {
      width: 68,
      height: 68,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius: 34,
      backgroundColor:
        colors.successBackground,
      marginBottom:
        spacing.md,
    },

    emptyTitle: {
      color:
        colors.textPrimary,
      fontSize:
        typography.subheading,
      fontWeight: "700",
      textAlign:
        "center",
    },

    emptyDescription: {
      color:
        colors.textSecondary,
      fontSize:
        typography.caption,
      lineHeight: 21,
      textAlign:
        "center",
      marginTop:
        spacing.sm,
    },

    stateCard: {
      minHeight: 140,
      alignItems:
        "center",
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

    stateText: {
      color:
        colors.textSecondary,
      fontSize:
        typography.body,
      marginTop:
        spacing.md,
    },

    errorCard: {
      alignItems:
        "center",
      backgroundColor:
        colors.dangerBackground,
      borderColor:
        colors.danger,
      borderWidth: 1,
      borderRadius:
        radius.lg,
      padding:
        spacing.xl,
    },

    errorTitle: {
      color:
        colors.textPrimary,
      fontSize:
        typography.subheading,
      fontWeight: "700",
      textAlign:
        "center",
      marginTop:
        spacing.md,
    },

    errorDescription: {
      color:
        colors.textSecondary,
      fontSize:
        typography.caption,
      lineHeight: 21,
      textAlign:
        "center",
      marginTop:
        spacing.sm,
    },
  });
