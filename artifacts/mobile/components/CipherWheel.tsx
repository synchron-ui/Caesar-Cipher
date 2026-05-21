import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useColors } from "@/hooks/useColors";

interface CipherWheelProps {
  shift: number;
  isDesktop?: boolean;
}

export function CipherWheel({ shift: targetShift, isDesktop = false }: CipherWheelProps) {
  const colors = useColors();
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const currentShift = useRef(0);

  const WHEEL_RADIUS = isDesktop ? 72 : 52;
  const INNER_RADIUS = isDesktop ? 48 : 34;
  const WHEEL_SIZE = WHEEL_RADIUS * 2 + 32;
  const INNER_SIZE = INNER_RADIUS * 2 + 16;

  useEffect(() => {
    const degrees = (targetShift / 26) * 360;
    Animated.spring(rotationAnim, {
      toValue: degrees,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();
    currentShift.current = targetShift;
  }, [targetShift]);

  const rotate = rotationAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const LETTERS_ON_WHEEL = 8;
  const step = Math.floor(26 / LETTERS_ON_WHEEL);
  const outerLetters = Array.from({ length: LETTERS_ON_WHEEL }, (_, i) =>
    ALPHABET[(i * step) % 26]
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.wheel,
          {
            borderColor: colors.border,
            width: WHEEL_SIZE,
            height: WHEEL_SIZE,
            borderRadius: WHEEL_SIZE / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.innerRing,
            {
              borderColor: colors.primary,
              transform: [{ rotate }],
              width: INNER_SIZE,
              height: INNER_SIZE,
              borderRadius: INNER_SIZE / 2,
            },
          ]}
        >
          {outerLetters.map((letter, i) => {
            const angle = (i / LETTERS_ON_WHEEL) * 2 * Math.PI - Math.PI / 2;
            const x = INNER_RADIUS * Math.cos(angle);
            const y = INNER_RADIUS * Math.sin(angle);
            return (
              <Text
                key={`inner-${i}`}
                style={[
                  styles.innerLetter,
                  {
                    color: colors.primary,
                    position: "absolute",
                    left: INNER_RADIUS + x - 7,
                    top: INNER_RADIUS + y - 8,
                    fontSize: isDesktop ? 13 : 11,
                  },
                ]}
              >
                {letter}
              </Text>
            );
          })}
        </Animated.View>

        {outerLetters.map((letter, i) => {
          const angle = (i / LETTERS_ON_WHEEL) * 2 * Math.PI - Math.PI / 2;
          const x = WHEEL_RADIUS * Math.cos(angle);
          const y = WHEEL_RADIUS * Math.sin(angle);
          return (
            <Text
              key={`outer-${i}`}
              style={[
                styles.outerLetter,
                {
                  color: colors.mutedForeground,
                  position: "absolute",
                  left: WHEEL_RADIUS + x - 7,
                  top: WHEEL_RADIUS + y - 8,
                  fontSize: isDesktop ? 13 : 11,
                },
              ]}
            >
              {letter}
            </Text>
          );
        })}
      </View>
      <Text style={[styles.shiftLabel, { color: colors.mutedForeground, fontSize: isDesktop ? 13 : 11 }]}>
        shift ×{targetShift}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 6,
  },
  wheel: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  innerRing: {
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  outerLetter: {
    fontFamily: "Inter_600SemiBold",
  },
  innerLetter: {
    fontFamily: "Inter_700Bold",
  },
  shiftLabel: {
    fontFamily: "Inter_400Regular",
    letterSpacing: 1,
  },
});
