const PORT = 8080; // Default port 8080
const express = require('express'); // Imports the express module
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Helper Functions
const generateRandomString = require('./generateRandomString');
const getUserByEmail = require('./getUserByEmail');

// Setting EJS as the view engine
app.set("view engine", "ejs");


// 
// ---- Databases ----
// 
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// 
// ----Middleware----
// 
// NOTE: Middleware that takes in (req, res, next) => {} NEEDS the "next" param

app.use(morgan("dev")); // setup morgan to console.log for us

// This parses the data from a Buffer data type to a string, must be BEFORE routing code
app.use(express.urlencoded({ extended: true })); 
// will add data to "request" object under the key "body".

// CookieParser for express
app.use(cookieParser());


// 
// ----Routing Codes----
// 

// 
// ----POST----
// 

// ADD - POST, Handles registration, sets new cookie for new users, add to database
app.post("/register", (req, res) => {
  const user_email = req.body.email;
  const user_password = req.body.password;
  // Edge cases: if email/pass empty OR user already exists
  if (user_email === "" || user_password === "") {
    return res.send("Error 400 Empty fields");
  }
  if (getUserByEmail(users, user_email)) return res.send("Error 400 User email exists");
  // ---------------------------------------------------------------------
  const user_id = generateRandomString(); // new user_id string
  users[user_id] = {  // adding the new user to users database
    id: user_id,
    email: user_email,
    password: user_password,
  }
  console.log(users); // to see if new user is added to global object
  res.cookie('user_id', user_id); // set new cookie for user_id
  return res.redirect("/urls");
});

// EDIT - POST method to /logout for logging out and deleting our cookies
app.post('/logout', (req, res) => {
  res.clearCookie("user_id"); // clears cookie by its name
  res.redirect('/urls');
});

// EDIT - POST method to /login for logging in with cookies
app.post('/login', (req, res) => {
  // res.cookie(name, value, [,options]) <-- the params
  res.cookie("user_id", req.body.user_id);
  res.redirect("/urls");
});

// EDIT - POST method to /urls/:id/edit
app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL; // updates the longURL but not shortURL
  res.redirect('/urls');
});

// DELETE - POST method to /urls/:id/delete, responding to POST from the delete buttons
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]; // deletes the property at req.params.id (shortURL)
  res.redirect('/urls');
});

// ADD - POST to /urls, creates new shortURL and posts another saved URL
app.post('/urls', (req, res) => {
  // generate random string whenever a POST request sent, saves to urlDatabase the pair
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
});

// 
// ---- RENDERING Get routers ----
// 

// READ - GET method for our /register form
app.get('/register', (req, res) => {
  const user_id = req.cookies["user_id"];
  const userObj = users[user_id];
  if(userObj) {
    return res.redirect('/urls');
  }

  const templateVars = { 
    user: null,
  };
  res.render('urls_register', templateVars);
});

// BROWSE - GET method to /urls, renders our template that shows an index of all urls
app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const userObj = users[user_id];
  if (!userObj) {
    res.redirect('/register')
  }
  const templateVars = { 
    user: userObj,
    urls: urlDatabase
  }; // when using EJS template, MUST pass an object
  // EJS knows to look inside a "views" dir automatically for a "urls_index.ejs" file
  res.render("urls_index", templateVars);
});

// READ - GET method to /urls/new, 
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  const userObj = users[user_id];
  if (!userObj) {
    res.redirect('/register');
  }
  const templateVars = {
    user: userObj,
  }
  // we want to READ a page where we can submit a form to create a NEW shortened URL
  res.render('urls_new', templateVars);
});

// READ - GET to /urls/("/:id") -> ROUTE parameter added to req.params.id in express
app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies["user_id"];
  const userObj = users[user_id];
  if (!userObj) {
    res.redirect('/register');
  }
  // fetches the longURL at key of shortURL
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: userObj,
  };
  // we want to render the page that shows us our single url
  res.render("urls_show", templateVars);
});

// READ - GET, redirects shortURL href to the website at longURL
app.get("/u/:id", (req, res) => { // since also a GET method, unique path of /u/:id
  const longURL = urlDatabase[req.params.id];
  // we can now click the hyperlink on urls_show page, this is because of urls_show.ejs
  res.redirect(longURL);
});

// This tells our server to listen on our port
app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}!`);
});