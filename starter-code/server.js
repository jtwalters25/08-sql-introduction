'use strict';
// DONE: Install and require the node postgres package into your server.js, and ensure that it's now a new dependency in your package.json
const pg = require('pg');
const express = require('express');
const SQL = require('sql-template-strings');
// REVIEW: Require in body-parser for post requests in our server
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const app = express();
// REVIEW: Create a connection string for the url that will connect to our local postgres database
const conString = process.env.DATABASE_URL || 'postgres://localhost:5432';

// REVIEW: Install the middleware plugins so that our app is aware and can use the body-parser module
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./public'));


// NOTE: Routes for requesting HTML resources #2,#3 in diagram HTTP protocol
app.get('/', function(request, response) {
  response.sendFile('index.html', {root: '.'});
});

app.get('/new', function(request, response) {
  response.sendFile('new.html', {root: '.'});
});



// NOTE: Routes for making API calls to enact CRUD Operations on our database
app.get('/articles/all', function(request, response) {
  let client = new pg.Client(conString); // Pass the conString to pg, which creates a new client object

  client.connect(function(err) { // Use the client object to connect to our DB.
    if (err) console.error(err);
    //#3 in diagram sql protocol QUERY
    client.query('SELECT * FROM articles', function(err, result) { // Make a request to the DB
      if (err) console.error(err);//#4 in diagram sql protocol RESULT
      response.send(result); //#5 in diagram RESPONSE HTTP Protocol
      client.end();
    });
  })
});

app.post('/articles/insert', function(request, response) {
  console.log(request.body);
  let client = new pg.Client(conString)

  client.connect(function(err) {
    if (err) console.error(err);
    client.query(
      `INSERT INTO articles(author, "authorURL", body, category, "publishedOn", title, id)
     VALUES($1, $2, $3, $4, $5, $6);`
     // DONE: Write the SQL query to insert a new record
     [request.body.author,
      request.body.authorURL,
      request.body.body,
      request.body.category,
      request.body.publishedOn,
      request.body.title], // DONE: Get each value from the request's body
     function(err) {
       if (err) console.error(err);
       client.end();
      // [request.body],DONE: Get each value from the request's body
     }
    );
  });
  response.send('insert complete');
});
app.put('/articles/update', function(request, response) {
  let client = new pg.Client(conString);

  client.connect(function(err) {
    if (err) console.error(err);

    client.query(
      `UPDATE articles
      SET author=$1, "authorURL"=$2, body=$3, category=$4, "publishedOn"=$5, title=$6, WHERE id=$7`

      [request.body.author,
       request.body.authorURL,
       request.body.body,
       request.body.category,
       request.body.publishedOn,
       request.body.title,
       request.body.id], // did: Get each value from the request's body
      function(err) {
        if (err) console.error(err);
        client.end();
      }
    );
  });
  response.send('insert complete');
});

app.delete('/articles/delete', function(request, response) {
  let client = new pg.Client(conString);

  client.connect(function(err) {
    if (err) console.error(err);

    client.query(
      `DELETE FROM articles WHERE id=${request.body.id};`, // did: Write the SQL query to delete a record
      function(err) {
        if (err) console.error(err);
        client.end();
      }
    );
  });
  response.send('Delete complete');
});

app.delete('/articles/truncate', function(request, response) {
  let client = new pg.Client(conString);

  client.connect(function(err) {
    if (err) console.error(err);

    client.query(
      'DELETE FROM articles;', // did: Write the SQl query to truncate the table
      function(err) {
        if (err) console.error(err);
        client.end();
      }
    );
  });
  response.send('Delete complete');
});

app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}!`);
});
