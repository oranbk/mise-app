import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import { parseRecipeFromText, parseRecipeFromImageBase64 } from '../services/api';
import { showInterstitialBefore } from '../services/admob';

export default function HomeScreen({ navigation }) {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('text');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Navigate to recipe — show interstitial BEFORE loading
  const goToRecipe = (recipe) => {
    showInterstitialBefore(() => {
      navigation.navigate('RecipeView', { recipe });
    });
  };

  const handleParseText = async () => {
    if (!inputText.trim()) {
      Alert.alert('Empty', 'Please paste a recipe first.');
      return;
    }
    setLoading(true);
    setLoadingMessage('Reading your recipe...');
    try {
      const recipe = await parseRecipeFromText(inputText);
      goToRecipe(recipe);
    } catch (e) {
      Alert.alert('Error', 'Could not parse the recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      await parseImage(result.assets[0]);
    }
  };

  const handleGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library access is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      await parseImage(result.assets[0]);
    }
  };

  const parseImage = async (asset) => {
    setLoading(true);
    setLoadingMessage('Scanning recipe from image...');
    try {
      let base64 = asset.base64;
      if (!base64) {
        base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      const recipe = await parseRecipeFromImageBase64(dataUrl);
      goToRecipe(recipe);
    } catch (e) {
      Alert.alert('Error', 'Could not read the recipe from this image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Logo / Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>M</Text>
        <Text style={styles.subtitle}>Your hands-free cooking assistant</Text>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabs}>
        {['text', 'image'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'text' ? '📝 Paste Recipe' : '📷 Scan Image'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Text input */}
      {activeTab === 'text' && (
        <View>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Paste your recipe here..."
            placeholderTextColor="#555"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity
            style={[styles.btn, !inputText.trim() && styles.btnDisabled]}
            onPress={handleParseText}
            disabled={!inputText.trim() || loading}
          >
            <Text style={styles.btnText}>Parse Recipe →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Image input */}
      {activeTab === 'image' && (
        <View style={styles.imageButtons}>
          <TouchableOpacity style={styles.btn} onPress={handleCamera}>
            <Text style={styles.btnText}>📷 Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={handleGallery}>
            <Text style={styles.btnTextSecondary}>🖼 Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#E8C547" />
          <Text style={styles.loadingText}>{loadingMessage}</Text>
        </View>
      )}

      {/* Saved recipes shortcut */}
      <TouchableOpacity
        style={styles.savedBtn}
        onPress={() => navigation.navigate('SavedRecipes')}
      >
        <Text style={styles.savedBtnText}>📚 Saved Recipes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 24, paddingBottom: 60 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  logo: { fontSize: 64, fontWeight: 'bold', color: '#E8C547' },
  subtitle: { color: '#888', fontSize: 14, marginTop: 4 },
  tabs: { flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 12, marginBottom: 24, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#E8C547' },
  tabText: { color: '#888', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#0a0a0a' },
  textInput: {
    backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16,
    color: '#fff', fontSize: 15, minHeight: 160, textAlignVertical: 'top',
    borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 16,
  },
  btn: { backgroundColor: '#E8C547', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#0a0a0a', fontWeight: 'bold', fontSize: 16 },
  btnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E8C547' },
  btnTextSecondary: { color: '#E8C547', fontWeight: 'bold', fontSize: 16 },
  imageButtons: { gap: 12 },
  loadingBox: { alignItems: 'center', padding: 32 },
  loadingText: { color: '#E8C547', marginTop: 12, fontSize: 15 },
  savedBtn: { marginTop: 32, alignItems: 'center', padding: 12 },
  savedBtnText: { color: '#666', fontSize: 14 },
});
