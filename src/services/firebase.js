import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBFmhd8CD4TLiwaTs6TvLkPXCs5oisz-f4",
  authDomain: "mise-dda5d.firebaseapp.com",
  projectId: "mise-dda5d",
  storageBucket: "mise-dda5d.firebasestorage.app",
  messagingSenderId: "905477331628",
  appId: "1:905477331628:web:1e781f4ea630c75586dd09",
  measurementId: "G-3LLWJJZ13C"
};

// Prevent duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export const saveRecipe = async (recipe) => {
  try {
    const docRef = await addDoc(collection(db, 'recipes'), {
      ...recipe,
      savedAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving recipe:', error);
    return { success: false, error };
  }
};

export const getSavedRecipes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'recipes'));
    const recipes = [];
    querySnapshot.forEach((d) => {
      recipes.push({ id: d.id, ...d.data() });
    });
    recipes.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    return recipes;
  } catch (error) {
    console.error('Error getting recipes:', error);
    return [];
  }
};

export const deleteRecipe = async (recipeId) => {
  try {
    await deleteDoc(doc(db, 'recipes', recipeId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return { success: false, error };
  }
};

export { db };
