const express = require("express")
const cors = require('cors');
const cookieParser = require('cookie-parser');
const querystring = require('querystring');
const bodyParser = require('body-parser');
const SpotifyWebApi = require("spotify-web-api-node");
require('dotenv').config()
const request = require('request');

const app = express()


const client_id = process.env.CLIENT_ID; // Your client id
const client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = process.env.REDIRECT_URI;

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
// app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

const spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: redirect_uri
});

var generateRandomString = function (length) {
  var text = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
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
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/public/index.html');
// });// localhost:3000



var stateKey = 'spotify_auth_state';
// app.engine("handlebars", exphbs({ defaultLayout: null }));
// app.set("view engine", "handlebars");
// app.set("views", __dirname + "/views");
app
  .use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());

app.get('/login', function (req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  // user-read-private & user-read-email used to get current user info
  // user-top-read used to get top track info
  var scope =
    'user-read-private user-read-email user-top-read playlist-modify-public user-library-read';
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
    })
  );
});

app.get('/callback', function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      '/#' +
      querystring.stringify({
        error: 'state_mismatch',
      })
    );
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization: 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
      },
      json: true,
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        access_token = body.access_token;
        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        res.redirect(
          '/#' +
          querystring.stringify({
            client: 'spotify',
            access_token: access_token,
            refresh_token: refresh_token,
          })
        );
        // res.redirect("/spotify");
        // console.log(retrieveTracksSpotify(access_token, "short_term", 1, "LAST MONTH"));
        // res.render("spotify", {
        //   shortTerm: retrieveTracksSpotify(access_token, "short_term", 1, "LAST MONTH"),
        //   mediumTerm: retrieveTracksSpotify(access_token, "medium_term", 2, "LAST 6 MONTHS"),
        //   longTerm: retrieveTracksSpotify(access_token, "long_term", 3, "ALL TIME")
        // });
      } else {
        res.send('There was an error during authentication.');
      }
    });
  }
});

app.get('/refresh_token', function (req, res) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization:
        'Basic ' +
        new Buffer.alloc(client_id + ':' + client_secret).toString('base64'),
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      var refresh_token = body.refresh_token;

      // Redirect to '/liked' with access_token and refresh_token as query params
      res.redirect(
        '/liked?' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token,
          })
      );
    } else {
      res.send('There was an error during authentication.');
    }
  });
});

app.get('/liked', (req, res) => {
  const access_token = req.query.access_token;
  const refresh_token = req.query.refresh_token;

  // Use access_token and refresh_token as needed
  // For example, you can pass them to a view
  res.render('liked', { access_token, refresh_token });
});


app.listen(process.env.PORT || 3000, function () {
  console.log('Server is running on port 3000');
});