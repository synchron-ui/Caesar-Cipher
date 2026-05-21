import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface ShiftSelectorProps {
  shift: number;
  onShiftChange: (shift: number) => void;
}

export function ShiftSelector({ shift, onShiftChange }: ShiftSelectorProps) {
  const colors = useColors();

  const increment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShiftChange(shift >= 25 ? 1 : shift + 1);
  };

  const decrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShiftChange(shift <= 1 ? 25 : shift - 1);
  };

  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const previewPairs = Array.from({ length: 5 }, (_, i) => {
    const letterIndex = (i * 5) % 26;
    const letter = ALPHABET[letterIndex];
    const encoded = ALPHABET[(letterIndex + shift) % 26];
    return { letter, encoded };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>SHIFT</Text>
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={decrement}
          style={[styles.button, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Feather name="minus" size={20} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.valueContainer}>
          <Text style={[styles.shiftNumber, { color: colors.primary }]}>{shift}</Text>
          <Text style={[styles.shiftOf, { color: colors.mutedForeground }]}>of 25</Text>
        </View>

        <TouchableOpacity
          onPress={increment}
          style={[styles.button, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Feather name="plus" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.previewRow}>
        {previewPairs.map(({ letter, encoded }, i) => (
          <View key={i} style={styles.pairContainer}>
            <Text style={[styles.pairLetter, { color: colors.foreground }]}>{letter}</Text>
            <Feather name="arrow-right" size={10} color={colors.mutedForeground} />
            <Text style={[styles.pairLetter, { color: colors.primary }]}>{encoded}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  valueContainer: {
    alignItems: "center",
  },
  shiftNumber: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
  },
  shiftOf: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: -4,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  pairContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  pairLetter: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
