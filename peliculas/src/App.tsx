import { useState, useEffect } from "react"; 
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSearch } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function Home() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genres, setGenres] = useState({});
  const [actors, setActors] = useState({});
  const API_KEY = "c144cee3268c94c83ad046b6533644c8";
  const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`;
  const GENRES_URL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=es`;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setMovies(data.results);

        // Obtener actores para cada película
        const actorsData = {};
        for (const movie of data.results) {
          const CAST_URL = `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${API_KEY}`;
          const castResponse = await fetch(CAST_URL);
          const castData = await castResponse.json();
          actorsData[movie.id] = castData.cast.map((actor) => actor.name.toLowerCase());
        }
        setActors(actorsData);
      } catch (error) {
        console.error("Error al obtener las películas:", error);
      }
    };

    const fetchGenres = async () => {
      try {
        const response = await fetch(GENRES_URL);
        const data = await response.json();
        const genreMap = {};
        data.genres.forEach((genre) => {
          genreMap[genre.id] = genre.name.toLowerCase();
        });
        setGenres(genreMap);
      } catch (error) {
        console.error("Error al obtener los géneros:", error);
      }
    };

    fetchMovies();
    fetchGenres();
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value.trimStart();
    setSearchTerm(value.toLowerCase());
  };

  const filteredMovies = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(searchTerm) ||
      movie.genre_ids.some((id) => genres[id]?.includes(searchTerm)) ||
      (actors[movie.id] && actors[movie.id].some((actor) => actor.includes(searchTerm)))
  );

  return (
    <div className="container-fluid">
      <h1 className="text-center my-4">Películas Populares</h1>
      <div className="search-bar mb-4 d-flex align-items-center justify-content-center">
        <FontAwesomeIcon icon={faSearch} className="search-icon me-2" />
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por título, género o actor"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <div className="row g-4 movie-list">
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => (
            <div key={movie.id} className="col-6 col-md-3 col-lg-2">
              <div className="card movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
                <div className="image-container">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    className="card-img-top"
                    alt={movie.title}
                  />
                  <div className="title-overlay">
                    <h5 className="movie-title">{movie.title}</h5>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="loading-container">
            <div className="hourglass"></div>
            <p>No se encontraron películas.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const navigate = useNavigate();
  const API_URL = `https://api.themoviedb.org/3/movie/${id}?api_key=c144cee3268c94c83ad046b6533644c8&language=es`;
  const CAST_URL = `https://api.themoviedb.org/3/movie/${id}/credits?api_key=c144cee3268c94c83ad046b6533644c8`;

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

    const fetchCast = async () => {
      try {
        const response = await fetch(CAST_URL);
        const data = await response.json();
        setCast(data.cast.slice(0, 5));
      } catch (error) {
        console.error("Error al obtener los actores:", error);
      }
    };

    fetchMovie();
    fetchCast();
  }, [id]);

  if (!movie) return <p>Cargando detalles...</p>;

  return (
    <div className="container movie-details">
      <button className="btn btn-secondary mb-4" onClick={() => navigate("/")}> <FontAwesomeIcon icon={faArrowLeft} /> Regresar </button>
      <div className="row align-items-center">
        <div className="col-md-4">
          <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} className="img-fluid" alt={movie.title} />
        </div>
        <div className="col-md-8">
          <h1>{movie.title}</h1>
          <p>{movie.overview}</p>
          <p><strong>Fecha de estreno:</strong> {movie.release_date}</p>
          <p><strong>Puntuación:</strong> ⭐ {movie.vote_average}</p>
          <h4>Reparto Principal:</h4>
          <ul>
            {cast.map((actor) => (
              <li key={actor.id}>{actor.name} como {actor.character}</li>
            ))}
          </ul>
        </div>
      </div>
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