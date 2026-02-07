// Movie types based on the database format
export interface Actor {
  _id: string;
  actorId: string;
  name: string;
}

export interface MovieType {
  _id: string;
  typeName: string;
}

export interface UserReview {
  _id: string;
  userId: string;
  score: number;
  comment: string;
  reviewDate: string;
}

export interface Movie {
  _id: string;
  actors: Actor[];
  content: string;
  director: string;
  duration: number;
  fromDate: string;
  toDate: string;
  movieProductionCompany: string;
  versionMovieEnglish: string;
  versionMovieVn: string;
  largeImage: string;
  smallImage: string;
  trailerUrl: string;
  releaseDate: string;
  keywords: string[];
  movieTypes: MovieType[];
  format: string[];
  language: string;
  subtitles: string[];
  rating: string;
  userReviews: UserReview[];
  status: string;
  nation: string;
  embedUrl: string;
}

export interface MovieResponse {
  success: boolean;
  count: number;
  data: Movie[];
} 