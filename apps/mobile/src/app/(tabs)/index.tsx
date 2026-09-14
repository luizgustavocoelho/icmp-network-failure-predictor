import {
  ActivityIndicator,
  Pressable,
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
  useEffect,
  useRef,
  useState,
} from "react";

import LanguageSelector
  from "../../components/LanguageSelector";

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
  getLatestMeasurement,
  getLatestPrediction,
} from "../../services/api";

import {
  Measurement,
  NetworkStatus,
  Prediction,
} from "../../types/api";


const AUTO_REFRESH_INTERVAL_MS =
  5000;


type DashboardLoadMode =
  | "initial"
  | "refresh"
  | "silent";


export default function HomeScreen() {
  const {
    t,
  } = useLanguage();

  const {
    selectedHost,
  } = useHosts();

  const selectedHostId =
    selectedHost?.id ?? null;

  const [
    measurement,
    setMeasurement,
  ] = useState<Measurement | null>(
    null
  );

  const [
    prediction,
    setPrediction,
  ] = useState<Prediction | null>(
    null
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

  const requestInFlightRef =
    useRef(false);

  const hasLoadedRef =
    useRef(false);


  const loadDashboard =
    useCallback(
      async (
        mode:
          DashboardLoadMode =
            "initial"
      ) => {
        if (
          requestInFlightRef.current
        ) {
          return;
        }

        requestInFlightRef.current =
          true;

        try {
          if (
            mode === "refresh"
          ) {
            setRefreshing(
              true
            );
          } else if (
            mode === "initial"
          ) {
            setLoading(
              true
            );
          }

          if (
            mode !== "silent"
          ) {
            setError(
              false
            );
          }

          if (selectedHostId === null) {
            setMeasurement(
              null
            );

            setPrediction(
              null
            );

            setError(
              false
            );

            hasLoadedRef.current =
              true;

            return;
          }

          const [
            latestMeasurement,
            latestPrediction,
          ] =
            await Promise.all([
              getLatestMeasurement(
                selectedHostId
              ),

              getLatestPrediction(
                selectedHostId
              ),
            ]);

          setMeasurement(
            latestMeasurement
          );

          setPrediction(
            latestPrediction
          );

          setError(
            false
          );

          hasLoadedRef.current =
            true;
        } catch (
          requestError
        ) {
          console.error(
            requestError
          );

          if (
            mode !== "silent"
          ) {
            setError(
              true
            );
          }
        } finally {
          if (
            mode === "initial"
          ) {
            setLoading(
              false
            );
          }

          if (
            mode === "refresh"
          ) {
            setRefreshing(
              false
            );
          }

          requestInFlightRef.current =
            false;
        }
      },
      [
        selectedHostId,
      ]
    );


  useEffect(() => {
    hasLoadedRef.current =
      false;

    const initialLoadId =
      setTimeout(
        () => {
          void loadDashboard(
            "initial"
          );
        },
        0
      );

    const intervalId =
      setInterval(
        () => {
          void loadDashboard(
            "silent"
          );
        },
        AUTO_REFRESH_INTERVAL_MS
      );

    return () => {
      clearTimeout(
        initialLoadId
      );

      clearInterval(
        intervalId
      );
    };
  }, [loadDashboard]);


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
      status === "FAILURE"
    ) {
      return t(
        "statusFailure"
      );
    }

    return t(
      "statusOk"
    );
  }


  function statusTitle(
    status: NetworkStatus
  ) {
    if (
      status === "RISK"
    ) {
      return t(
        "networkAtRisk"
      );
    }

    if (
      status === "FAILURE"
    ) {
      return t(
        "networkFailure"
      );
    }

    return t(
      "networkStable"
    );
  }


  function statusDescription(
    status: NetworkStatus
  ) {
    if (
      status === "RISK"
    ) {
      return t(
        "riskDescription"
      );
    }

    if (
      status === "FAILURE"
    ) {
      return t(
        "failureDescription"
      );
    }

    return t(
      "stableDescription"
    );
  }


  function predictionTitle(
    status: NetworkStatus
  ) {
    if (
      status === "RISK"
    ) {
      return t(
        "connectionMayDegrade"
      );
    }

    if (
      status === "FAILURE"
    ) {
      return t(
        "connectionFailureExpected"
      );
    }

    return t(
      "connectionRemainStable"
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
      status === "FAILURE"
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
      status === "FAILURE"
    ) {
      return (
        colors.dangerBackground
      );
    }

    return (
      colors.successBackground
    );
  }


  const currentStatus =
    measurement?.status;

  const predictedStatus =
    prediction?.predicted_status;


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
        style={
          styles.container
        }
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
              loadDashboard(
                "refresh"
              )
            }
            tintColor={
              colors.primary
            }
            colors={[
              colors.primary,
            ]}
          />
        }
      >
        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.headerContent
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
                {t(
                  "appName"
                )}
              </Text>

              <Text
                style={
                  styles.title
                }
              >
                {t(
                  "connectionOverview"
                )}
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                {t(
                  "overviewDescription"
                )}
              </Text>
            </View>

            <LanguageSelector />
          </View>
        </View>

        <SelectedHostCard />


        {loading && (
          <View
            style={
              styles.stateCard
            }
            accessible
            accessibilityLabel={
              t(
                "loadingData"
              )
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
              accessible
              accessibilityLabel={`${t(
                "connectionError"
              )}. ${t(
                "connectionErrorDescription"
              )}`}
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
                  loadDashboard(
                    "initial"
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.retryButton,

                  pressed &&
                    styles.retryButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={
                  t(
                    "retry"
                  )
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
          !error && (
            <>
              <Text
                style={
                  styles.liveLabel
                }
              >
                {t(
                  "liveData"
                )}
              </Text>


              {measurement &&
              currentStatus ? (
                <>
                  <View
                    style={[
                      styles.statusCard,

                      {
                        backgroundColor:
                          statusBackground(
                            currentStatus
                          ),

                        borderColor:
                          statusColor(
                            currentStatus
                          ),
                      },
                    ]}
                    accessible
                    accessibilityLabel={`${t(
                      "currentStatus"
                    )}: ${statusTitle(
                      currentStatus
                    )}. ${statusDescription(
                      currentStatus
                    )}`}
                  >
                    <View
                      style={
                        styles.statusHeader
                      }
                    >
                      <View
                        style={
                          styles.statusTextContainer
                        }
                      >
                        <Text
                          style={
                            styles.cardLabel
                          }
                        >
                          {t(
                            "currentStatus"
                          )}
                        </Text>

                        <Text
                          style={
                            styles.statusText
                          }
                        >
                          {statusTitle(
                            currentStatus
                          )}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,

                          {
                            backgroundColor:
                              statusColor(
                                currentStatus
                              ),
                          },
                        ]}
                      >
                        <Text
                          style={
                            styles.statusBadgeText
                          }
                        >
                          {statusLabel(
                            currentStatus
                          )}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={
                        styles.statusDescription
                      }
                    >
                      {statusDescription(
                        currentStatus
                      )}
                    </Text>
                  </View>


                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    {t(
                      "latestMeasurement"
                    )}
                  </Text>


                  <View
                    style={
                      styles.metricsRow
                    }
                  >
                    <View
                      style={
                        styles.metricCard
                      }
                      accessible
                      accessibilityLabel={`${t(
                        "latency"
                      )}: ${
                        measurement.latency_ms ??
                        "—"
                      } milliseconds`}
                    >
                      <Text
                        style={
                          styles.metricLabel
                        }
                      >
                        {t(
                          "latency"
                        )}
                      </Text>

                      <Text
                        style={
                          styles.metricValue
                        }
                      >
                        {
                          measurement.latency_ms ??
                          "—"
                        }

                        <Text
                          style={
                            styles.metricUnit
                          }
                        >
                          {" "}
                          ms
                        </Text>
                      </Text>

                      <Text
                        style={
                          styles.metricDescription
                        }
                      >
                        {t(
                          "responseTime"
                        )}
                      </Text>
                    </View>


                    <View
                      style={
                        styles.metricCard
                      }
                      accessible
                      accessibilityLabel={`${t(
                        "packetLoss"
                      )}: ${
                        measurement.packet_loss_pct
                      } percent`}
                    >
                      <Text
                        style={
                          styles.metricLabel
                        }
                      >
                        {t(
                          "packetLoss"
                        )}
                      </Text>

                      <Text
                        style={
                          styles.metricValue
                        }
                      >
                        {
                          measurement.packet_loss_pct
                        }

                        <Text
                          style={
                            styles.metricUnit
                          }
                        >
                          {" "}
                          %
                        </Text>
                      </Text>

                      <Text
                        style={
                          styles.metricDescription
                        }
                      >
                        {t(
                          "packetsLost"
                        )}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <View
                  style={
                    styles.stateCard
                  }
                  accessible
                  accessibilityLabel={
                    t(
                      "noMeasurement"
                    )
                  }
                >
                  <Text
                    style={
                      styles.stateText
                    }
                  >
                    {t(
                      "noMeasurement"
                    )}
                  </Text>
                </View>
              )}


              <Text
                style={
                  styles.sectionTitle
                }
              >
                {t(
                  "prediction"
                )}
              </Text>


              {prediction &&
              predictedStatus ? (
                <View
                  style={[
                    styles.predictionCard,

                    {
                      borderColor:
                        statusColor(
                          predictedStatus
                        ),
                    },
                  ]}
                  accessible
                  accessibilityLabel={`${t(
                    "prediction"
                  )}: ${predictionTitle(
                    predictedStatus
                  )}. ${statusLabel(
                    predictedStatus
                  )}`}
                >
                  <Text
                    style={
                      styles.cardLabel
                    }
                  >
                    {t(
                      "nextForecast"
                    )}
                  </Text>

                  <Text
                    style={
                      styles.predictionTitle
                    }
                  >
                    {predictionTitle(
                      predictedStatus
                    )}
                  </Text>

                  <View
                    style={[
                      styles.predictionStatus,

                      {
                        backgroundColor:
                          statusBackground(
                            predictedStatus
                          ),

                        borderColor:
                          statusColor(
                            predictedStatus
                          ),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.predictionStatusText,

                        {
                          color:
                            statusColor(
                              predictedStatus
                            ),
                        },
                      ]}
                    >
                      {statusLabel(
                        predictedStatus
                      )}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.helperText
                    }
                  >
                    {t(
                      "basedOnMeasurements"
                    )}
                  </Text>
                </View>
              ) : (
                <View
                  style={
                    styles.stateCard
                  }
                  accessible
                  accessibilityLabel={
                    t(
                      "noPrediction"
                    )
                  }
                >
                  <Text
                    style={
                      styles.stateText
                    }
                  >
                    {t(
                      "noPrediction"
                    )}
                  </Text>
                </View>
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

    container: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    content: {
      paddingHorizontal:
        spacing.lg,

      paddingTop:
        spacing.lg,

      paddingBottom: 110,
    },

    header: {
      marginBottom:
        spacing.xl,
    },

    headerContent: {
      flexDirection: "row",

      alignItems:
        "flex-start",

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

    liveLabel: {
      color:
        colors.primary,

      fontSize:
        typography.small,

      fontWeight: "800",

      letterSpacing: 1.2,

      marginBottom:
        spacing.sm,
    },

    statusCard: {
      borderWidth: 1,

      borderRadius:
        radius.lg,

      padding:
        spacing.lg,

      marginBottom:
        spacing.xl,
    },

    statusHeader: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems:
        "flex-start",

      gap:
        spacing.md,
    },

    statusTextContainer: {
      flex: 1,
    },

    cardLabel: {
      color:
        colors.textMuted,

      fontSize:
        typography.small,

      fontWeight: "700",

      letterSpacing: 1,

      marginBottom:
        spacing.sm,
    },

    statusText: {
      color:
        colors.textPrimary,

      fontSize:
        typography.heading,

      fontWeight: "700",
    },

    statusBadge: {
      borderRadius:
        radius.full,

      minWidth: 48,

      minHeight: 48,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        spacing.md,
    },

    statusBadgeText: {
      color:
        colors.background,

      fontSize:
        typography.caption,

      fontWeight: "800",
    },

    statusDescription: {
      color:
        colors.textSecondary,

      fontSize:
        typography.caption,

      lineHeight: 21,

      marginTop:
        spacing.md,
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

    metricsRow: {
      flexDirection: "row",

      gap:
        spacing.md,

      marginBottom:
        spacing.xl,
    },

    metricCard: {
      flex: 1,

      minHeight: 130,

      backgroundColor:
        colors.surface,

      borderColor:
        colors.border,

      borderWidth: 1,

      borderRadius:
        radius.lg,

      padding:
        spacing.lg,
    },

    metricLabel: {
      color:
        colors.textSecondary,

      fontSize:
        typography.caption,

      marginBottom:
        spacing.sm,
    },

    metricValue: {
      color:
        colors.textPrimary,

      fontSize: 28,

      fontWeight: "700",
    },

    metricUnit: {
      color:
        colors.textSecondary,

      fontSize:
        typography.caption,

      fontWeight: "500",
    },

    metricDescription: {
      color:
        colors.textMuted,

      fontSize:
        typography.small,

      marginTop:
        spacing.sm,
    },

    predictionCard: {
      backgroundColor:
        colors.surface,

      borderWidth: 1,

      borderRadius:
        radius.lg,

      padding:
        spacing.lg,

      marginBottom:
        spacing.xl,
    },

    predictionTitle: {
      color:
        colors.textPrimary,

      fontSize:
        typography.subheading,

      fontWeight: "700",

      lineHeight: 26,

      paddingRight: 90,
    },

    predictionStatus: {
      position: "absolute",

      top:
        spacing.lg,

      right:
        spacing.lg,

      borderWidth: 1,

      borderRadius:
        radius.full,

      paddingHorizontal:
        spacing.md,

      paddingVertical:
        spacing.sm,
    },

    predictionStatusText: {
      fontSize:
        typography.caption,

      fontWeight: "800",
    },

    helperText: {
      color:
        colors.textMuted,

      fontSize:
        typography.small,

      marginTop:
        spacing.lg,
    },

    stateCard: {
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

      marginBottom:
        spacing.xl,

      minHeight: 120,
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

      marginBottom:
        spacing.xl,
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

      paddingHorizontal:
        spacing.lg,

      borderRadius:
        radius.md,

      backgroundColor:
        colors.danger,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    retryButtonPressed: {
      opacity: 0.75,
    },

    retryButtonText: {
      color:
        colors.white,

      fontSize:
        typography.body,

      fontWeight: "700",
    },
  });