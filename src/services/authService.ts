import { LoginCredentials, RegisterCredentials, User, AuthToken } from '@/types/auth';

// Use Railway production URL or fallback to local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                     import.meta.env.VITE_API_BASE_URL || 
                     'https://bookflip-backend.up.railway.app';

class AuthService {
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`Making request to: ${url}`);
    
    const token = localStorage.getItem('auth_token');
    
    // Fix headers type issue by using proper object construction
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add existing headers from options if they exist
    if (options?.headers) {
      Object.assign(headers, options.headers);
    }

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`API Error:`, errorData);
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
      }
      
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    const authData = await this.makeRequest<AuthToken>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Temporarily store token to get user data
    const oldToken = localStorage.getItem('auth_token');
    localStorage.setItem('auth_token', authData.access_token);

    try {
      const user = await this.getCurrentUser();
      return {
        token: authData.access_token,
        user,
      };
    } catch (error) {
      // Restore old token if user fetch fails
      if (oldToken) {
        localStorage.setItem('auth_token', oldToken);
      } else {
        localStorage.removeItem('auth_token');
      }
      throw error;
    }
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    console.log('Attempting to register with:', { email: credentials.email });
    return this.makeRequest<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.makeRequest<User>('/api/auth/me');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  removeToken(): void {
    localStorage.removeItem('auth_token');
  }
}

export const authService = new AuthService();
