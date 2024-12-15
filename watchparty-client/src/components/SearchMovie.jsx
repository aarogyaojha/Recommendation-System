import React, { useState } from 'react';
import '../assets/movie.css';

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

  const generatePlotSetting = (movie) => {
    if (!movie || !movie.overview) {
      return 'Get ready for a cinematic experience like no other. Hold your breath as the screen brings this vision to life. Let’s begin!';
    }

    const maxLength = 500; // Limit the length of the setting
    const trimmedOverview =
      movie.overview.length > maxLength
        ? movie.overview.substring(0, maxLength) + '...'
        : movie.overview;

    return `Welcome to the world of "${movie.title}". ${trimmedOverview} Get ready for a cinematic experience like no other. Hold your breath as the screen brings this vision to life. Let’s begin!`;
  };

  const playPlotWithMusic = (plot) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Create a new suspenseful background music instance
      const suspenseAudio = new Audio('/suspense.mp3');
      suspenseAudio.volume = 0.3; // Adjust music volume
      suspenseAudio.loop = true; // Loop music for longer plots
      suspenseAudio.play();

      const utterance = new SpeechSynthesisUtterance(plot);
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(
        (voice) => voice.lang === 'en-GB' && voice.name === 'Google UK English Male'
      );

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = 1; // Normal speed
      utterance.pitch = 1; // Normal pitch
      utterance.volume = 1; // Full volume

      // Stop the music when the speech ends
      utterance.onend = () => {
        suspenseAudio.pause();
        suspenseAudio.currentTime = 0; // Reset music for the next play
      };

      // Delay the speech by 3 seconds
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 3000);
    } else {
      alert('Sorry, your browser does not support text-to-speech functionality.');
    }
  };

  const handlePlayPlot = () => {
    if (movieData) {
      const plotSetting = generatePlotSetting(movieData);
      playPlotWithMusic(plotSetting);
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
            <button onClick={handlePlayPlot}>Play Plot</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchMovie;
