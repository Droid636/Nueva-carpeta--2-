import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Diccionario de traducción completo
const dictionary = {
  // Géneros
  "action": "acción",
  "adventure": "aventura",
  "animation": "animación",
  "comedy": "comedia",
  "crime": "crimen",
  "documentary": "documental",
  "drama": "drama",
  "family": "familia",
  "fantasy": "fantasía",
  "history": "historia",
  "horror": "terror",
  "music": "música",
  "mystery": "misterio",
  "romance": "romance",
  "science fiction": "ciencia ficción",
  "science-fiction": "ciencia ficción",
  "thriller": "suspenso",
  "suspense": "suspenso",
  "war": "guerra",
  "western": "western",

  // Términos comunes
  "movie": "película",
  "film": "película",
  "star": "estrella",
  "actor": "actor",
  "actress": "actriz",
  "director": "director",
  "producer": "productor",
  "new": "nuevo",
  "popular": "popular",
  "now playing": "en cines",
  "upcoming": "próximamente"
};

function Home() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genres, setGenres] = useState({});
  const [actors, setActors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const API_KEY = "c144cee3268c94c83ad046b6533644c8";
  const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es`;
  const GENRES_URL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=es`;

  const navigate = useNavigate();

  const normalizeText = (text) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const getSuggestions = (input) => {
    if (!input.trim()) return [];
    const inputLower = normalizeText(input);
    
    const results = new Set();
    
    Object.entries(dictionary).forEach(([english, spanish]) => {
      const englishClean = normalizeText(english);
      const spanishClean = normalizeText(spanish);
      
      if (spanishClean.includes(inputLower) || englishClean.includes(inputLower)) {
        results.add(spanish);
      }
    });
    
    return Array.from(results).slice(0, 8);
  };

  const handleSearch = (event) => {
    let value = event.target.value;
    
    if (value !== searchTerm && value.startsWith(' ')) {
      value = value.trimStart();
    }
    
    setSearchTerm(value);
    
    const lastWord = value.trim().split(/\s+/).pop();
    if (lastWord.length > 0) {
      const newSuggestions = getSuggestions(lastWord);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    const terms = searchTerm.trim().split(/\s+/);
    terms[terms.length - 1] = suggestion;
    setSearchTerm(terms.join(' ') + ' ');
    setShowSuggestions(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [moviesRes, genresRes] = await Promise.all([
          fetch(API_URL),
          fetch(GENRES_URL)
        ]);
        
        const moviesData = await moviesRes.json();
        const genresData = await genresRes.json();
        
        setMovies(moviesData.results);

        const genreMap = {};
        genresData.genres.forEach((genre) => {
          genreMap[genre.id] = genre.name.toLowerCase();
        });
        setGenres(genreMap);

        const actorsData = {};
        const castPromises = moviesData.results.map(async (movie) => {
          const CAST_URL = `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${API_KEY}`;
          const castResponse = await fetch(CAST_URL);
          const castData = await castResponse.json();
          actorsData[movie.id] = castData.cast.map((actor) => actor.name.toLowerCase());
        });
        
        await Promise.all(castPromises);
        setActors(actorsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredMovies = movies.filter((movie) => {
    const searchText = normalizeText(searchTerm.trim());
    if (!searchText) return true;
    
    const searchTerms = new Set([searchText]);
    
    Object.entries(dictionary).forEach(([english, spanish]) => {
      const englishClean = normalizeText(english);
      const spanishClean = normalizeText(spanish);
      
      if (englishClean === searchText) searchTerms.add(spanishClean);
      if (spanishClean === searchText) searchTerms.add(englishClean);
    });
    
    return Array.from(searchTerms).some(term => {
      const cleanTitle = normalizeText(movie.title);
      const cleanOriginalTitle = movie.original_title ? normalizeText(movie.original_title) : '';
      
      const titleMatch = cleanTitle.includes(term) || cleanOriginalTitle.includes(term);
      
      const genreMatch = movie.genre_ids.some(id => {
        const genreName = genres[id] ? normalizeText(genres[id]) : '';
        return genreName.includes(term);
      });
      
      const actorMatch = actors[movie.id]?.some(actor => 
        normalizeText(actor).includes(term)
      );
      
      return titleMatch || genreMatch || actorMatch;
    });
  });

  return (
    <div className="container-fluid">
      <div className="search-container mb-4">
        <div className="search-bar">
          <FontAwesomeIcon 
            icon={isLoading ? faSpinner : faSearch} 
            className={`search-icon ${isLoading ? 'fa-spin' : ''}`} 
          />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Buscar películas Título, género, actor"
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            onFocus={() => searchTerm.trim().length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-box left-aligned">
            {suggestions.map((item, index) => (
              <div 
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionSelect(item)}
                onMouseDown={(e) => e.preventDefault()}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="spiral-animation"></div>
          <p>Cargando películas...</p>
        </div>
      ) : (
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
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                      }}
                    />
                    <div className="title-overlay">
                      <h5 className="movie-title">{movie.title}</h5>
                      <div className="movie-genres">
                        {movie.genre_ids.slice(0, 2).map(id => (
                          <span key={id} className="genre-badge">
                            {genres[id]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results-container">
              <div className="spiral-animation"></div>
              <p>No se encontraron películas para "{searchTerm.trim()}"</p>
              <button 
                className="btn btn-clear-search"
                onClick={() => setSearchTerm('')}
              >
                Limpiar búsqueda
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [isLightBackground, setIsLightBackground] = useState(false);
  const navigate = useNavigate();
  const API_URL = `https://api.themoviedb.org/3/movie/${id}?api_key=c144cee3268c94c83ad046b6533644c8&language=es`;
  const CAST_URL = `https://api.themoviedb.org/3/movie/${id}/credits?api_key=c144cee3268c94c83ad046b6533644c8`;

  const formatTitle = (title) => {
    if (title.toLowerCase().includes("blanca nives")) {
      return (
        <>
          <span className="title-first-word">Blanca</span>
          <span className="title-second-word">Nives</span>
        </>
      );
    }
    return title;
  };

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setMovie(data);
        
        if (data.backdrop_path) {
          const img = new Image();
          img.src = `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`;
          img.onload = function() {
            const brightness = getImageBrightness(img);
            setIsLightBackground(brightness > 128);
          };
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };

    const fetchCast = async () => {
      try {
        const response = await fetch(CAST_URL);
        const data = await response.json();
        setCast(data.cast.slice(0, 5));
      } catch (error) {
        console.error("Error fetching cast:", error);
      }
    };

    fetchMovie();
    fetchCast();
  }, [id]);

  function getImageBrightness(img) {
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 50, 50);
    const imageData = ctx.getImageData(0, 0, 50, 50);
    const data = imageData.data;
    let brightness = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      brightness += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    
    return brightness / (50 * 50);
  }

  if (!movie) return (
    <div className="loading-container">
      <div className="spiral-animation"></div>
      <p>Cargando detalles...</p>
    </div>
  );

  return (
    <div
      className="movie-details-container"
      style={{
        backgroundImage: `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})`,
      }}
    >
      <button 
        className={`back-button ${isLightBackground ? 'light-background' : ''}`}
        onClick={() => navigate("/")}
      >
        <FontAwesomeIcon icon={faArrowLeft} /> Regresar
      </button>
      <div className="movie-details-overlay">
        <h1 className="movie-title-formatted">
          {formatTitle(movie.title)}
        </h1>
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