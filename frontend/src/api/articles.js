import axios from 'axios';

const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment 
  ? '' 
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000');

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/articles`,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all articles from the backend
 * @returns {Promise} Promise that resolves to articles array
 */
export const getAllArticles = async () => {
  try {
    const response = await api.get('/');
    // Backend returns { success: true, data: [...] }
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

/**
 * Fetch a single article by ID
 * @param {string|number} id - Article ID
 * @returns {Promise} Promise that resolves to article object
 */
export const getArticleById = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    // Backend returns { success: true, data: {...} }
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching article ${id}:`, error);
    throw error;
  }
};

