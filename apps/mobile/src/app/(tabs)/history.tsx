import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
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

import {
  useFocusEffect,
} from "expo-router";

import NetworkLineChart
  from "../../components/NetworkLineChart";

import SelectedHostCard
  from "../../components/SelectedHostCard";

import {
  colors,
  radius,
  spacing,
  touchTarget,
  typography,
} from "../../constants/theme";

import {
  useHosts,
} from "../../context/HostContext";

import {
  useLanguage,
} from "../../context/LanguageContext";

import {
  getMeasurements,
} from "../../services/api";

import {
  Measurement,
  NetworkStatus,
} from "../../types/api";


type HistoryPeriod =
  | "24h"
  | "7d"
  | "30d";


const PERIOD_HOURS: Record<
  HistoryPeriod,
  number
> = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
};


export default function HistoryScreen() {
  const {
    language,
    t,
  } = useLanguage();

  const {
    selectedHost,
  } = useHosts();

  const selectedHostId =
    selectedHost?.id ?? null;

  const {
    width,
  } = useWindowDimensions();

  const [
    period,
    setPeriod,
  ] =
    useState<HistoryPeriod>(
      "24h"
    );

  const [
    measurements,
    setMeasurements,
  ] = useState<
    Measurement[]
  >([]);

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


  const loadHistory =
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
            setMeasurements(
              []
            );

            return;
          }

          const endAt =
            new Date();

          const startAt =
            new Date(
              endAt.getTime() -
                PERIOD_HOURS[
                  period
                ] *
                  60 *
                  60 *
                  1000
            );

          const data =
            await getMeasurements(
              selectedHostId,
              {
                startAt:
                  startAt.toISOString(),

                endAt:
                  endAt.toISOString(),

                limit: 500,
              }
            );

          setMeasurements(
            data
          );
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
      [
        period,
        selectedHostId,
      ]
    );


  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );


  const summary =
    useMemo(() => {
      const latencies =
        measurements
          .map(
            (measurement) =>
              measurement.latency_ms
          )
          .filter(
            (
              latency
            ): latency is number =>
              latency !== null
          );


      const averageLatency =
        latencies.length > 0
          ? latencies.reduce(
              (
                total,
                value
              ) =>
                total + value,
              0
            ) /
            latencies.length
          : null;


      const minimumLatency =
        latencies.length > 0
          ? Math.min(
              ...latencies
            )
          : null;


      const maximumLatency =
        latencies.length > 0
          ? Math.max(
              ...latencies
            )
          : null;


      const averagePacketLoss =
        measurements.length > 0
          ? measurements.reduce(
              (
                total,
                measurement
              ) =>
                total +
                measurement.packet_loss_pct,
              0
            ) /
            measurements.length
          : null;


      return {
        averageLatency,
        minimumLatency,
        maximumLatency,
        averagePacketLoss,
      };
    }, [measurements]);


  const chronologicalMeasurements =
    useMemo(
      () =>
        [
          ...measurements,
        ].reverse(),
      [measurements]
    );


  const chartWidth =
    Math.max(
      240,
      width -
        spacing.lg * 2 -
        spacing.lg * 2
    );


  function periodLabel(
    selectedPeriod:
      HistoryPeriod
  ) {
    if (
      selectedPeriod ===
      "7d"
    ) {
      return t(
        "last7Days"
      );
    }

    if (
      selectedPeriod ===
      "30d"
    ) {
      return t(
        "last30Days"
      );
    }

    return t(
      "last24Hours"
    );
  }


  function statusLabel(
    status: NetworkStatus
  ) {
    if (
      status === "RISK"
    ) {
      return t(
        "statusRisk"
      );
    }

    if (
      status ===
      "FAILURE"
    ) {
      return t(
        "statusFailure"
      );
    }

    return t(
      "statusOk"
    );
  }


  function statusColor(
    status: NetworkStatus
  ) {
    if (
      status === "RISK"
    ) {
      return colors.warning;
    }

    if (
      status ===
      "FAILURE"
    ) {
      return colors.danger;
    }

    return colors.success;
  }


  function statusBackground(
    status: NetworkStatus
  ) {
    if (
      status === "RISK"
    ) {
      return (
        colors.warningBackground
      );
    }

    if (
      status ===
      "FAILURE"
    ) {
      return (
        colors.dangerBackground
      );
    }

    return (
      colors.successBackground
    );
  }


  function formatValue(
    value: number | null,
    unit: string
  ) {
    if (value === null) {
      return "â€”";
    }

    return `${value.toFixed(
      2
    )} ${unit}`;
  }


  function formatDate(
    value: string
  ) {
    const locale =
      language === "pt"
        ? "pt-BR"
        : language === "es"
          ? "es-ES"
          : "en-US";

    return new Intl.DateTimeFormat(
      locale,
      {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(
      new Date(value)
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
              loadHistory(
                true
              )
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
            "historyTitle"
          )}
        </Text>

        <Text
          style={
            styles.description
          }
        >
          {t(
            "historyDescription"
          )}
        </Text>

        <SelectedHostCard />

        <View
          style={
            styles.periodSelector
          }
        >
          {(
            [
              "24h",
              "7d",
              "30d",
            ] as HistoryPeriod[]
          ).map(
            (
              option
            ) => {
              const selected =
                option ===
                period;

              return (
                <Pressable
                  key={
                    option
                  }
                  onPress={() =>
                    setPeriod(
                      option
                    )
                  }
                  style={[
                    styles.periodButton,

                    selected &&
                      styles.periodButtonSelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected,
                  }}
                >
                  <Text
                    style={[
                      styles.periodButtonText,

                      selected &&
                        styles.periodButtonTextSelected,
                    ]}
                  >
                    {periodLabel(
                      option
                    )}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>

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

              <Pressable
                onPress={() =>
                  loadHistory()
                }
                style={
                  styles.retryButton
                }
              >
                <Text
                  style={
                    styles.retryButtonText
                  }
                >
                  {t(
                    "retry"
                  )}
                </Text>
              </Pressable>
            </View>
          )}

        {!loading &&
          !error &&
          measurements.length ===
            0 && (
            <View
              style={
                styles.stateCard
              }
            >
              <Text
                style={
                  styles.stateText
                }
              >
                {t(
                  "noHistory"
                )}
              </Text>
            </View>
          )}

        {!loading &&
          !error &&
          measurements.length >
            0 && (
            <>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                {t(
                  "historySummary"
                )}
              </Text>

              <Text
                style={
                  styles.measurementCount
                }
              >
                {measurements.length}
                {" "}
                {t(
                  "measurementsCount"
                )}
              </Text>

              <View
                style={
                  styles.metricsGrid
                }
              >
                <View
                  style={
                    styles.metricCard
                  }
                >
                  <Text
                    style={
                      styles.metricLabel
                    }
                  >
                    {t(
                      "averageLatency"
                    )}
                  </Text>

                  <Text
                    style={
                      styles.metricValue
                    }
                  >
                    {formatValue(
                      summary.averageLatency,
                      "ms"
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.metricCard
                  }
                >
                  <Text
                    style={
                      styles.metricLabel
                    }
                  >
                    {t(
                      "averagePacketLoss"
                    )}
                  </Text>

                  <Text
                    style={
                      styles.metricValue
                    }
                  >
                    {formatValue(
                      summary.averagePacketLoss,
                      "%"
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.metricCard
                  }
                >
                  <Text
                    style={
                      styles.metricLabel
                    }
                  >
                    {t(
                      "minimumLatency"
                    )}
                  </Text>

                  <Text
                    style={
                      styles.metricValue
                    }
                  >
                    {formatValue(
                      summary.minimumLatency,
                      "ms"
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.metricCard
                  }
                >
                  <Text
                    style={
                      styles.metricLabel
                    }
                  >
                    {t(
                      "maximumLatency"
                    )}
                  </Text>

                  <Text
                    style={
                      styles.metricValue
                    }
                  >
                    {formatValue(
                      summary.maximumLatency,
                      "ms"
                    )}
                  </Text>
                </View>
              </View>

              <NetworkLineChart
                title={
                  t(
                    "latencyTrend"
                  )
                }
                values={
                  chronologicalMeasurements.map(
                    (
                      measurement
                    ) =>
                      measurement.latency_ms
                  )
                }
                width={
                  chartWidth
                }
                unit="ms"
              />

              <NetworkLineChart
                title={
                  t(
                    "packetLossTrend"
                  )
                }
                values={
                  chronologicalMeasurements.map(
                    (
                      measurement
                    ) =>
                      measurement.packet_loss_pct
                  )
                }
                width={
                  chartWidth
                }
                unit="%"
              />

              <Text
                style={
                  styles.sectionTitle
                }
              >
                {t(
                  "recentMeasurements"
                )}
              </Text>

              {measurements
                .slice(
                  0,
                  10
                )
                .map(
                  (
                    measurement
                  ) => (
                    <View
                      key={
                        measurement.id
                      }
                      style={
                        styles.measurementCard
                      }
                      accessible
                      accessibilityLabel={`${t(
                        "measuredAt"
                      )}: ${formatDate(
                        measurement.measured_at
                      )}. ${t(
                        "latency"
                      )}: ${
                        measurement.latency_ms ??
                        "unavailable"
                      } ms. ${t(
                        "packetLoss"
                      )}: ${
                        measurement.packet_loss_pct
                      } percent. ${t(
                        "measurementStatus"
                      )}: ${statusLabel(
                        measurement.status
                      )}.`}
                    >
                      <View
                        style={
                          styles.measurementHeader
                        }
                      >
                        <Text
                          style={
                            styles.measurementDate
                          }
                        >
                          {formatDate(
                            measurement.measured_at
                          )}
                        </Text>

                        <View
                          style={[
                            styles.statusBadge,

                            {
                              backgroundColor:
                                statusBackground(
                                  measurement.status
                                ),

                              borderColor:
                                statusColor(
                                  measurement.status
                                ),
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,

                              {
                                color:
                                  statusColor(
                                    measurement.status
                                  ),
                              },
                            ]}
                          >
                            {statusLabel(
                              measurement.status
                            )}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={
                          styles.measurementValues
                        }
                      >
                        <View>
                          <Text
                            style={
                              styles.valueLabel
                            }
                          >
                            {t(
                              "latency"
                            )}
                          </Text>

                          <Text
                            style={
                              styles.valueText
                            }
                          >
                            {measurement.latency_ms ??
                              "â€”"}
                            {" "}
                            ms
                          </Text>
                        </View>

                        <View>
                          <Text
                            style={
                              styles.valueLabel
                            }
                          >
                            {t(
                              "packetLoss"
                            )}
                          </Text>

                          <Text
                            style={
                              styles.valueText
                            }
                          >
                            {
                              measurement.packet_loss_pct
                            }
                            {" "}%
                          </Text>
                        </View>
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
        spacing.lg,
    },

    periodSelector: {
      flexDirection: "row",

      gap:
        spacing.sm,

      marginBottom:
        spacing.xl,
    },

    periodButton: {
      flex: 1,

      minHeight:
        touchTarget.minimum,

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
        radius.md,

      paddingHorizontal:
        spacing.sm,
    },

    periodButtonSelected: {
      backgroundColor:
        colors.primarySoft,

      borderColor:
        colors.primary,
    },

    periodButtonText: {
      color:
        colors.textSecondary,

      fontSize:
        typography.caption,

      fontWeight: "700",

      textAlign:
        "center",
    },

    periodButtonTextSelected: {
      color:
        colors.primary,
    },

    sectionTitle: {
      color:
        colors.textPrimary,

      fontSize:
        typography.subheading,

      fontWeight: "700",

      marginBottom:
        spacing.sm,
    },

    measurementCount: {
      color:
        colors.textMuted,

      fontSize:
        typography.caption,

      marginBottom:
        spacing.md,
    },

    metricsGrid: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap:
        spacing.md,

      marginBottom:
        spacing.xl,
    },

    metricCard: {
      width: "47%",

      minHeight: 110,

      backgroundColor:
        colors.surface,

      borderColor:
        colors.border,

      borderWidth: 1,

      borderRadius:
        radius.lg,

      padding:
        spacing.md,
    },

    metricLabel: {
      color:
        colors.textSecondary,

      fontSize:
        typography.caption,

      lineHeight: 18,
    },

    metricValue: {
      color:
        colors.textPrimary,

      fontSize:
        typography.heading,

      fontWeight: "700",

      marginTop:
        spacing.sm,
    },

    measurementCard: {
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

    measurementHeader: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      gap:
        spacing.md,

      marginBottom:
        spacing.md,
    },

    measurementDate: {
      flex: 1,

      color:
        colors.textPrimary,

      fontSize:
        typography.body,

      fontWeight: "600",
    },

    statusBadge: {
      borderWidth: 1,

      borderRadius:
        radius.full,

      paddingHorizontal:
        spacing.md,

      paddingVertical:
        spacing.sm,
    },

    statusBadgeText: {
      fontSize:
        typography.small,

      fontWeight: "800",
    },

    measurementValues: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      gap:
        spacing.lg,
    },

    valueLabel: {
      color:
        colors.textMuted,

      fontSize:
        typography.small,

      marginBottom:
        spacing.xs,
    },

    valueText: {
      color:
        colors.textPrimary,

      fontSize:
        typography.body,

      fontWeight: "700",
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

      textAlign:
        "center",

      marginTop:
        spacing.md,
    },

    errorCard: {
      backgroundColor:
        colors.dangerBackground,

      borderColor:
        colors.danger,

      borderWidth: 1,

      borderRadius:
        radius.lg,

      padding:
        spacing.lg,
    },

    errorTitle: {
      color:
        colors.textPrimary,

      fontSize:
        typography.subheading,

      fontWeight: "700",
    },

    errorDescription: {
      color:
        colors.textSecondary,

      fontSize:
        typography.caption,

      lineHeight: 21,

      marginTop:
        spacing.sm,
    },

    retryButton: {
      minHeight:
        touchTarget.minimum,

      marginTop:
        spacing.lg,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        colors.danger,

      borderRadius:
        radius.md,

      paddingHorizontal:
        spacing.lg,
    },

    retryButtonText: {
      color:
        colors.white,

      fontSize:
        typography.body,

      fontWeight: "700",
    },
  });
