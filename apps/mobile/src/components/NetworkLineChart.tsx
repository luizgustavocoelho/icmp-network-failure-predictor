import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import Svg, {
  Circle,
  Line,
  Polyline,
} from "react-native-svg";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../constants/theme";


type NetworkLineChartProps = {
  title: string;
  values: (number | null)[];
  width: number;
  height?: number;
  unit: string;
};


export default function NetworkLineChart({
  title,
  values,
  width,
  height = 180,
  unit,
}: NetworkLineChartProps) {
  const numericValues =
    values.filter(
      (
        value
      ): value is number =>
        value !== null
    );


  if (
    numericValues.length === 0
  ) {
    return (
      <View
        style={styles.card}
      >
        <Text
          style={styles.title}
        >
          {title}
        </Text>

        <Text
          style={
            styles.emptyText
          }
        >
          No data
        </Text>
      </View>
    );
  }


  const minimumValue =
    Math.min(
      ...numericValues
    );

  const maximumValue =
    Math.max(
      ...numericValues
    );

  const range =
    maximumValue -
    minimumValue || 1;


  const chartPadding = 20;

  const drawableWidth =
    width -
    chartPadding * 2;

  const drawableHeight =
    height -
    chartPadding * 2;


  const points = values
    .map(
      (
        value,
        index
      ) => {
        if (value === null) {
          return null;
        }

        const x =
          chartPadding +
          (
            index /
            Math.max(
              values.length - 1,
              1
            )
          ) *
            drawableWidth;

        const normalizedValue =
          (
            value -
            minimumValue
          ) / range;

        const y =
          chartPadding +
          drawableHeight -
          normalizedValue *
            drawableHeight;

        return {
          x,
          y,
          value,
        };
      }
    )
    .filter(
      (
        point
      ): point is {
        x: number;
        y: number;
        value: number;
      } =>
        point !== null
    );


  const polylinePoints =
    points
      .map(
        (point) =>
          `${point.x},${point.y}`
      )
      .join(" ");


  const average =
    numericValues.reduce(
      (
        total,
        value
      ) =>
        total + value,
      0
    ) /
    numericValues.length;


  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`${title}. Average ${average.toFixed(
        2
      )} ${unit}. Minimum ${minimumValue.toFixed(
        2
      )} ${unit}. Maximum ${maximumValue.toFixed(
        2
      )} ${unit}.`}
    >
      <View
        style={
          styles.header
        }
      >
        <Text
          style={styles.title}
        >
          {title}
        </Text>

        <Text
          style={
            styles.average
          }
        >
          {average.toFixed(2)}
          {" "}
          {unit}
        </Text>
      </View>

      <Svg
        width={width}
        height={height}
      >
        <Line
          x1={chartPadding}
          y1={
            height -
            chartPadding
          }
          x2={
            width -
            chartPadding
          }
          y2={
            height -
            chartPadding
          }
          stroke={
            colors.border
          }
          strokeWidth="1"
        />

        <Line
          x1={chartPadding}
          y1={chartPadding}
          x2={chartPadding}
          y2={
            height -
            chartPadding
          }
          stroke={
            colors.border
          }
          strokeWidth="1"
        />

        {points.length > 1 && (
          <Polyline
            points={
              polylinePoints
            }
            fill="none"
            stroke={
              colors.primary
            }
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {points.map(
          (
            point,
            index
          ) => (
            <Circle
              key={
                `${point.x}-${index}`
              }
              cx={point.x}
              cy={point.y}
              r="4"
              fill={
                colors.primary
              }
            />
          )
        )}
      </Svg>

      <View
        style={
          styles.rangeRow
        }
      >
        <Text
          style={
            styles.rangeText
          }
        >
          Min:{" "}
          {minimumValue.toFixed(
            2
          )}{" "}
          {unit}
        </Text>

        <Text
          style={
            styles.rangeText
          }
        >
          Max:{" "}
          {maximumValue.toFixed(
            2
          )}{" "}
          {unit}
        </Text>
      </View>
    </View>
  );
}


const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        colors.surface,

      borderColor:
        colors.border,

      borderWidth: 1,

      borderRadius:
        radius.lg,

      paddingVertical:
        spacing.lg,

      marginBottom:
        spacing.lg,
    },

    header: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
        spacing.lg,

      marginBottom:
        spacing.md,

      gap:
        spacing.md,
    },

    title: {
      flex: 1,

      color:
        colors.textPrimary,

      fontSize:
        typography.subheading,

      fontWeight: "700",
    },

    average: {
      color:
        colors.primary,

      fontSize:
        typography.caption,

      fontWeight: "700",
    },

    emptyText: {
      color:
        colors.textMuted,

      fontSize:
        typography.body,

      paddingHorizontal:
        spacing.lg,

      marginTop:
        spacing.md,
    },

    rangeRow: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      paddingHorizontal:
        spacing.lg,

      marginTop:
        spacing.sm,
    },

    rangeText: {
      color:
        colors.textMuted,

      fontSize:
        typography.small,
    },
  });