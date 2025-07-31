// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:5000',
  ENDPOINTS: {
    MESSAGE: '/api/message',
    QUIZ: '/api/quiz',
    QUIZ_ANSWERS: (id: string) => `/api/quiz/${id}/answers`,
    FETCH_QUIZ: (id: string) => `/api/quiz/${id}`,
    API_KEY: '/api/key'
  }
};

// Authentication state
let apiKey: string | null = null;

export const getApiKey = (): string | null => {
  return apiKey;
};

export const setApiKey = (key: string): void => {
  apiKey = key;
  // Store in localStorage for persistence
  localStorage.setItem('qura_api_key', key);
};

export const loadApiKeyFromStorage = (): string | null => {
  const stored = localStorage.getItem('qura_api_key');
  if (stored) {
    apiKey = stored;
  }
  return stored;
};

export const clearApiKey = (): void => {
  apiKey = null;
  localStorage.removeItem('qura_api_key');
};

// Helper function to create authenticated headers
export const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  
  return headers;
}; 