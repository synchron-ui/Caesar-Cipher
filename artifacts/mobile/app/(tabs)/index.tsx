import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Animated,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { ModeToggle } from "@/components/ModeToggle";
import { ShiftSelector } from "@/components/ShiftSelector";
import { CipherWheel } from "@/components/CipherWheel";
import { SetPasswordModal } from "@/components/SetPasswordModal";
import { DecodeUnlockCard } from "@/components/DecodeUnlockCard";

const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN ?? "localhost";
const API_BASE = `https://${DOMAIN}/api`;
const DESKTOP_BREAKPOINT = 768;

async function callCipherAPI(
  text: string,
  shift: number,
  mode: "encode" | "decode"
): Promise<string> {
  const res = await fetch(`${API_BASE}/cipher`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, shift, mode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Server error");
  }
  const data = (await res.json()) as { result: string };
  return data.result;
}

export default function CipherScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [shift, setShift] = useState(3);
  const [inputText, setInputText] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [copied, setCopied] = useState(false);
  const copyAnim = useRef(new Animated.Value(1)).current;

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [decodePassword, setDecodePassword] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const runCipher = useCallback(
    async (text: string, currentShift: number, currentMode: "encode" | "decode") => {
      if (!text.trim()) { setOutput(""); setApiError(""); return; }
      setLoading(true);
      setApiError("");
      try {
        const result = await callCipherAPI(text, currentShift, currentMode);
        setOutput(result);
        if (currentMode === "decode") setIsUnlocked(false);
      } catch (e: unknown) {
        setApiError(e instanceof Error ? e.message : "Could not reach the server.");
        setOutput("");
      } finally {
        setLoading(false);
      }
    }, []
  );

  const handleTextChange = (text: string) => { setInputText(text); runCipher(text, shift, mode); };
  const handleShiftChange = (s: number) => { setShift(s); runCipher(inputText, s, mode); };

  const handleModeToggle = (newMode: "encode" | "decode") => {
    if (newMode === mode) return;
    if (newMode === "decode") { setShowPasswordModal(true); }
    else { setMode("encode"); setDecodePassword(null); setIsUnlocked(false); setInputText(""); setOutput(""); setCopied(false); setApiError(""); }
  };

  const handlePasswordSet = (password: string) => {
    setDecodePassword(password); setIsUnlocked(false); setMode("decode");
    setInputText(""); setOutput(""); setCopied(false); setApiError(""); setShowPasswordModal(false);
  };

  const handleUnlockAttempt = (attempt: string): boolean => {
    if (attempt === decodePassword) { setIsUnlocked(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); return true; }
    return false;
  };

  const handleCopy = async () => {
    try {
      const { setStringAsync } = await import("expo-clipboard");
      await setStringAsync(output);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopied(true);
      Animated.sequence([
        Animated.timing(copyAnim, { toValue: 1.15, duration: 100, useNativeDriver: Platform.OS !== "web" }),
        Animated.timing(copyAnim, { toValue: 1, duration: 200, useNativeDriver: Platform.OS !== "web" }),
      ]).start();
      setTimeout(() => setCopied(false), 2000);
    } catch { Alert.alert("Copy failed", "Could not copy to clipboard."); }
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInputText(""); setOutput(""); setCopied(false); setApiError("");
    if (mode === "decode") setIsUnlocked(false);
  };

  const topPad = Platform.OS === "web" ? Math.max(insets.top, isDesktop ? 20 : 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  const headerBlock = (
    <View style={[styles.header, isDesktop && styles.headerDesktop]}>
      <Text style={[styles.title, { color: colors.primary }, isDesktop && styles.titleDesktop]}>CAESAR</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }, isDesktop && styles.subtitleDesktop]}>CIPHER MACHINE</Text>
      <View style={[styles.flaskBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <Text style={[styles.flaskBadgeText, { color: colors.mutedForeground }]}>🐍 Powered by Python Flask</Text>
      </View>
    </View>
  );

  const controlsBlock = (
    <View style={[styles.controlsBlock, isDesktop && styles.controlsBlockDesktop]}>
      <ModeToggle mode={mode} onToggle={handleModeToggle} />
      {mode === "decode" && decodePassword && (
        <View style={[styles.passwordBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="shield" size={13} color={colors.primary} />
          <Text style={[styles.passwordBadgeText, { color: colors.mutedForeground }]}>Password protected decode</Text>
          <TouchableOpacity onPress={() => setShowPasswordModal(true)} activeOpacity={0.7}>
            <Text style={[styles.changePassText, { color: colors.primary }]}>Change</Text>
          </TouchableOpacity>
        </View>
      )}
      <ShiftSelector shift={shift} onShiftChange={handleShiftChange} />
    </View>
  );

  const ioBlock = (
    <View style={styles.ioBlock}>
      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.inputHeader}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{mode === "encode" ? "PLAINTEXT" : "CIPHERTEXT"}</Text>
          <View style={styles.inputHeaderRight}>
            {loading && <ActivityIndicator size="small" color={colors.primary} />}
            {inputText.length > 0 && !loading && (
              <TouchableOpacity onPress={handleClear} activeOpacity={0.7}><Feather name="x-circle" size={16} color={colors.mutedForeground} /></TouchableOpacity>
            )}
          </View>
        </View>
        <TextInput
          style={[styles.textInput, { color: colors.foreground }, isDesktop && styles.textInputDesktop]}
          placeholder={mode === "encode" ? "Type your secret message..." : "Paste the ciphertext to decode..."}
          placeholderTextColor={colors.mutedForeground}
          value={inputText}
          onChangeText={handleTextChange}
          multiline
          textAlignVertical="top"
          autoCorrect={false}
          autoCapitalize="none"
        />
        <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{inputText.length} chars</Text>
      </View>

      {apiError.length > 0 && (
        <View style={[styles.errorBanner, { backgroundColor: colors.card, borderColor: colors.destructive }]}>
          <Feather name="alert-circle" size={14} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.destructive }]}>{apiError}</Text>
        </View>
      )}

      {output.length > 0 && mode === "encode" && (
        <View style={[styles.outputContainer, { backgroundColor: colors.secondary, borderColor: colors.primary }]}>
          <View style={styles.outputHeader}>
            <Text style={[styles.sectionLabel, { color: colors.primary }]}>CIPHERTEXT</Text>
            <Animated.View style={{ transform: [{ scale: copyAnim }] }}>
              <TouchableOpacity
                onPress={handleCopy} activeOpacity={0.7}
                style={[styles.copyButton, { backgroundColor: copied ? colors.primary : colors.card, borderColor: copied ? colors.primary : colors.border }]}
              >
                <Feather name={copied ? "check" : "copy"} size={14} color={copied ? colors.primaryForeground : colors.mutedForeground} />
                <Text style={[styles.copyText, { color: copied ? colors.primaryForeground : colors.mutedForeground }]}>{copied ? "Copied!" : "Copy"}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
          <Text style={[styles.outputText, { color: colors.foreground }, isDesktop && styles.outputTextDesktop]} selectable>{output}</Text>
        </View>
      )}

      {output.length > 0 && mode === "decode" && decodePassword && (
        <DecodeUnlockCard output={output} onUnlock={handleUnlockAttempt} isUnlocked={isUnlocked} onLock={() => { setIsUnlocked(false); setCopied(false); }} onCopy={handleCopy} copied={copied} />
      )}

      {inputText.length === 0 && !apiError && (
        <View style={[styles.hintContainer, { borderColor: colors.border }]}>
          <Feather name="info" size={14} color={colors.mutedForeground} />
          <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
            {mode === "decode" ? "Enter a ciphertext above, then enter the password to reveal the decoded message." : "The default shift of 3 is how Julius Caesar encoded his messages."}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SetPasswordModal visible={showPasswordModal} onConfirm={handlePasswordSet} onCancel={() => setShowPasswordModal(false)} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View
          style={[
            styles.pageContainer,
            {
              paddingTop: topPad + 16,
              paddingBottom: bottomPad + 24,
              paddingHorizontal: isDesktop ? 48 : 20,
            },
          ]}
        >
          {isDesktop ? (
            <View style={styles.desktopWrapper}>
              {headerBlock}
              <View style={styles.desktopColumns}>
                <View style={styles.desktopLeft}>
                  <CipherWheel shift={shift} isDesktop />
                  {controlsBlock}
                </View>
                <View style={[styles.desktopDivider, { backgroundColor: colors.border }]} />
                <View style={styles.desktopRight}>
                  {ioBlock}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.mobileWrapper}>
              {headerBlock}
              <CipherWheel shift={shift} />
              {controlsBlock}
              {ioBlock}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  pageContainer: {
    flexGrow: 1,
  },

  desktopWrapper: {
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
    gap: 28,
  },
  desktopColumns: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 0,
  },
  desktopLeft: {
    flex: 4,
    paddingRight: 36,
    gap: 20,
    alignItems: "center",
  },
  desktopDivider: {
    width: 1,
    alignSelf: "stretch",
  },
  desktopRight: {
    flex: 5,
    paddingLeft: 36,
  },

  mobileWrapper: {
    gap: 16,
  },

  header: {
    alignItems: "center",
    gap: 6,
  },
  headerDesktop: {
    paddingBottom: 4,
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    letterSpacing: 8,
  },
  titleDesktop: {
    fontSize: 44,
    letterSpacing: 14,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 4,
  },
  subtitleDesktop: {
    fontSize: 13,
    letterSpacing: 6,
  },
  flaskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  flaskBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },

  controlsBlock: { gap: 16 },
  controlsBlockDesktop: { width: "100%", gap: 20 },

  ioBlock: { gap: 16 },

  passwordBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  passwordBadgeText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular" },
  changePassText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  sectionLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  inputContainer: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  inputHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  inputHeaderRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  textInput: { fontSize: 15, fontFamily: "Inter_400Regular", minHeight: 100, lineHeight: 22 },
  textInputDesktop: { minHeight: 150, fontSize: 16, lineHeight: 26 },
  charCount: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "right" },

  errorBanner: { flexDirection: "row", gap: 8, alignItems: "center", borderWidth: 1, borderRadius: 10, padding: 12 },
  errorText: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium" },

  outputContainer: { borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 10 },
  outputHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  copyButton: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  copyText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  outputText: { fontSize: 15, fontFamily: "Inter_500Medium", lineHeight: 22 },
  outputTextDesktop: { fontSize: 16, lineHeight: 26 },

  hintContainer: { flexDirection: "row", gap: 8, alignItems: "flex-start", borderWidth: 1, borderRadius: 10, borderStyle: "dashed", padding: 12 },
  hintText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
