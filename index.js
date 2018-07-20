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
	var action =
    req.body.queryResult &&
    req.body.queryResult.action
      ? req.body.queryResult.action
      : "C'è qualche problema, parla ancora";

	return res.json({
		fulfillmentText: speech, 
		source: "moviehint-webhook"
	});
}

restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});