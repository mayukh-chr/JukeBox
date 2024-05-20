document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const songName = document.getElementById('songName').value;
    searchSpotify(songName);
});

async function searchSpotify(songName) {
    const clientId = 'YOUR_CLIENT_ID';
    const clientSecret = 'YOUR_CLIENT_SECRET';
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(songName)}&type=track&limit=10`;

    // Get Access Token
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });
    
    const data = await response.json();
    const accessToken = data.access_token;

    // Search for songs
    const searchResponse = await fetch(searchUrl, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });

    const searchData = await searchResponse.json();
    displayResults(searchData);
}

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear previous results

    const tracks = data.tracks.items;
    tracks.forEach(track => {
        const trackElement = document.createElement('div');
        trackElement.innerHTML = `<p>${track.name} by ${track.artists.map(artist => artist.name).join(', ')}</p>`;
        resultsDiv.appendChild(trackElement);
    });
}

