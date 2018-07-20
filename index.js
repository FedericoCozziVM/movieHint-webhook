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

restService.post("/query", function(req, res)){
	var speech = "";
	if(req.body.queryResult && req.body.queryResult.action){
		switch(req.body.queryResult.action){
			case "get-a-random-movie": speech="Adesso ti do sto film"; break;
			default: speech="Azione non riconosciuta";
		}
	}else{
		speech = "C'è stato qualche errore, puoi ripetere?";
	}

	return res.json({
		fulfillmentText: speech, 
		source: "moviehint-webhook"
	});
}

restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});