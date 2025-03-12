import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";
import "./App.css";

function Home() {
  const [movies, setMovies] = useState([]);
  const API_URL = "https://api.themoviedb.org/3/movie/popular?api_key=c144cee3268c94c83ad046b6533644c8";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setMovies(data.results);
      } catch (error) {
        console.error("Error al obtener las películas:", error);
      }
    };
    fetchMovies();
  }, []);

  return (
    <div className="container">
      <h1>Películas Populares</h1>
      <div className="movies-grid">
        {movies.length > 0 ? (
          movies.map((movie) => (
            <div key={movie.id} className="movie-card">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                onClick={() => navigate(`/movie/${movie.id}`)}
                style={{ cursor: "pointer" }}
              />
              <h2>{movie.title}</h2>
              <p><strong>Puntuación:</strong> ⭐ {movie.vote_average}</p>
              <p><strong>Fecha de estreno:</strong> {movie.release_date}</p>
            </div>
          ))
        ) : (
          <p>Cargando películas...</p>
        )}
      </div>
    </div>
  );
}

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const API_URL = `https://api.themoviedb.org/3/movie/${id}?api_key=c144cee3268c94c83ad046b6533644c8`;

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error("Error al obtener los detalles de la película:", error);
      }
    };
    fetchMovie();
  }, [id]);

  if (!movie) return <p>Cargando detalles...</p>;

  return (
    <div className="movie-details">
      <h1>{movie.title}</h1>
      <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
      <p>{movie.overview}</p>
      <p><strong>Fecha de estreno:</strong> {movie.release_date}</p>
      <p><strong>Puntuación:</strong> ⭐ {movie.vote_average}</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
      </Routes>
    </Router>
  );
}

export default App;