"use strict";

const express = require("express");
const bodyParser = require("body-parser");

const restService = express();

const APItmdb = "775245f5d713d40f4c3ed281f88e412b";
const http = require("http");

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
      case "get-a-random-movie": speech = getARandomMovie(); break;
      default: speech = "Action unknown";
    }

  }else{
    speech = "Missing action";
  }
  return res.json({
    fulfillmentText: speech,
    source: "moviehint-webhook"
  });
});

restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});


function getARandomMovie(){
  //return "I'll get a random movie";

  const reqUrl = encodeURI("https://api.themoviedb.org/3/discover/movie?api_key="+ APItmdb +"&language=it&sort_by=popularity.desc&include_adult=false&include_video=false");
  http.get(reqUrl, (responseFromAPI) => {
    let completeResponse = '';
    responseFromAPI.on('data', (chunk) =>{
      completeResponse += chunk;
    });
    responseFromAPI.on('end', () =>{
      return ""+completeResponse;
  }, (error) => {
    return "Errore nella chiamata";
  });


}