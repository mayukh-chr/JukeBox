const express = require("express")
const app = express()
require('dotenv').config()

// app.get('/', (req, res) => {
//     res.send("lmao xd")
//     console.log("success at home page")
// })

// app.listen(3000)

const SpotifyWebApi = require("spotify-web-api-node");

const bodyParser = require('body-parser');

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));


const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID, 
    clientSecret: process.env.CLIENT_SECRET
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
  
  
  // the routes go here:
  app.get('/', (req, res, next) => {
    res.render('index')
  }) // localhost:3000
  