const fs = require('fs');

async function testTmdb() {
  const titles = [
    "Lovely Runner",
    "Queen of Tears",
    "The Double",
    "Amidst a Snowstorm of Love",
    "Love Next Door",
    "Blossoms in Adversity",
    "Marry My Husband",
    "Twinkling Watermelon"
  ];

  const results = {};

  for (const title of titles) {
    try {
      // TMDB API v3 search with user's valid API key
      const url = `https://api.themoviedb.org/3/search/tv?api_key=eba1a5af8ad4791a83320bfc40dd76c4&query=${encodeURIComponent(title)}`;
      const res = await fetch(url);

      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results.find(r => r.poster_path) || data.results[0];
        results[title] = {
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w1284_and_h721_multi_faces${item.backdrop_path}` : null,
          overview: item.overview,
          name: item.name || item.original_name,
        };
      } else {
        results[title] = null;
      }
    } catch (err) {
      console.error(`Error fetching ${title}:`, err.message);
    }
  }

  console.log('RESULTS:', JSON.stringify(results, null, 2));
}

testTmdb();
