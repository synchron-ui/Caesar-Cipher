import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface DecodeUnlockCardProps {
  output: string;
  onUnlock: (password: string) => boolean;
  isUnlocked: boolean;
  onLock: () => void;
  onCopy: () => void;
  copied: boolean;
}

export function DecodeUnlockCard({
  output,
  onUnlock,
  isUnlocked,
  onLock,
  onCopy,
  copied,
}: DecodeUnlockCardProps) {
  const colors = useColors();
  const [attempt, setAttempt] = useState("");
  const [showAttempt, setShowAttempt] = useState(false);
  const [wrongAttempt, setWrongAttempt] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const copyAnim = useRef(new Animated.Value(1)).current;

  const doShake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: Platform.OS !== "web" }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: Platform.OS !== "web" }),
      Animated.timing(shakeAnim, { toValue: 7, duration: 60, useNativeDriver: Platform.OS !== "web" }),
      Animated.timing(shakeAnim, { toValue: -7, duration: 60, useNativeDriver: Platform.OS !== "web" }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: Platform.OS !== "web" }),
    ]).start();
  };

  const handleUnlock = () => {
    const ok = onUnlock(attempt);
    if (!ok) {
      setWrongAttempt(true);
      doShake();
      setTimeout(() => setWrongAttempt(false), 2000);
    } else {
      setAttempt("");
    }
  };

  const handleLock = () => {
    setAttempt("");
    setWrongAttempt(false);
    onLock();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.secondary,
          borderColor: isUnlocked ? colors.primary : colors.border,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: isUnlocked ? colors.primary : colors.mutedForeground }]}>
          PLAINTEXT
        </Text>
        {isUnlocked && (
          <View style={styles.headerActions}>
            <Animated.View style={{ transform: [{ scale: copyAnim }] }}>
              <TouchableOpacity
                onPress={onCopy}
                activeOpacity={0.7}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: copied ? colors.primary : colors.card,
                    borderColor: copied ? colors.primary : colors.border,
                  },
                ]}
              >
                <Feather
                  name={copied ? "check" : "copy"}
                  size={13}
                  color={copied ? colors.primaryForeground : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.actionBtnText,
                    { color: copied ? colors.primaryForeground : colors.mutedForeground },
                  ]}
                >
                  {copied ? "Copied!" : "Copy"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity
              onPress={handleLock}
              activeOpacity={0.7}
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Feather name="lock" size={13} color={colors.mutedForeground} />
              <Text style={[styles.actionBtnText, { color: colors.mutedForeground }]}>
                Lock
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isUnlocked ? (
        <Text style={[styles.outputText, { color: colors.foreground }]} selectable>
          {output}
        </Text>
      ) : (
        <Animated.View
          style={[styles.lockSection, { transform: [{ translateX: shakeAnim }] }]}
        >
          <View
            style={[
              styles.blurredOutput,
              { backgroundColor: colors.muted, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.blurredText, { color: colors.mutedForeground }]}>
              {"•".repeat(Math.min(output.length, 24))}
            </Text>
          </View>

          <View style={styles.unlockRow}>
            <View
              style={[
                styles.passInput,
                {
                  backgroundColor: colors.card,
                  borderColor: wrongAttempt ? colors.destructive : colors.border,
                },
              ]}
            >
              <Feather
                name="key"
                size={15}
                color={wrongAttempt ? colors.destructive : colors.mutedForeground}
              />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Enter password to reveal"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showAttempt}
                value={attempt}
                onChangeText={(t) => { setAttempt(t); setWrongAttempt(false); }}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleUnlock}
              />
              <TouchableOpacity onPress={() => setShowAttempt((p) => !p)}>
                <Feather
                  name={showAttempt ? "eye-off" : "eye"}
                  size={15}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleUnlock}
              activeOpacity={0.8}
              style={[styles.unlockBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="unlock" size={15} color={colors.primaryForeground} />
            </TouchableOpacity>
          </View>

          {wrongAttempt && (
            <Text style={[styles.wrongText, { color: colors.destructive }]}>
              Incorrect password. Try again.
            </Text>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  outputText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    lineHeight: 22,
  },
  lockSection: {
    gap: 10,
  },
  blurredOutput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  blurredText: {
    fontSize: 20,
    letterSpacing: 3,
  },
  unlockRow: {
    flexDirection: "row",
    gap: 8,
  },
  passInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  unlockBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  wrongText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
});
