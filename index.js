"use strict";

const express = require("express");
const bodyParser = require("body-parser");

const restService = express();

//api per chiamate al db online
const APItmdb = "775245f5d713d40f4c3ed281f88e412b";

//oggetto per le chiamate https REST
const https = require("https");

//codici id per i generi, come impostati sul DB
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

/***************/
//Servizio POST sul server, contattabile a /userQuery: questo servizio viene chiamato dagli intent dell'agente DialogFlow; comportamenti diversi sono identificati da un action diverso
/***************/

restService.post("/userQuery", function(req, res) {
  
  
  var speech;
  var action;
  var page, index, maxIndex;
  var reqUrl;
  var movieList;
  var genresMovieList;
  var nomeFilm, dataFilm, posterPath, generiFilm, dataFilm, tramaFilm, nomeOriginale;
  var queryGenre;
  var i,j;

  if(req.body.queryResult && req.body.queryResult.action){
    action = req.body.queryResult.action;

    switch(action){

      //azione per ricevere un film completamente random
      case "get-a-random-movie": 

        //i film sono ordinati per popolarità, la pagina e l'indice sono randomici (pagina fra le prime 1000)
        page = Math.floor(Math.random() * 999)+1;

        reqUrl = encodeURI("https://api.themoviedb.org/3/discover/movie?api_key="+ APItmdb +"&language=it&sort_by=popularity.desc&include_adult=false&include_video=false&page="+page);

        https.get(reqUrl, (responseFromAPI) => {
          let completeResponse = '';
          responseFromAPI.on('data', (chunk) =>{
            completeResponse += chunk;
          });
          responseFromAPI.on('end', () =>{
            //una volta che i dati json sono arrivati tutti

            //risultato della chiamata
            movieList = JSON.parse(completeResponse);

            //estrazione indice casuale
            maxIndex = movieList.results.length -1;
            index = Math.floor(Math.random() * maxIndex);
            console.log("page "+page+", index "+index+" of tot "+maxIndex);

            //estrazione dati film casuale
            nomeFilm = ""+ movieList.results[index].title;
            dataFilm = ""+ movieList.results[index].release_date;
            posterPath = "https://image.tmdb.org/t/p/w185"+ movieList.results[index].poster_path;
            genresMovieList = movieList.results[index].genre_ids;
            generiFilm = "";
            dataFilm = movieList.results[index].release_date.split("-");
            tramaFilm = movieList.results[index].overview;
            nomeOriginale = movieList.results[index].original_title;

            //i generi vengono forniti dalle API come un id, si recuperano i generi dalla lista definita in questo doc
            for(i in genresMovieList){
              for(j in genresStuct){
                if(genresMovieList[i] == genresStuct[j].id){
                  generiFilm += (genresStuct[j].name +" ");
                }
              }
            }

            //inserimento id film nel contesto per future chiamate di maggior informazioni
            var oldContexts
            if(req.body.queryResult.outputContexts){
            	oldContexts = req.body.queryResult.outputContexts;
        		//oldContexts[0].parameters.idMovie = movieList.results[index].id;
        		oldContexts[0]["parameters"]={"movieId": movieList.results[index].id};
        		//console.log(oldContexts);
            } 


            //messaggio di risposta all'agente DialogFlow
            return res.json({
              fulfillmentText: "Potresti guardare questo film",
              fulfillmentMessages: [
                {
                  "text": {"text": ["Ti consiglio questo film"]}
                },
                {
                  card:{
                    title: nomeFilm,
                    subtitle: "Genere: "+generiFilm+"; \nData uscita: "+dataFilm[2]+"-"+dataFilm[1]+"-"+dataFilm[0],
                    imageUri: posterPath
                  }
                },
                {
                  "text": {"text": ["Può andare bene?"]}
                }
              ],
              source: "moviehint-webhook",
              payload: {
                //risposta per agente Google Assistent
                google: {
                  richResponse: {
                    items: [
                      {
                        simpleResponse: {
                          textToSpeech: "Potresti guardare il film \""+nomeFilm+"\" del "+dataFilm[0]
                        }
                      },
                      {
                        basicCard: {
                          title: nomeFilm,
                          subtitle: "Genere: "+generiFilm+"; \nData uscita: "+dataFilm[2]+"-"+dataFilm[1]+"-"+dataFilm[0],
                          image:{
                            url: posterPath,
                            accessibilityText: "Poster del film"
                          },
                          formattedText: tramaFilm
                        }
                      },
                      {
                        simpleResponse: {
                          textToSpeech: "Può andare bene?"
                        }
                      }
                    ]
                  }
                },
                custom: {
                	infoMovie: {
                		title: nomeFilm,
	                	data: ""+dataFilm[2]+"-"+dataFilm[1]+"-"+dataFilm[0],
	                	poster: posterPath,
	                	genre: generiFilm,
	                	overview: tramaFilm,
	                	originalTitle: nomeOriginale
                	}
                	
                }
              },
              outputContexts : oldContexts
            });
          });
        }, (error) => {

          //errore di comunicazione con il DB
          speech = "Some error occurred";
          return res.json({
            fulfillmentText: speech,
            source: "moviehint-webhook"
          });
        });
        break;

      //azione per ricevere un film random di un determinato genere

      case "get-a-genre-random-movie": 

        //si cerca il parametro movieGenre nella richiesta
        if(req.body.queryResult.parameters){
          if(req.body.queryResult.parameters.movieGenre){
            queryGenre = req.body.queryResult.parameters.movieGenre;
            var q;
            for(i in genresStuct){
              if(genresStuct[i].name == queryGenre){
                q = genresStuct[i].id;
                break;
              }
            }
          }else{

            //se non viene trovato lo si cerca nei contesti
            if(req.body.queryResult.outputContexts){
              var contexts = req.body.queryResult.outputContexts;
              var c;
              for(c=0; c<contexts.length; c++){
                if(contexts[c].parameters && contexts[c].parameters.movieGenre){    
                  queryGenre = contexts[c].parameters.movieGenre;
                  for(i in genresStuct){
                    if(genresStuct[i].name == queryGenre){
                      q = genresStuct[i].id;
                      break;
                    }
                  }
                  console.log("Found context genre "+queryGenre);
                  break;
                }
              }
            }
          }
        }

        //estrazione random della pagina dei film in ordine di popolarità (essendoci molti meno film per genrere che i 1000 della chiamata random, per sicurezza ci limitiamo a 10 pagine)
        page = Math.floor(Math.random() * 9)+1;
        reqUrl = encodeURI("https://api.themoviedb.org/3/discover/movie?api_key="+ APItmdb +"&language=it&sort_by=popularity.desc&include_adult=false&include_video=false&page="+page+"&with_genres="+q);
        https.get(reqUrl, (responseFromAPI) => {
          let completeResponse = '';
          responseFromAPI.on('data', (chunk) =>{
            completeResponse += chunk;
          });
          responseFromAPI.on('end', () =>{
            
            movieList = JSON.parse(completeResponse);

            //estrazione indice casuale
            maxIndex = movieList.results.length -1;
            index = Math.floor(Math.random() * maxIndex);
            console.log("page "+page+", index "+index+" of tot "+maxIndex);

            //estrazione dati film
            nomeFilm = ""+ movieList.results[index].title;
            dataFilm = ""+ movieList.results[index].release_date;
            posterPath = "https://image.tmdb.org/t/p/w185"+ movieList.results[index].poster_path;
            genresMovieList = movieList.results[index].genre_ids;
            generiFilm = "";
            dataFilm = movieList.results[index].release_date.split("-");
            tramaFilm = movieList.results[index].overview;
            nomeOriginale = movieList.results[index].original_title;

            //i generi vengono forniti dalle API come un id, si recuperano i generi dalla lista definita in questo doc
            for(i in genresMovieList){
              for(j in genresStuct){
                if(genresMovieList[i] == genresStuct[j].id){
                  generiFilm += (genresStuct[j].name +" ");
                }
              }
            }                

            //risposta JSON per agente DialogFlow
            return res.json({
              fulfillmentText: "Potresti guardare questo film",
              fulfillmentMessages: [
                {
                  "text": {"text": ["Ti consiglio questo film"]}
                },
                {
                  card:{
                    title: nomeFilm,
                    subtitle: "Genere: "+generiFilm+"; \nData uscita: "+dataFilm[2]+"-"+dataFilm[1]+"-"+dataFilm[0],
                    imageUri: posterPath
                  }
                },
                {
                  "text": {"text": ["Può andare bene?"]}
                }
              ],
              source: "moviehint-webhook",
              payload: {
                //risposta per agente Google Assistant
                google: {
                  richResponse: {
                    items: [
                      {
                        simpleResponse: {
                          textToSpeech: "Potresti guardare il film \""+nomeFilm+"\" del "+dataFilm[0]
                        }
                      },
                      {
                        basicCard: {
                          title: nomeFilm,
                          subtitle: "Genere: "+generiFilm+"; \nData uscita: "+dataFilm[2]+"-"+dataFilm[1]+"-"+dataFilm[0],
                          image:{
                            url: posterPath,
                            accessibilityText: "Poster del film"
                          },
                          formattedText: tramaFilm
                        }
                      },
                      {
                        simpleResponse: {
                          textToSpeech: "Può andare bene?"
                        }
                      }
                    ]
                  }
                },
                custom: {
                	infoMovie: {
                		title: nomeFilm,
	                	data: ""+dataFilm[2]+"-"+dataFilm[1]+"-"+dataFilm[0],
	                	poster: posterPath,
	                	genre: generiFilm,
	                	overview: tramaFilm,
	                	originalTitle: nomeOriginale
                	}
                	
                }
              }
            });
          });
        }, (error) => {

          //errore nella chiamata
          speech = "Some error occurred";
          return res.json({
            fulfillmentText: speech,
            source: "moviehint-webhook"
          });
        });
        break;

      
      //in mancanza di azione (in teoria non viene chiamato mai, l'azione deve essere sempre definita dagli intent che comunicano con questo webhook)
      default: 
        speech = "Action unknown";
        return res.json({
          fulfillmentText: speech,
          source: "moviehint-webhook"
        });
    }

  }
});

//attivazione del server nodejs 
restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
  console.log(genresStuct[2].name);
});


