import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Platform, SafeAreaView,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { chatWithAI, textToSpeech } from '../services/api';

const ELEVEN_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Rachel — English

export default function VoiceModeScreen({ route, navigation }) {
  const { recipe } = route.params;

  const [currentStep, setCurrentStep] = useState(-1); // -1 = intro
  const [transcript, setTranscript] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [messages, setMessages] = useState([]);

  const soundRef = useRef(null);
  const speakingRef = useRef(false);
  const listeningRef = useRef(false);

  const totalSteps = recipe.steps?.length || 0;

  // Build system prompt
  const systemPrompt = `You are a hands-free cooking assistant. The user is cooking this recipe: "${recipe.title}".
Steps:
${recipe.steps?.map((s, i) => `${i + 1}. ${s}`).join('\n')}
Ingredients: ${recipe.ingredients?.join(', ')}
Guide the user step by step. Keep responses short and clear. Current step: ${currentStep + 1}/${totalSteps}.`;

  // ── TTS ────────────────────────────────────────────────────────────────────
  const speakText = useCallback(async (text) => {
    setSpeaking(true);
    speakingRef.current = true;
    stopListening();

    try {
      // Try ElevenLabs via proxy
      const audioUrl = await textToSpeech(text, ELEVEN_VOICE_ID);
      if (soundRef.current) { await soundRef.current.unloadAsync(); }
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      soundRef.current = sound;
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setSpeaking(false);
          speakingRef.current = false;
          startListening();
        }
      });
    } catch {
      // Fallback to expo-speech
      Speech.speak(text, {
        language: 'en-US',
        onDone: () => { setSpeaking(false); speakingRef.current = false; startListening(); },
        onError: () => { setSpeaking(false); speakingRef.current = false; },
      });
    }
  }, [currentStep]);

  // ── STT — expo-av recording ───────────────────────────────────────────────
  const recordingRef = useRef(null);

  const startListening = useCallback(async () => {
    if (speakingRef.current || listeningRef.current) return;
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      listeningRef.current = true;
      setMicActive(true);
    } catch (e) {}
  }, []);

  const stopListening = useCallback(async () => {
    if (!listeningRef.current) return;
    listeningRef.current = false;
    setMicActive(false);
    try {
      await recordingRef.current?.stopAndUnloadAsync();
    } catch (e) {}
  }, []);

  // ── AI Chat ───────────────────────────────────────────────────────────────
  const sendToAI = useCallback(async (userText) => {
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setTranscript('');
    try {
      const reply = await chatWithAI([
        { role: 'system', content: systemPrompt },
        ...newMessages,
      ]);
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      await speakText(reply);
    } catch (e) {
      await speakText("Sorry, I couldn't understand. Please try again.");
    }
  }, [messages, systemPrompt, speakText]);

  // ── Navigation controls ───────────────────────────────────────────────────
  const goToStep = useCallback(async (stepIndex) => {
    setCurrentStep(stepIndex);
    const stepText = stepIndex === -1
      ? `Let's make ${recipe.title}! Say "next" to start the first step, or ask me anything.`
      : stepIndex >= totalSteps
        ? "Great job! You've completed all the steps. Enjoy your meal! 🎉"
        : `Step ${stepIndex + 1}: ${recipe.steps[stepIndex]}`;
    await speakText(stepText);
  }, [recipe, totalSteps, speakText]);

  const handleNextStep = () => goToStep(Math.min(currentStep + 1, totalSteps));
  const handlePrevStep = () => goToStep(Math.max(currentStep - 1, -1));

  const handleBargeIn = async () => {
    // Stop audio
    if (soundRef.current) {
      try { await soundRef.current.stopAsync(); } catch (e) {}
    }
    Speech.stop();
    setSpeaking(false);
    speakingRef.current = false;
    setTimeout(() => startListening(), 400);
  };

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    goToStep(-1);
    return () => {
      Speech.stop();
      soundRef.current?.unloadAsync();
      stopListening();
    };
  }, []);

  const stepProgress = currentStep >= 0 ? `${currentStep + 1} / ${totalSteps}` : 'Intro';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{recipe.title}</Text>
        <Text style={styles.stepBadge}>{stepProgress}</Text>
      </View>

      {/* Current step display */}
      <ScrollView style={styles.stepContainer} contentContainerStyle={styles.stepContent}>
        {currentStep === -1 ? (
          <Text style={styles.stepText}>👨‍🍳 Ready to cook!</Text>
        ) : currentStep >= totalSteps ? (
          <Text style={styles.stepText}>🎉 All done!</Text>
        ) : (
          <>
            <Text style={styles.stepLabel}>Step {currentStep + 1}</Text>
            <Text style={styles.stepText}>{recipe.steps[currentStep]}</Text>
          </>
        )}

        {/* Transcript */}
        {transcript ? (
          <Text style={styles.transcript}>🎤 {transcript}</Text>
        ) : null}

        {/* Last AI message */}
        {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
          <View style={styles.aiMessage}>
            <Text style={styles.aiMessageText}>🤖 {messages[messages.length - 1].content}</Text>
          </View>
        )}
      </ScrollView>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Step navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={handlePrevStep} disabled={currentStep <= -1}>
            <Text style={styles.navBtnText}>← Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.micBtn, speaking && styles.micBtnSpeaking, micActive && styles.micBtnActive]}
            onPress={speaking ? handleBargeIn : startListening}
          >
            <Text style={styles.micBtnText}>{speaking ? '⏹ Stop' : micActive ? '🎤' : '🎤'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={handleNextStep} disabled={currentStep >= totalSteps}>
            <Text style={styles.navBtnText}>Next →</Text>
          </TouchableOpacity>
        </View>

        {/* Status */}
        <Text style={styles.status}>
          {speaking ? '🔊 Speaking...' : micActive ? '👂 Listening...' : '💤 Idle — tap mic'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' },
  backBtn: { marginRight: 12 },
  backText: { color: '#E8C547', fontSize: 15 },
  headerTitle: { flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 16 },
  stepBadge: { color: '#E8C547', fontSize: 13, backgroundColor: '#1a1a1a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  stepContainer: { flex: 1 },
  stepContent: { padding: 24 },
  stepLabel: { color: '#E8C547', fontSize: 13, fontWeight: '600', marginBottom: 10 },
  stepText: { color: '#fff', fontSize: 20, lineHeight: 32, fontWeight: '500' },
  transcript: { color: '#888', fontSize: 14, marginTop: 20, fontStyle: 'italic' },
  aiMessage: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginTop: 20, borderLeftWidth: 3, borderLeftColor: '#E8C547' },
  aiMessageText: { color: '#ddd', fontSize: 15, lineHeight: 22 },
  controls: { padding: 20, borderTopWidth: 1, borderTopColor: '#1f1f1f' },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { backgroundColor: '#1a1a1a', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 14 },
  navBtnText: { color: '#E8C547', fontWeight: '600', fontSize: 15 },
  micBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E8C547', alignItems: 'center', justifyContent: 'center' },
  micBtnSpeaking: { backgroundColor: '#ff4444' },
  micBtnActive: { backgroundColor: '#44aa44' },
  micBtnText: { fontSize: 28 },
  status: { textAlign: 'center', color: '#555', fontSize: 13 },
});
