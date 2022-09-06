const express = require('express'); // Imports the express module
const app = express();
const morgan = require('morgan');
const PORT = 8080; // Default port 8080

// Random string generator
const generateRandomString = require('./generateRandomString');

// Setting EJS as the view engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// 
// ----Middleware----
// 
app.use(morgan("dev")); // setup morgan to console.log for us

// This parses the data from a Buffer data type to a string, must be BEFORE routing code
app.use(express.urlencoded({ extended: true })); 
// will add data to "request" object under the key "body".


// 
// ----Routing Codes----
// 

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }; // when using EJS template, MUST pass an object
  // EJS knows to look inside a "views" dir automatically for a "urls_index.ejs" file
  res.render("urls_index", templateVars); // that's why we don't need extension or path
});

// Need to create a response for the form POST method, otherwise we get nothing
app.post('/urls', (req, res) => {
  // generate random string whenever a POST request sent, saves to urlDatabase the pair
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`); // respond with 'ok' - will change later
});

// ORDER matters here, if we don't put this above /urls/:id -> Express will think "new" is a route parameter and handle it like below
app.get("/urls/new", (req, res) => {
  res.render('urls_new');
});

// New endpoint to page showing shortened URL. "/:id" -> ROUTE parameter the id is added to req.params.id in express and will display as the unique shortened id in the search bar
app.get("/urls/:id", (req, res) => {
  // fetches the long URL that matches the short id url
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  // pass this data onto the urls_show.ejs in views
  res.render("urls_show", templateVars);
});

// GET request to redirect now from the short url to the proper website linked to longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  // we can now click the hyperlink on urls_show page, this is because of urls_show.ejs
  res.redirect(longURL);
});

// This tells our server to listen on our port
app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}!`);
});