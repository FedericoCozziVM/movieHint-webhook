"use strict";

const express = require("express");
const bodyParser = require("body-parser");

const restService = express();

const APItmdb = "775245f5d713d40f4c3ed281f88e412b";
const https = require("https");

const genresStuct =  [{"id": 28, "name": "Action"},{"id": 12, "name": "Adventure"}, {"id": 16, "name": "Animation"},{"id": 35, "name": "Comedy"},{"id": 80, "name": "Crime"}, 
    {"id": 99, "name": "Documentary"},{"id": 18, "name": "Drama"},{"id": 10751,"name": "Family"},{"id": 14,"name": "Fantasy"},{"id": 36,"name": "History" },{"id": 27,"name": "Horror"},
    {"id": 10402,"name": "Music"}, {"id": 9648,"name": "Mystery" },{"id": 10749,"name": "Romance"},{"id": 878,"name": "Science Fiction"},{"id": 10770,"name": "TV Movie"},
    {"id": 53,"name": "Thriller"},{"id": 10752,"name": "War"},{"id": 37,"name": "Western"}];

restService.use(
  bodyParser.urlencoded({
    extended: true
  })
);

restService.use(bodyParser.json());

restService.post("/echo", function(req, res) {
  var speech =
    req.body.queryResult &&
    req.body.queryResult.parameters &&
    req.body.queryResult.parameters.echoText
      ? req.body.queryResult.parameters.echoText
      : "Seems like some problem. Speak again.";
  return res.json({
    fulfillmentText: speech,
    source: "moviehint-webhook"
  });
});

restService.post("/userQuery", function(req, res) {
  
  
  var speech;
  var action;
  var page, index;
  var reqUrl;
  var movieList;
  var nomeFilm, dataFilm, posterPath;
  var queryGenre;

  if(req.body.queryResult && req.body.queryResult.action){
    action = req.body.queryResult.action;

    switch(action){

      case "get-a-random-movie": 

        page = Math.floor(Math.random() * 1000);
        console.log(page);
        reqUrl = encodeURI("https://api.themoviedb.org/3/discover/movie?api_key="+ APItmdb +"&language=it&sort_by=popularity.desc&include_adult=false&include_video=false&page="+page);
        https.get(reqUrl, (responseFromAPI) => {
          let completeResponse = '';
          responseFromAPI.on('data', (chunk) =>{
            completeResponse += chunk;
          });
          responseFromAPI.on('end', () =>{
            
            movieList = JSON.parse(completeResponse);
            index = Math.floor(Math.random() * 19);
            nomeFilm = ""+ movieList.results[index].title;
            dataFilm = ""+ movieList.results[index].release_date;
            posterPath = "https://image.tmdb.org/t/p/w185"+ movieList.results[index].poster_path;

            return res.json({
              fulfillmentText: "Potresti guardare questo film",
              fulfillmentMessages: [
                {
                  "text": {"text": ["Ti consiglio questo film"]}
                },
                {
                  card:{
                    title: nomeFilm,
                    subtitle: "Data di uscita: "+ dataFilm,
                    imageUri: posterPath
                  }
                },
                {
                  "text": {"text": ["Può andare bene?"]}
                }
              ],
              source: "moviehint-webhook",
              payload: {
                google: {
                  richResponse: {
                    items: [
                      {
                        simpleResponse: {
                          textToSpeech: "Potresti guardare il film "+nomeFilm
                        }
                      },
                      {
                        basicCard: {
                          title: nomeFilm,
                          subtitle: "Data di uscita: "+dataFilm,
                          image:{
                            url: posterPath,
                            accessibilityText: "Poster del film"
                          }
                        }
                      },
                      {
                        simpleResponse: {
                          textToSpeech: "Può andare bene?"
                        }
                      }
                    ]
                  }
                }
              }
            });
          });
        }, (error) => {
          speech = "Some error occurred";
          return res.json({
            fulfillmentText: speech,
            source: "moviehint-webhook"
          });
        });
        break;

      case "get-a-genre-random-movie": 

        if(req.body.queryResult.parameters && req.body.queryResult.parameters.movieGenre){
          queryGenre = req.body.queryResult.parameters.movieGenre;
          var q, i;
          for(i in genresStuct){
            if(genresStuct[i].name == queryGenre){
              q = genresStuct[i].id;
              break;
            }
          }
          console.log(q);
        }
        page = Math.floor(Math.random() * 10);
        reqUrl = encodeURI("https://api.themoviedb.org/3/discover/movie?api_key="+ APItmdb +"&language=it&sort_by=popularity.desc&include_adult=false&include_video=false&page="+page+"&with_genres="+q);
        https.get(reqUrl, (responseFromAPI) => {
          let completeResponse = '';
          responseFromAPI.on('data', (chunk) =>{
            completeResponse += chunk;
          });
          responseFromAPI.on('end', () =>{
            
            movieList = JSON.parse(completeResponse);
            index = Math.floor(Math.random() * 19);
            nomeFilm = ""+ movieList.results[index].title;
            dataFilm = ""+ movieList.results[index].release_date;
            posterPath = "https://image.tmdb.org/t/p/w185"+ movieList.results[index].poster_path;

            return res.json({
              fulfillmentText: "Potresti guardare questo film",
              fulfillmentMessages: [
                {
                  "text": {"text": ["Ti consiglio questo film"]}
                },
                {
                  card:{
                    title: nomeFilm,
                    subtitle: "Data di uscita: "+ dataFilm,
                    imageUri: posterPath
                  }
                },
                {
                  "text": {"text": ["Può andare bene?"]}
                }
              ],
              source: "moviehint-webhook",
              payload: {
                google: {
                  richResponse: {
                    items: [
                      {
                        simpleResponse: {
                          textToSpeech: "Potresti guardare il film "+nomeFilm
                        }
                      },
                      {
                        basicCard: {
                          title: nomeFilm,
                          subtitle: "Data di uscita: "+dataFilm,
                          image:{
                            url: posterPath,
                            accessibilityText: "Poster del film"
                          }
                        }
                      },
                      {
                        simpleResponse: {
                          textToSpeech: "Può andare bene?"
                        }
                      }
                    ]
                  }
                }
              }
            });
          });
        }, (error) => {
          speech = "Some error occurred";
          return res.json({
            fulfillmentText: speech,
            source: "moviehint-webhook"
          });
        });
        break;

      

      default: speech = "Action unknown";
    }

  }
});

restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
  console.log(genresStuct[2].name);
});


