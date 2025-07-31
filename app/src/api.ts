import { API_CONFIG, getAuthHeaders, setApiKey, loadApiKeyFromStorage } from './config';

class ApiService {
  private async ensureAuthenticated(): Promise<void> {

    let apiKey = loadApiKeyFromStorage();
    
    if (!apiKey) {
      // Fetch API key from backend
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.API_KEY}`);
        if (response.ok) {
          const data = await response.json();
          apiKey = data.api_key;
          setApiKey(apiKey);
        } else {
          throw new Error('Failed to get API key');
        }
      } catch (error) {
        console.error('Authentication failed:', error);
        throw new Error('Unable to authenticate with backend');
      }
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    await this.ensureAuthenticated();
    
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers = getAuthHeaders();
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    const response = await fetch(url, requestOptions);
    
    if (response.status === 401) {
      // Clear stored API key and retry once
      localStorage.removeItem('qura_api_key');
      await this.ensureAuthenticated();
      return fetch(url, requestOptions);
    }
    
    return response;
  }

  async getMessage(): Promise<{ message: string }> {
    const response = await this.makeRequest(API_CONFIG.ENDPOINTS.MESSAGE);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async createQuiz(quizData: {
    field: string;
    topic: string;
    numQuestions: number;
    showGrade: boolean;
  }): Promise<{ id: string; quiz: any[] }> {
    const response = await this.makeRequest(API_CONFIG.ENDPOINTS.QUIZ, {
      method: 'POST',
      body: JSON.stringify(quizData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async fetchQuiz(quizId: string): Promise<any[]> {
    const response = await this.makeRequest(API_CONFIG.ENDPOINTS.FETCH_QUIZ(quizId));
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async submitAnswers(quizId: string, answers: number[]): Promise<any> {
    const response = await this.makeRequest(API_CONFIG.ENDPOINTS.QUIZ_ANSWERS(quizId), {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService(); 