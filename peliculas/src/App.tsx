import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSearch } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function Home() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value.trim() !== "" ? value : "");
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <h1 className="text-center my-4">Películas Populares</h1>
      <div className="search-bar mb-4 d-flex align-items-center">
        <FontAwesomeIcon icon={faSearch} className="search-icon me-2" />
        <input
          type="text"
          className="form-control"
          placeholder="Título, género, equipo o liga"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <div className="row">
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => (
            <div key={movie.id} className="col-md-4 mb-4">
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
          <div className="text-center mt-4">
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
  const navigate = useNavigate();
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
    <div className="container movie-details">
      <button className="btn btn-secondary mb-4" onClick={() => navigate("/")}>
        <FontAwesomeIcon icon={faArrowLeft} /> Regresar
      </button>
      <h1 className="text-center my-4">{movie.title}</h1>
      <div className="row">
        <div className="col-md-6">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            className="img-fluid"
            alt={movie.title}
          />
        </div>
        <div className="col-md-6">
          <p>{movie.overview}</p>
          <p>
            <strong>Fecha de estreno:</strong> {movie.release_date}
          </p>
          <p>
            <strong>Puntuación:</strong> ⭐ {movie.vote_average}
          </p>
          <div className="mt-4">
            <button className="btn btn-primary me-2">VER AHORA</button>
            <button className="btn btn-secondary">TRÁILER</button>
          </div>
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