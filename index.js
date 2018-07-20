"use strict";

const express = require("express");
const bodyParser = require("body-parser");

const restService = express();

const APItmdb = "775245f5d713d40f4c3ed281f88e412b";
const https = require("https");

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
  if(req.body.queryResult && req.body.queryResult.action){
    action = req.body.queryResult.action;
    switch(action){

      case "get-a-random-movie": 
        const page = Math.floor(Math.random() * 1000);
        console.log(page);
        const reqUrl = encodeURI("https://api.themoviedb.org/3/discover/movie?api_key="+ APItmdb +"&language=it&sort_by=popularity.desc&include_adult=false&include_video=false&page="+page);
        https.get(reqUrl, (responseFromAPI) => {
          let completeResponse = '';
          responseFromAPI.on('data', (chunk) =>{
            completeResponse += chunk;
          });
          responseFromAPI.on('end', () =>{
            
            const movieList = JSON.parse(completeResponse);
            const index = Math.floor(Math.random() * 19);
            const nomeFilm = ""+ movieList.results[index].title;
            const dataFilm = ""+ movieList.results[index].release_date;
            const posterPath = "https://image.tmdb.org/t/p/w185"+ movieList.results[index].poster_path;
            speech = nomeFilm;
            return res.json({
              fulfillmentText: "Potresti guardare questo film",
              fulfillmentMessages: [
                {
                  card:{
                    title: nomeFilm,
                    subtitle: "Data di uscita: "+ dataFilm,
                    imageUri: posterPath
                  }
                }
              ],
              source: "moviehint-webhook",
              payload: {
                google: {
                  richResponse: {
                    items: [
                      {
                        simpleResponse: {
                          textToSpeech: nomeFilm
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
});


function getARandomMovie(){
  //return "I'll get a random movie";
  var sp = "";

  const reqUrl = encodeURI("https://api.themoviedb.org/3/discover/movie?api_key="+ APItmdb +"&language=it&sort_by=popularity.desc&include_adult=false&include_video=false");
  https.get(reqUrl, (responseFromAPI) => {
    let completeResponse = '';
    responseFromAPI.on('data', (chunk) =>{
      completeResponse += chunk;
    });
    responseFromAPI.on('end', () =>{
      
      const movieList = JSON.parse(completeResponse);
      const index = 3;
      console.log(movieList.results[3].title);
      const nomeFilm = ""+ movieList.results[3].title;
      sp += JSON.stringify(movieList.results[3].title);
      return sp;
    });
  }, (error) => {
    return "Errore nella chiamata";
  });


}

