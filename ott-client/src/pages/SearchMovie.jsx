// Import necessary modules
import React, { useState } from 'react';
import './MovieDetails.css';

const SearchMovie = () => {
  const [movieName, setMovieName] = useState('');
  const [movieData, setMovieData] = useState(null);
  const [error, setError] = useState('');

  const apiKey = 'f9b1e6ebe6809e2f826f852f064e3827'; // Replace with your TMDb API key

  const fetchMovieDetails = async () => {
    if (!movieName) {
      setError('Please enter a movie name');
      return;
    }

    setError('');
    setMovieData(null);

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(movieName)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch movie details');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setMovieData(data.results[0]);
      } else {
        setError('No movie found with this name');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="movie-details-container">
      <h1>Movie Search</h1>
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter movie name"
          value={movieName}
          onChange={(e) => setMovieName(e.target.value)}
        />
        <button onClick={fetchMovieDetails}>Search</button>
      </div>
      {error && <p className="error-message">{error}</p>}
      {movieData && (
        <div className="movie-details">
          <img
            src={`https://image.tmdb.org/t/p/w500/${movieData.poster_path}`}
            alt={movieData.title}
            className="movie-poster"
          />
          <div className="movie-info">
            <h2>{movieData.title}</h2>
            <p><strong>Release Date:</strong> {movieData.release_date}</p>
            <p><strong>Rating:</strong> {movieData.vote_average} / 10</p>
            <p><strong>Overview:</strong> {movieData.overview}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchMovie;
