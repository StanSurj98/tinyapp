const express = require('express'); // Imports the express module
const app = express();
const PORT = 8080; // Default port 8080

// Setting EJS as the view engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// ----Middleware----
// This parses the data from a Buffer data type to a string, must be BEFORE routing code
app.use(express.urlencoded({ extended: true })); 
// will add data to "request" object under the key "body".


// Get request to root path "/"
app.get("/", (req, res) => {
  res.send(`Hello!`);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n"); // renders HTML on client side
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); // Takes the urlDatabase and display serialized json at this path
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }; // when using EJS template, MUST pass an object
  // EJS knows to look inside a "views" dir automatically for a "urls_index.ejs" file
  res.render("urls_index", templateVars); // that's why we don't need extension or path
});

// Need to create a response for the form POST method, otherwise we get nothing
app.post('/urls', (req, res) => {
  console.log(req.body); // Logs POST request body to the console
  res.send(`Ok`); // respond with 'ok' - will change later
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

// This tells our server to listen on our port
app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}!`);
});