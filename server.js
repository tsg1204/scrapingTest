/* Showing Mongoose's "Populated" Method (18.3.8)
 * INSTRUCTOR ONLY
 * =============================================== */

// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Mongoose mpromise deprecated - use bluebird promises
var Promise = require("bluebird");

mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

var databaseURi = "mongodb://localhost/scraper_db";

if(process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect(databaseURi);
}

var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Routes
// ======

// Simple index route
app.get("/", function(req, res) {
  res.send(index.html);
});

// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {

  // First, we grab the body of the html with request
  //request("https://www.npr.org/sections/politics/", function(error, response, html) {
  request("http://www.theblaze.com/", function(error, response, html) {    
  //request("http://www.foxnews.com/politics.html/", function(error, response, html) {
  //request("http://thehill.com/", function(error, response, html) {
  //request("http://www.cnn.com/politics/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

    // Now, we grab every h4 within an article tag, and do the following:
    //NPR
    //$("h2.title").each(function(i, element) {
    //The Hill
    //$("li.views-row").each(function(i, element) {
    //Fox News
    //$("li.article-ct").each(function(i, element) {
    //CNN not working
    //$("article.cd div.cd__content").each(function(i, element) {    
    //The Blaze
    $("article.feed.article").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Save the text of the h4-tag as "title"
      //NPR setup
      //result.title = $(this).text();
      //result.link = $(this).children("a").attr("href");
      //The Hill setup
      //result.title = $(this).find("a").text();
      //result.link = "http://thehill.com" + $(this).find("a").attr("href");    
      //The FOX News setup
      //result.title = $(this).find("h3").text();
      //result.link = "http://www.foxnews.com" + $(this).find("a").attr("href");
      //CNN setup not working
      //result.title = $(this).find("span").text();
      //result.link = "http://www.cnn.com" + $(this).find("a").attr("href");      
      //The Blaze setup
      result.title = $(this).find("h3").text();
      result.link = "http://www.theblaze.com" + $(this).find("a").attr("href");      
      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);
      console.log(entry);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});


// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});

//delete the note from both collections (article and notes)
app.post('/deletenote/:id', function(req, res){
      Article.find({'_id': req.params.id}, 'note', function(err,doc){
      // .exec(function(err, doc){
        if (err){
          console.log(err);
        }
        //deletes the note from the Notes Collection
          Note.find({'_id' : doc[0].note}).remove().exec(function(err,doc){
            if (err){
              console.log(err);
            }

          });

      });
      //deletes the note reference in the article document
      Article.findOneAndUpdate({'_id': req.params.id}, {$unset : {'note':1}})
      .exec(function(err, doc){
        if (err){
          console.log(err);
        } else {
          res.send(doc);
        }
      });
});

// Listen on port 

var PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
  console.log('Server listening on ' + PORT);
});
