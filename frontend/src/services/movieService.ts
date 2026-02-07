import type { Movie, MovieResponse } from '../types/movie';

const API_BASE_URL = 'http://localhost:3000/api'; // Update this to match your backend URL

class MovieService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Get all movies
  async getMovies(): Promise<MovieResponse> {
    return this.request<MovieResponse>('/movies');
  }

  // Get movie by ID
  async getMovieById(id: string): Promise<Movie> {
    const response = await this.request<{ success: boolean; data: Movie }>(`/movies/${id}`);
    return response.data;
  }

  // Get movies by status (showing, upcoming, etc.)
  async getMoviesByStatus(status: string): Promise<MovieResponse> {
    return this.request<MovieResponse>(`/movies?status=${status}`);
  }

  // Search movies
  async searchMovies(query: string): Promise<MovieResponse> {
    return this.request<MovieResponse>(`/movies/search?q=${encodeURIComponent(query)}`);
  }
}

export const movieService = new MovieService(); 