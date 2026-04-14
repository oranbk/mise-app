import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showInterstitialAfter } from '../services/admob';

export default function RecipeViewScreen({ route, navigation }) {
  const { recipe } = route.params;
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Show interstitial BEFORE saving
    showInterstitialAfter(async () => {
      try {
        const existing = await AsyncStorage.getItem('saved_recipes');
        const recipes = existing ? JSON.parse(existing) : [];
        const newRecipe = { ...recipe, id: Date.now().toString(), savedAt: new Date().toISOString() };
        recipes.unshift(newRecipe);
        await AsyncStorage.setItem('saved_recipes', JSON.stringify(recipes));
        setSaved(true);
        Alert.alert('Saved!', `"${recipe.title}" has been saved.`);
      } catch (e) {
        Alert.alert('Error', 'Could not save recipe.');
      }
    });
  };

  const handleVoiceMode = () => {
    navigation.navigate('VoiceMode', { recipe });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${recipe.title}\n\nIngredients:\n${recipe.ingredients?.join('\n')}\n\nSteps:\n${recipe.steps?.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
        title: recipe.title,
      });
    } catch (e) {}
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title */}
      <Text style={styles.title}>{recipe.title}</Text>
      {recipe.description && <Text style={styles.description}>{recipe.description}</Text>}

      {/* Meta info */}
      <View style={styles.metaRow}>
        {recipe.prepTime && <View style={styles.metaItem}><Text style={styles.metaLabel}>Prep</Text><Text style={styles.metaValue}>{recipe.prepTime}</Text></View>}
        {recipe.cookTime && <View style={styles.metaItem}><Text style={styles.metaLabel}>Cook</Text><Text style={styles.metaValue}>{recipe.cookTime}</Text></View>}
        {recipe.servings && <View style={styles.metaItem}><Text style={styles.metaLabel}>Serves</Text><Text style={styles.metaValue}>{recipe.servings}</Text></View>}
      </View>

      {/* Voice Mode CTA */}
      <TouchableOpacity style={styles.voiceBtn} onPress={handleVoiceMode}>
        <Text style={styles.voiceBtnText}>🎙️ Start Cooking (Voice Mode)</Text>
      </TouchableOpacity>

      {/* Ingredients */}
      {recipe.ingredients?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((ing, i) => (
            <View key={i} style={styles.ingredientRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.ingredientText}>{ing}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Steps */}
      {recipe.steps?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{i + 1}</Text></View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, saved && styles.actionBtnSaved]} onPress={handleSave} disabled={saved}>
          <Text style={styles.actionBtnText}>{saved ? '✓ Saved' : '💾 Save Recipe'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={handleShare}>
          <Text style={styles.actionBtnTextSecondary}>↗ Share</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 24, paddingBottom: 60 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  description: { color: '#888', fontSize: 15, marginBottom: 16, lineHeight: 22 },
  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  metaItem: { backgroundColor: '#1a1a1a', borderRadius: 10, padding: 12, flex: 1, alignItems: 'center' },
  metaLabel: { color: '#666', fontSize: 11, marginBottom: 4 },
  metaValue: { color: '#E8C547', fontWeight: 'bold', fontSize: 14 },
  voiceBtn: { backgroundColor: '#E8C547', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 28 },
  voiceBtnText: { color: '#0a0a0a', fontWeight: 'bold', fontSize: 16 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#E8C547', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#1f1f1f', paddingBottom: 8 },
  ingredientRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
  bullet: { color: '#E8C547', marginRight: 10, marginTop: 2, fontSize: 16 },
  ingredientText: { color: '#ddd', fontSize: 15, flex: 1, lineHeight: 22 },
  stepRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E8C547', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2, flexShrink: 0 },
  stepNumberText: { color: '#0a0a0a', fontWeight: 'bold', fontSize: 13 },
  stepText: { color: '#ddd', fontSize: 15, flex: 1, lineHeight: 24 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionBtn: { flex: 1, backgroundColor: '#E8C547', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  actionBtnSaved: { backgroundColor: '#2a3a1a' },
  actionBtnText: { color: '#0a0a0a', fontWeight: 'bold', fontSize: 15 },
  actionBtnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E8C547' },
  actionBtnTextSecondary: { color: '#E8C547', fontWeight: 'bold', fontSize: 15 },
});
