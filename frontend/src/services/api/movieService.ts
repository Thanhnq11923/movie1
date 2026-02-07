import axios from "axios";
import type { Movie, MovieResponse } from "../../types/movie";

const apiUrl = "http://localhost:3000/api";

// Tự động thêm Authorization header nếu có token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const movieService = {
  getAllMovies: async (): Promise<MovieResponse> => {
    try {
      const response = await axios.get<MovieResponse>(`${apiUrl}/movies`);
      return response.data;
    } catch (error) {
      console.error("Error fetching movies:", error);
      throw error;
    }
  },
  addMovie: async (movie: Omit<Movie, "_id">) => {
    try {
      const response = await axios.post(`${apiUrl}/movies`, movie);
      return response.data;
    } catch (error) {
      console.error("Error adding movie:", error);
      throw error;
    }
  },
  updateMovie: async (id: string, movie: Partial<Movie>) => {
    try {
      const response = await axios.put(`${apiUrl}/movies/${id}`, movie);
      return response.data;
    } catch (error) {
      console.error("Error updating movie:", error);
      throw error;
    }
  },
  deleteMovie: async (id: string) => {
    try {
      const response = await axios.delete(`${apiUrl}/movies/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting movie:", error);
      throw error;
    }
  },
};
