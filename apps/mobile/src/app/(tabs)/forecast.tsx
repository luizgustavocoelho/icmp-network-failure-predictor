import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  ActivityIndicator,
  Platform,
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

import {
  colors,
  radius,
  spacing,
  touchTarget,
  typography,
} from "../../constants/theme";

import {
  useLanguage,
} from "../../context/LanguageContext";

import {
  getRecommendationMessage,
} from "../../i18n/recommendations";

import {
  generateForecastPrediction,
  getHosts,
  getRecommendations,
} from "../../services/api";

import {
  ActivitySuitability,
  ActivityType,
  NetworkStatus,
  Prediction,
} from "../../types/api";


type PickerMode =
  | "date"
  | "time"
  | null;


export default function ForecastScreen() {
  const {
    language,
    t,
  } = useLanguage();

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    () =>
      new Date(
        Date.now() +
          60 *
            60 *
            1000
      )
  );

  const [
    pickerMode,
    setPickerMode,
  ] =
    useState<PickerMode>(
      null
    );

  const [
    prediction,
    setPrediction,
  ] =
    useState<Prediction | null>(
      null
    );

  const [
    recommendations,
    setRecommendations,
  ] = useState<
    {
      activity: ActivityType;
      suitability: ActivitySuitability;
      message: string;
    }[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );


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
    date: Date
  ) {
    return new Intl.DateTimeFormat(
      locale(),
      {
        dateStyle: "medium",
      }
    ).format(date);
  }


  function formatTime(
    date: Date
  ) {
    return new Intl.DateTimeFormat(
      locale(),
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(date);
  }


  function formatDateTime(
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


  function handlePickerChange(
    event: DateTimePickerEvent,
    value?: Date
  ) {
    if (
      Platform.OS ===
      "android"
    ) {
      setPickerMode(null);
    }

    if (
      event.type ===
        "dismissed" ||
      !value
    ) {
      return;
    }

    const updatedDate =
      new Date(
        selectedDate
      );

    if (
      pickerMode === "date"
    ) {
      updatedDate.setFullYear(
        value.getFullYear(),
        value.getMonth(),
        value.getDate()
      );
    }

    if (
      pickerMode === "time"
    ) {
      updatedDate.setHours(
        value.getHours(),
        value.getMinutes(),
        0,
        0
      );
    }

    setSelectedDate(
      updatedDate
    );
  }


  async function generateForecast() {
    try {
      setLoading(true);
      setError(null);

      const hosts =
        await getHosts();

      const activeHost =
        hosts.find(
          (host) =>
            host.is_active
        ) ?? hosts[0];

      if (!activeHost) {
        throw new Error(
          t(
            "connectionError"
          )
        );
      }

      if (
        selectedDate.getTime() <=
        Date.now()
      ) {
        throw new Error(
          t(
            "forecastError"
          )
        );
      }

      const generatedPrediction =
        await generateForecastPrediction(
          activeHost.id,
          selectedDate.toISOString()
        );

      setPrediction(
        generatedPrediction
      );

      const recommendationResponse =
        await getRecommendations(
          activeHost.id,
          generatedPrediction.id
        );

      setRecommendations(
        recommendationResponse.recommendations
      );
    } catch (
      requestError
    ) {
      console.error(
        requestError
      );

      if (
        requestError instanceof
        Error
      ) {
        setError(
          requestError.message
        );
      } else {
        setError(
          t(
            "forecastError"
          )
        );
      }

      setPrediction(
        null
      );

      setRecommendations(
        []
      );
    } finally {
      setLoading(false);
    }
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


  function activityLabel(
    activity: ActivityType
  ) {
    if (
      activity ===
      "videoconference"
    ) {
      return t(
        "videoConference"
      );
    }

    if (
      activity ===
      "streaming"
    ) {
      return t(
        "streaming"
      );
    }

    if (
      activity ===
      "online_gaming"
    ) {
      return t(
        "onlineGaming"
      );
    }

    if (
      activity ===
      "web_browsing"
    ) {
      return t(
        "webBrowsing"
      );
    }

    return t(
      "fileUpload"
    );
  }


  function suitabilityLabel(
    suitability:
      ActivitySuitability
  ) {
    if (
      suitability ===
      "caution"
    ) {
      return t(
        "caution"
      );
    }

    if (
      suitability ===
      "not_recommended"
    ) {
      return t(
        "notRecommended"
      );
    }

    return t(
      "recommended"
    );
  }


  function suitabilityColor(
    suitability:
      ActivitySuitability
  ) {
    if (
      suitability ===
      "caution"
    ) {
      return colors.warning;
    }

    if (
      suitability ===
      "not_recommended"
    ) {
      return colors.danger;
    }

    return colors.success;
  }


  function activityIcon(
    activity: ActivityType
  ): keyof typeof Ionicons.glyphMap {
    if (
      activity ===
      "videoconference"
    ) {
      return "videocam-outline";
    }

    if (
      activity ===
      "streaming"
    ) {
      return "play-circle-outline";
    }

    if (
      activity ===
      "online_gaming"
    ) {
      return "game-controller-outline";
    }

    if (
      activity ===
      "web_browsing"
    ) {
      return "globe-outline";
    }

    return "cloud-upload-outline";
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
            "forecastTitle"
          )}
        </Text>

        <Text
          style={
            styles.description
          }
        >
          {t(
            "forecastDescription"
          )}
        </Text>

        <Text
          style={
            styles.sectionTitle
          }
        >
          {t(
            "selectForecastTime"
          )}
        </Text>

        <View
          style={
            styles.selectionCard
          }
        >
          <View
            style={
              styles.selectionRow
            }
          >
            <View
              style={
                styles.selectionInfo
              }
            >
              <Text
                style={
                  styles.selectionLabel
                }
              >
                {t(
                  "selectedDate"
                )}
              </Text>

              <Text
                style={
                  styles.selectionValue
                }
              >
                {formatDate(
                  selectedDate
                )}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                setPickerMode(
                  "date"
                )
              }
              style={
                styles.secondaryButton
              }
              accessibilityRole="button"
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={
                  colors.primary
                }
              />

              <Text
                style={
                  styles.secondaryButtonText
                }
              >
                {t(
                  "changeDate"
                )}
              </Text>
            </Pressable>
          </View>

          <View
            style={
              styles.separator
            }
          />

          <View
            style={
              styles.selectionRow
            }
          >
            <View
              style={
                styles.selectionInfo
              }
            >
              <Text
                style={
                  styles.selectionLabel
                }
              >
                {t(
                  "selectedTime"
                )}
              </Text>

              <Text
                style={
                  styles.selectionValue
                }
              >
                {formatTime(
                  selectedDate
                )}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                setPickerMode(
                  "time"
                )
              }
              style={
                styles.secondaryButton
              }
              accessibilityRole="button"
            >
              <Ionicons
                name="time-outline"
                size={20}
                color={
                  colors.primary
                }
              />

              <Text
                style={
                  styles.secondaryButtonText
                }
              >
                {t(
                  "changeTime"
                )}
              </Text>
            </Pressable>
          </View>
        </View>

        {pickerMode && (
          <DateTimePicker
            value={
              selectedDate
            }
            mode={
              pickerMode
            }
            minimumDate={
              new Date()
            }
            onChange={
              handlePickerChange
            }
          />
        )}

        <Pressable
          onPress={
            generateForecast
          }
          disabled={
            loading
          }
          style={({
            pressed,
          }) => [
            styles.generateButton,

            pressed &&
              !loading &&
              styles.generateButtonPressed,

            loading &&
              styles.generateButtonDisabled,
          ]}
          accessibilityRole="button"
        >
          {loading ? (
            <>
              <ActivityIndicator
                color={
                  colors.white
                }
              />

              <Text
                style={
                  styles.generateButtonText
                }
              >
                {t(
                  "generatingForecast"
                )}
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="analytics-outline"
                size={22}
                color={
                  colors.white
                }
              />

              <Text
                style={
                  styles.generateButtonText
                }
              >
                {t(
                  "generateForecast"
                )}
              </Text>
            </>
          )}
        </Pressable>

        {error && (
          <View
            style={
              styles.errorCard
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={28}
              color={
                colors.danger
              }
            />

            <View
              style={
                styles.errorContent
              }
            >
              <Text
                style={
                  styles.errorTitle
                }
              >
                {t(
                  "forecastError"
                )}
              </Text>

              <Text
                style={
                  styles.errorDescription
                }
              >
                {error}
              </Text>
            </View>
          </View>
        )}

        {prediction && (
          <>
            <Text
              style={
                styles.sectionTitle
              }
            >
              {t(
                "forecastResult"
              )}
            </Text>

            <View
              style={[
                styles.resultCard,

                {
                  borderColor:
                    statusColor(
                      prediction.predicted_status
                    ),
                },
              ]}
              accessible
              accessibilityLabel={`${t(
                "predictedCondition"
              )}: ${statusLabel(
                prediction.predicted_status
              )}`}
            >
              <View
                style={
                  styles.resultHeader
                }
              >
                <View
                  style={
                    styles.resultTitleContainer
                  }
                >
                  <Text
                    style={
                      styles.resultLabel
                    }
                  >
                    {t(
                      "forecastFor"
                    )}
                  </Text>

                  <Text
                    style={
                      styles.resultDate
                    }
                  >
                    {formatDateTime(
                      prediction.forecast_for
                    )}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,

                    {
                      backgroundColor:
                        statusBackground(
                          prediction.predicted_status
                        ),

                      borderColor:
                        statusColor(
                          prediction.predicted_status
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
                            prediction.predicted_status
                          ),
                      },
                    ]}
                  >
                    {statusLabel(
                      prediction.predicted_status
                    )}
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.predictionMetrics
                }
              >
                <View
                  style={
                    styles.predictionMetric
                  }
                >
                  <Text
                    style={
                      styles.metricLabel
                    }
                  >
                    {t(
                      "predictedLatency"
                    )}
                  </Text>

                  <Text
                    style={
                      styles.metricValue
                    }
                  >
                    {
                      prediction.predicted_latency_ms ??
                      "—"
                    }
                    {" "}
                    ms
                  </Text>
                </View>

                <View
                  style={
                    styles.predictionMetric
                  }
                >
                  <Text
                    style={
                      styles.metricLabel
                    }
                  >
                    {t(
                      "predictedPacketLoss"
                    )}
                  </Text>

                  <Text
                    style={
                      styles.metricValue
                    }
                  >
                    {
                      prediction.predicted_packet_loss_pct ??
                      "—"
                    }
                    {" "}
                    %
                  </Text>
                </View>
              </View>
            </View>

            <Text
              style={
                styles.sectionTitle
              }
            >
              {t(
                "activityRecommendations"
              )}
            </Text>

            <Text
              style={
                styles.recommendationDescription
              }
            >
              {t(
                "recommendationDescription"
              )}
            </Text>

            {recommendations.map(
              (
                recommendation
              ) => (
                <View
                  key={
                    recommendation.activity
                  }
                  style={
                    styles.recommendationCard
                  }
                  accessible
                  accessibilityLabel={`${activityLabel(
                    recommendation.activity
                  )}. ${suitabilityLabel(
                    recommendation.suitability
                  )}. ${getRecommendationMessage(
                    language,
                    recommendation.activity,
                    recommendation.suitability
                  )}`}
                >
                  <View
                    style={
                      styles.recommendationIcon
                    }
                  >
                    <Ionicons
                      name={
                        activityIcon(
                          recommendation.activity
                        )
                      }
                      size={26}
                      color={
                        suitabilityColor(
                          recommendation.suitability
                        )
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.recommendationContent
                    }
                  >
                    <Text
                      style={
                        styles.recommendationTitle
                      }
                    >
                      {activityLabel(
                        recommendation.activity
                      )}
                    </Text>

                    <Text
                      style={[
                        styles.recommendationStatus,

                        {
                          color:
                            suitabilityColor(
                              recommendation.suitability
                            ),
                        },
                      ]}
                    >
                      {suitabilityLabel(
                        recommendation.suitability
                      )}
                    </Text>

                    <Text
                      style={
                        styles.recommendationMessage
                      }
                    >
                      {getRecommendationMessage(
                        language,
                        recommendation.activity,
                        recommendation.suitability
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
      marginTop:
        spacing.md,
    },

    selectionCard: {
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
        spacing.lg,
    },

    selectionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap:
        spacing.md,
    },

    selectionInfo: {
      flex: 1,
    },

    selectionLabel: {
      color:
        colors.textMuted,
      fontSize:
        typography.small,
      marginBottom:
        spacing.xs,
    },

    selectionValue: {
      color:
        colors.textPrimary,
      fontSize:
        typography.body,
      fontWeight: "700",
    },

    separator: {
      height: 1,
      backgroundColor:
        colors.border,
      marginVertical:
        spacing.lg,
    },

    secondaryButton: {
      minHeight:
        touchTarget.minimum,
      flexDirection: "row",
      alignItems: "center",
      gap:
        spacing.sm,
      backgroundColor:
        colors.primarySoft,
      borderColor:
        colors.primary,
      borderWidth: 1,
      borderRadius:
        radius.md,
      paddingHorizontal:
        spacing.md,
    },

    secondaryButtonText: {
      color:
        colors.primary,
      fontSize:
        typography.caption,
      fontWeight: "700",
    },

    generateButton: {
      minHeight: 56,
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
      marginBottom:
        spacing.xl,
    },

    generateButtonPressed: {
      opacity: 0.8,
    },

    generateButtonDisabled: {
      opacity: 0.6,
    },

    generateButtonText: {
      color:
        colors.white,
      fontSize:
        typography.body,
      fontWeight: "800",
    },

    errorCard: {
      flexDirection: "row",
      gap:
        spacing.md,
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

    errorContent: {
      flex: 1,
    },

    errorTitle: {
      color:
        colors.textPrimary,
      fontSize:
        typography.body,
      fontWeight: "700",
    },

    errorDescription: {
      color:
        colors.textSecondary,
      fontSize:
        typography.caption,
      lineHeight: 20,
      marginTop:
        spacing.xs,
    },

    resultCard: {
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

    resultHeader: {
      flexDirection: "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",
      gap:
        spacing.md,
      marginBottom:
        spacing.xl,
    },

    resultTitleContainer: {
      flex: 1,
    },

    resultLabel: {
      color:
        colors.textMuted,
      fontSize:
        typography.small,
      marginBottom:
        spacing.xs,
    },

    resultDate: {
      color:
        colors.textPrimary,
      fontSize:
        typography.subheading,
      fontWeight: "700",
    },

    statusBadge: {
      minHeight: 42,
      justifyContent:
        "center",
      borderWidth: 1,
      borderRadius:
        radius.full,
      paddingHorizontal:
        spacing.md,
    },

    statusBadgeText: {
      fontSize:
        typography.small,
      fontWeight: "800",
    },

    predictionMetrics: {
      flexDirection: "row",
      gap:
        spacing.md,
    },

    predictionMetric: {
      flex: 1,
      backgroundColor:
        colors.surfaceElevated,
      borderRadius:
        radius.md,
      padding:
        spacing.md,
    },

    metricLabel: {
      color:
        colors.textMuted,
      fontSize:
        typography.small,
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

    recommendationDescription: {
      color:
        colors.textSecondary,
      fontSize:
        typography.caption,
      lineHeight: 21,
      marginTop:
        -spacing.sm,
      marginBottom:
        spacing.md,
    },

    recommendationCard: {
      flexDirection: "row",
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
        spacing.lg,
      marginBottom:
        spacing.md,
    },

    recommendationIcon: {
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        colors.surfaceElevated,
      borderRadius:
        radius.md,
    },

    recommendationContent: {
      flex: 1,
    },

    recommendationTitle: {
      color:
        colors.textPrimary,
      fontSize:
        typography.body,
      fontWeight: "700",
    },

    recommendationStatus: {
      fontSize:
        typography.caption,
      fontWeight: "800",
      marginTop:
        spacing.xs,
    },

    recommendationMessage: {
      color:
        colors.textSecondary,
      fontSize:
        typography.caption,
      lineHeight: 20,
      marginTop:
        spacing.sm,
    },
  });