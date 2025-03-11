import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [movies, setMovies] = useState([]);
  const API_URL =
    "https://api.themoviedb.org/3/movie/popular?api_key=c144cee3268c94c83ad046b6533644c8";

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => setMovies(data.results))
      .catch((error) => console.error("Error al obtener las películas:", error));
  }, []);

  return (
    <div className="container">
      <h1>Películas </h1>
      <div className="movies-grid">
        {movies.length > 0 ? (
          movies.map((movie) => (
            <div key={movie.id} className="movie-card">

              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
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

export default App;
