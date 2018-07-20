"use strict";

const express = require("express");
const bodyParser = require("body-parser");

const restService = express();

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
  /*var speech =
    req.body.queryResult &&
    req.body.queryResult.parameters &&
    req.body.queryResult.parameters.echoText
      ? req.body.queryResult.parameters.echoText
      : "Seems like some problem. Speak again.";
  */
  var speech;
  var action;
  if(req.body.queryResult && req.body.queryResult.action){
    action = req.body.queryResult.action;
    switch(action){
      case "get-a-random-movie": speech = "I'll get a random movie"; break;
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