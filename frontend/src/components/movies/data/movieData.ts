// components/showingmovies/data/movieData.ts

/**
 * Interface định nghĩa cấu trúc dữ liệu của một bộ phim
 */
export interface Movie {
  id: number;
  versionMovieEnglish: string;
  largeImage: string;
  score: number;
  rating: string;
  status: string;
  movieTypes: string[] | string;
  nation: string[] | string;
  format: string[] | string;
  embedUrl: string;
}

/**
 * Danh sách các bộ phim đang chiếu
 * Dữ liệu mẫu cho trang web rạp chiếu phim
 */
export const movies: Movie[] = [
  {
    id: 1,
    versionMovieEnglish: "Wicked",

    largeImage: "https://th.bing.com/th/id/R.b35326aedf52f1d444de73b1e4bbe334?rik=2cJZ7dQTYky4hw&riu=http%3a%2f%2fwww.beautifulballad.org%2fwp-content%2fuploads%2f2024%2f09%2f457623836_1038495041281378_7108302270558388978_n.jpg&ehk=eoyAakywpFUZn7XNN4Yrnc10KE9ZcswhQhfyOas91P0%3d&risl=&pid=ImgRaw&r=0",
    embedUrl: "https://www.youtube.com/watch?v=F1n0I6h3s3I",
    movieTypes: ["Musical", "Fantasy"],
    format: ["2D", "IMAX"],
    nation: "USA",
    rating: "T13",
    score: 9,
    status: "showing"
  },

  {
    id: 2,
    versionMovieEnglish: "Mufasa: The Lion King",

    largeImage: "https://4kwallpapers.com/images/wallpapers/mufasa-the-lion-king-2024-movies-disney-5k-1290x2796-8781.jpg",
    embedUrl: "https://www.youtube.com/watch?v=xhbl2kM9w3Y",
    movieTypes: ["Animation", "Adventure"],
    format: ["2D", "3D"],
    nation: "USA",
    rating: "  N/A",
    score: 6,
    status: "showing"
  },





  {
    id: 3,
    versionMovieEnglish: "Holy Night: Demon Hunters",

    largeImage: "https://webservice.mymovies.dk/Posters/3f56a9b2-3a45-4ca8-811f-41c6b77a1bd2.jpg",
    embedUrl: "https://www.youtube.com/embed/2NmxGfHMuu0?si=B4OJtJuFMkTfFR5C",
    movieTypes: ["Action", "Fantasy", "Horror"],
    format: ["2D"],
    nation: "Korea",
    rating: "T16",
    score: 6,
    status: "showing"
  },




  {
    id: 4,
    versionMovieEnglish: "Batman Begins",

    largeImage: "https://m.media-amazon.com/images/M/MV5BOTY4YjI2N2MtYmFlMC00ZjcyLTg3YjEtMDQyM2ZjYzQ5YWFkXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
    embedUrl: "https://www.youtube.com/embed/vak9ZLfhGnQ?si=8DrAPWscBNhQVEP2",
    movieTypes: ["Action", "Crime", "Drama"],
    format: ["2D"],
    nation: "USA",
    rating: "T13",
    score: 8,
    status: "showing"
  },



  {
    id: 5,
    versionMovieEnglish: "Batman",

    largeImage: "https://m.media-amazon.com/images/M/MV5BYzZmZWViM2EtNzhlMi00NzBlLWE0MWEtZDFjMjk3YjIyNTBhXkEyXkFqcGc@._V1_SX600.jpg",
    embedUrl: "https://www.youtube.com/embed/dgC9Q0uhX70?si=TKVj5WEnDktRvuXL",
    movieTypes: ["Action", "Adventure"],
    format: ["2D"],
    nation: "USA",
    rating: "T13",
    score: 8,
    status: "showing"
  },



  {
    id: 6,
    versionMovieEnglish: "The Lego Batman Movie",

    largeImage: "https://m.media-amazon.com/images/M/MV5BMTcyNTEyOTY0M15BMl5BanBnXkFtZTgwOTAyNzU3MDI@._V1_SX600.jpg",
    embedUrl: "https://www.youtube.com/embed/h6DOpfJzmo0?si=TIFHbw0OGjVEI9nu",
    movieTypes: ["Animation", "Action", "Adventure"],
    format: ["2D", "3D"],
    nation: "USA",
    rating: "T7",
    score: 7,
    status: "showing"
  },




  {
    id: 7,
    versionMovieEnglish: "Doraemon: Nobita and the New Steel Troops: ~Winged Angels~",

    largeImage: "https://images.plex.tv/photo?size=medium-240&scale=2&url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Foriginal%2F57ighjFjXpRwg7VeQ1GN6nf4OZH.jpg",
    embedUrl: "https://www.youtube.com/embed/4KzYsl6ucL8?si=teET5fVcsVZVa9nE",
    movieTypes: ["Animation", "Action", "Adventure"],
    format: ["2D"],
    nation: "Japan",
    rating: "  N/A",
    score: 8,
    status: "showing"

  },




  {
    id: 8,
    versionMovieEnglish: "Doraemon the Movie: Nobita's New Dinosaur",

    largeImage: "https://m.media-amazon.com/images/M/MV5BNGQwZTQ2ODItNGE2Ni00OGE5LThmOWUtMjI1NzQ2MzE4YmU5XkEyXkFqcGc@._V1_.jpg",
    embedUrl: "https://www.youtube.com/embed/XTkslNjdyy0?si=XcjordxBt4wMcaQ9",
    movieTypes: ["Animation", "Adventure", "Comedy"],
    format: ["2D"],
    nation: "Japan",
    rating: "  N/A",
    score: 7,
    status: "showing"
  },





  {
    id: 9,
    versionMovieEnglish: "Doraemon the Movie: Nobita's Earth Symphony",

    largeImage: "https://m.media-amazon.com/images/M/MV5BNTc5NDZjN2ItZTgyYi00YzkyLWEyOTktOTExMTNlNmRjZjVmXkEyXkFqcGc@._V1_SX600.jpg",
    embedUrl: "https://www.youtube.com/embed/hGPo-vZEKiM?si=h88XKKUlSiQnoriY",
    movieTypes: ["Animation", "Adventure", "Comedy"],
    format: ["2D"],
    nation: "Japan",
    rating: "  N/A",
    score: 6,
    status: "showing"
  },





  {
    id: 10,
    versionMovieEnglish: "Spiderman the Verse",

    largeImage: "https://cdn.marvel.com/u/prod/marvel/i/mg/7/70/5d8a2bebabaad/clean.jpg",
    embedUrl: "https://www.youtube.com/embed/g4Hbz2jLxvQ?si=Xd5ce-G-IJakcAy7",
    movieTypes: ["Action"],
    format: ["2D"],
    nation: "USA",
    rating: "T13",
    score: 5,
    status: "showing"
  },


  {
    id: 11,
    versionMovieEnglish: "The Amazing Spider-Man 2 Webb Cut",

    largeImage: "https://images.plex.tv/photo?size=medium-240&scale=2&url=https%3A%2F%2Fm.media-amazon.com%2Fimages%2FM%2FMV5BNzI0MmQyMzYtZDAzNi00ZWZiLWFjMTgtNzQwOTRjYTFlM2Y3XkEyXkFqcGc%40._V1_.jpg",
    embedUrl: "https://www.youtube.com/embed/wpsfBfTAoKM?si=4FoZJysaNj1Kj-2U",
    movieTypes: ["Sci-Fi"],
    format: ["2D"],
    nation: "Spanish",
    rating: "N/A",
    score: 5,
    status: "showing"
  },



  {
    id: 12,
    versionMovieEnglish: "Captain Marvel",

    largeImage: "https://m.media-amazon.com/images/M/MV5BZDI1NGU2ODAtNzBiNy00MWY5LWIyMGEtZjUxZjUwZmZiNjBlXkEyXkFqcGc@._V1_SX600.jpg",
    embedUrl: "https://www.youtube.com/embed/Z1BCujX3pw8?si=XfTgVo0h6MNHPEKC",
    movieTypes: ["Action", "Adventure", "Sci-Fi"],
    format: ["2D", "3D", "IMAX"],
    nation: "USA",
    rating: "T13",
    score: 7,
    status: "showing"
  },



  {
    id: 13,
    versionMovieEnglish: "Iron Man",

    largeImage: "https://m.media-amazon.com/images/M/MV5BMTczNTI2ODUwOF5BMl5BanBnXkFtZTcwMTU0NTIzMw@@._V1_SX600.jpg",
    embedUrl: "https://www.youtube.com/embed/8ugaeA-nMTc?si=Yuom4VrXV9nF28Mq", movieTypes: ["Action", "Adventure", "Sci-Fi"],
    format: ["2D", "IMAX"],
    nation: "USA",
    rating: "T13",
    score: 8,
    status: "showing"
  },



  {
    id: 14,
    versionMovieEnglish: "Iron Man 2",

    largeImage: "https://m.media-amazon.com/images/M/MV5BYWYyOGQzOGYtMGQ1My00ZWYxLTgzZjktZWYzN2IwYjkxYzM0XkEyXkFqcGc@._V1_SX600.jpg",
    embedUrl: "https://www.youtube.com/embed/wKtcmiifycU?si=68-5o8BcpqXNw1-O",
    movieTypes: ["Action", "Sci-Fi"],
    format: ["2D", "IMAX"],
    nation: "USA",
    rating: "T13",
    score: 7,
    status: "showing"
  },



  {
    id: 15,
    versionMovieEnglish: "Iron Man 3",

    largeImage: "https://m.media-amazon.com/images/M/MV5BMjIzMzAzMjQyM15BMl5BanBnXkFtZTcwNzM2NjcyOQ@@._V1_SX600.jpg",
    embedUrl: "https://www.youtube.com/embed/Ke1Y3P9D0Bc?si=hiET5pE62wKn1ydc",
    movieTypes: ["Action", "Adventure", "Sci-Fi"],
    format: ["2D", "IMAX 3D"],
    nation: "USA",
    rating: "T13",
    score: 8,
    status: "showing"
  },


  {
    id: 16,
    versionMovieEnglish: "The Last: Naruto the Movie",

    largeImage: "https://m.media-amazon.com/images/M/MV5BMjk1NzA4Njg4Ml5BMl5BanBnXkFtZTgwMDgxODQ5MzE@._V1_SX600.jpg",
    embedUrl: "https://www.youtube.com/embed/tA3yE4_t6SY?si=LI9hP0lIijUUKoIn",
    movieTypes: ["Animation", "Action", "Adventure"],
    format: ["2D"],
    nation: "Japan",
    rating: "T14",
    score: 9,
    status: "showing"
  },


  {
    id: 17,
    versionMovieEnglish: "Boruto: Naruto the Movie",

    largeImage: "https://m.media-amazon.com/images/M/MV5BY2Y0NGE5YjgtNzFlZS00NzJjLThlMDQtZDZhNjQxNTc2NmUwXkEyXkFqcGc@._V1_SX600.jpg",
    embedUrl: "https://www.youtube.com/embed/Qyonn5Vbg7s?si=5XF_S0lL4rcvJp7w",
    movieTypes: ["Animation", "Action", "Adventure"],
    format: ["2D"],
    nation: "Japan",
    rating: "T13",
    score: 8,
    status: "comingsoon"
  },




  {
    id: 18,
    versionMovieEnglish: "Fairy Tail: Dragon Cry",

    largeImage: "https://m.media-amazon.com/images/M/MV5BMWFmMWQwYjktN2Y3Yi00OThjLWJlZWQtZGQyNzY0YmMzODI2XkEyXkFqcGc@._V1_SX600.jpg",
    embedUrl: "https://www.youtube.com/embed/9Yk5cBOTcZ8?si=XmdoGw9Q1hZSSF8B",
    movieTypes: ["Animation", "Action", "Adventure"],
    format: ["2D"],
    nation: "Japan",
    rating: "T14",
    score: 7,
    status: "comingsoon"
  },


  {
    id: 19,
    versionMovieEnglish: "Fairy Tail: The Phoenix Priestess",

    largeImage: "https://m.media-amazon.com/images/M/MV5BODU4ZjM2MmYtMGQ4ZC00NjM1LWJiM2UtYmZhNzIwN2RkYzQyXkEyXkFqcGc@._V1_SX600.jpg",
    embedUrl: "https://www.youtube.com/embed/nPv741YW3tk?si=mdm4LZVN_OE_0do6",
    movieTypes: ["Animation", "Action", "Adventure"],
    format: ["2D"],
    nation: "Japan",
    rating: "T14",
    score: 7,
    status: "comingsoon"
  },




  {
    id: 20,
    versionMovieEnglish: "Lilo & Stitch",

    largeImage: "https://m.media-amazon.com/images/M/MV5BYmFmZjM1ZTEtYzQ5ZS00MTRmLTkzMDktYWMxNTg2NGE3YjY4XkEyXkFqcGc@._V1_SX600.jpg",
    embedUrl: "https://www.youtube.com/embed/VWqJifMMgZE?si=5jOnx9ER2azzIio_",
    movieTypes: ["Action", "Adventure", "Comedy"],
    format: ["2D", "3D"],
    nation: "USA",
    rating: "T13",
    score: 7,
    status: "comingsoon"
  },




  {
    id: 21,
    versionMovieEnglish: "Doraemon: Nobita's Art World Tales",

    largeImage: "https://upload.wikimedia.org/wikipedia/vi/5/5d/Doraemon_Movie_2025_Poster.jpg",
    embedUrl: "https://www.youtube.com/embed/1b2sSI51Edw?si=OA9YuwMhwnb0YxG-",
    movieTypes: ["Animation", "Adventure", "Comedy"],
    format: ["2D"],
    nation: "Japan",
    rating: "N/A",
    score: 8,
    status: "comingsoon"
  },



  {
    id: 22,
    versionMovieEnglish: "How to Train Your Dragon",

    largeImage: "https://m.media-amazon.com/images/M/MV5BODA5Y2M0NjctNWQzMy00ODRhLWE0MzUtYmE1YTAzZjYyYmQyXkEyXkFqcGc@._V1_SX600.jpg",
    embedUrl: "https://www.youtube.com/embed/u8YM5LR2RyM?si=Hnx5Yvo4seK2YeQI",
    movieTypes: ["Action", "Adventure", "Comedy"],
    format: ["2D", "3D", "IMAX"],
    nation: "USA",
    rating: "T13",
    score: 9,
    status: "comingsoon"
  },




  {
    id: 23,
    versionMovieEnglish: "One Piece Film: Red",

    largeImage: "https://m.media-amazon.com/images/M/MV5BNTdjY2YxYTQtNjIzYy00ZDczLThhNTUtNmY2ZWNkZjZiMTYzXkEyXkFqcGc@._V1_SX600.jpg",
    embedUrl: "https://www.youtube.com/embed/r0FvP_Ui-xY?si=Pw31qCS6xXUnmEE8",
    movieTypes: ["Animation", "Action", "Adventure"],
    format: ["2D", "3D"],
    nation: "Japan",
    rating: "T13",
    score: 8,
    status: "comingsoon"
  },





  {
    id: 24,
    versionMovieEnglish: "One Piece: Stampede",

    largeImage: "https://m.media-amazon.com/images/M/MV5BY2FlYzRmZGMtM2Y5OC00NzFhLTgyNDAtZDk1YjdkZTlmMjE3XkEyXkFqcGc@._V1_SX600.jpg",
    embedUrl: "https://www.youtube.com/embed/o-PmHDtO2DQ?si=qszbIiXd2s3RTYyo",
    movieTypes: ["Animation", "Action", "Adventure"],
    format: ["2D"],
    nation: "Japan",
    rating: "T14",
    score: 9,
    status: "comingsoon"
  },




];