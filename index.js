const express = require("express")
const app = express()
const bodyParser = require('body-parser');
require('dotenv').config()
const querystring = require("querystring");

const SpotifyWebApi = require("spotify-web-api-node");
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/callback'
});

// Retrieve an access token
spotifyApi
    .clientCredentialsGrant()
    .then(data => {
        console.log(data.body)
        spotifyApi.setAccessToken(data.body["access_token"]);
    })
    .catch(error => {
        console.log("Something went wrong when retrieving an access token\n", error);
    });

app.get('/login', function(req, res) {

        var state = generateRandomString(16);
        var scope = 'user-read-private user-read-email user-read-playback-state';
      
        res.redirect('https://accounts.spotify.com/authorize?' +
          querystring.stringify({
            response_type: 'code',
            client_id: process.env.CLIENT_ID,
            scope: scope,
            redirect_uri: process.env.REDIRECT_URI,
            state: state
          }));
      });


// the routes go here:
app.get('/', (req, res) => {
    res.render('index')
    
}) // localhost:3000


app.get('/artists', (req, res, next) => {
    //console.log('artist is', req.query.artist)
    spotifyApi
      .searchArtists(req.query.artist)
      .then(data => {
          //console.log("The received data from the API: ", data.body.artists.items);
          res.render('artists',  {artists: data.body.artists.items, artist: req.query.artist});
      })
      .catch(err => {
          console.log("The error while searching artists occurred: ", err);
      })
  });

app.listen(3000)