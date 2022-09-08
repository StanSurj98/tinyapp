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
// ----POST----
// 

// ADD - POST, Handles registration, sets new cookie for new users, add to database
app.post("/register", (req, res) => {
  // These two below we get from the forms for register
  const user_email = req.body.email;
  const user_password = req.body.password;
  // if email/pass empty OR user already exists; error 400
  if (user_email === "" || user_password === "") return res.send("Error 400 Empty fields");
  if (getUserByEmail(users, user_email)) return res.send("Error 400 User email exists");

  // getting here, we can register, generate new unique id
  const user_id = generateRandomString();
  // add new user to global users database
  users[user_id] = {
    id: user_id,
    email: user_email,
    password: user_password,
  }

  console.log(users);// to see if new user is added to global object
  res.cookie('user_id', user_id); // set new cookie for user_id
  return res.redirect("/urls");
});

// EDIT - POST method to /logout for logging out and deleting our cookies
app.post('/logout', (req, res) => {
  res.clearCookie("user_id"); // clears cookie by its name
  return res.redirect('/urls');
});

// POST method to /login now with Authentication
app.post('/login', (req, res) => {
  const error403 = "Error 403 The email or password is incorrect";
  // These two below we get from the forms for login
  const user_email = req.body.email;
  const user_password = req.body.password;
  // The function returns the user obj, we will assign that to a variable in this scope
  const user = getUserByEmail(users, user_email);

  if (user_email === "" || user_password === "") return res.send("Error 400 Empty Field")
  // 1. Compare entered email vs email in user object from database; error403 if not found
  if (! getUserByEmail(users, user_email)) return res.send(error403);
  // 2. if found, compare entered password vs password in user object; error403 if !==
  if (user_password !== user.password) return res.send(error403)
  // 3. if both checks pass - set cookie to user_id value in user object from database
  if (user_email === user.email && user_password === user.password) {
    res.cookie("user_id", user.id);
    return res.redirect("/urls");
  }
});

// EDIT - POST method to /urls/:id/edit
app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL; // updates the longURL but not shortURL
  return res.redirect('/urls');
});

// DELETE - POST method to /urls/:id/delete, responding to POST from the delete buttons
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]; // deletes the property at req.params.id (shortURL)
  return res.redirect('/urls');
});

// ADD - POST to /urls, creates new shortURL and posts another saved URL
app.post('/urls', (req, res) => {
  // 1. checking if cookies for user_id exists
  const user_id = req.cookies["user_id"];
  // 2. checking if that cookie id is a user id in our users database
  const userObj = users[user_id];
  if (! userObj) return res.send('Error 400 You are not logged in');

  // if userObj does exist, we create the new URL
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  return res.redirect(`/urls/${shortURL}`);
});

// 
// ---- GET RENDERING routers ----
// 

// READ - GET method for /login page
app.get('/login', (req, res) => {
  // check if logged in by checking the cookie
  const user_id = req.cookies["user_id"];
  const userObj = users[user_id];
  // checks if userObj exists, we should be logged in at this point
  if(userObj) {
    // redirects to /urls if so
    return res.redirect('/urls');
  }
  const templateVars = {
    user: null, // at this point if we're at the login page, the headers should not have any user data yet
  }
  return res.render('urls_login', templateVars);
});

// READ - GET method for our /register form
app.get('/register', (req, res) => {
  // we're going to check if there is an existing user_id from the cookies
  const user_id = req.cookies["user_id"];
  const userObj = users[user_id];
  // checks if userObj exists, we should be logged in at this point
  if(userObj) {
    // redirects to /urls if so
    return res.redirect('/urls');
  }

  // otherwise, if user is not logged in, no cookies, we pass falsey val to the template
  const templateVars = { 
    user: null,
  };
  // and render the register page
  return res.render('urls_register', templateVars);
});

// READ - GET method that redirects / to /urls
app.get('/', (req, res) => {
  // check for cookies
  const user_id = req.cookies["user_id"];
  const userObj = users[user_id];
  // if userObj is falsey (not logged in)
  if (! userObj) {
    return res.redirect('/login');
  }
  // else if logged in, redirects to /urls
  return res.redirect('/urls');
});

// BROWSE - GET method to /urls, renders our template that shows an index of all urls
app.get("/urls", (req, res) => {
  // Anytime GET request sent to /urls - we check for cookies
  const user_id = req.cookies["user_id"];
  const userObj = users[user_id]; // that cookie corresponds to userObj
  // if userObj is falsey (aka. we not logged in)
  if (! userObj) {
    return res.redirect('/login');
  }

  // when using EJS template, MUST pass an object
  const templateVars = { 
    user: userObj,
    urls: urlDatabase
  };
  // otherwise, redirect to /urls and render the index template
  return res.render("urls_index", templateVars);
});

// READ - GET method to /urls/new, 
app.get("/urls/new", (req, res) => {
  // Anytime GET request to /urls/new -> we check first for cookies
  const user_id = req.cookies["user_id"];
  const userObj = users[user_id]; // cookies correspond to if userObj exists
  // if userObj falsey (aka. not logged in)
  if (!userObj) {
    // redirects to login page
    return res.redirect('/login');
  }

  const templateVars = {
    user: userObj,
  }
  // else if we are logged in, we send to the create new url page
  return res.render('urls_new', templateVars);
});

// READ - GET to /urls/("/:id") -> ROUTE parameter added to req.params.id in express
app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies["user_id"];
  const userObj = users[user_id];
  if (!userObj) {
    return res.redirect('/register');
  }
  // fetches the longURL at key of shortURL
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: userObj,
  };
  // we want to render the page that shows us our single url
  return res.render("urls_show", templateVars);
});

// READ - GET, redirects shortURL href to the website at longURL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id; // the request shortURL typed into the bar
  const longURL = urlDatabase[req.params.id]; // the VALUE at that shortURL (the longURL)
  
  // 1. let's check if the request url exists in our database
  for (const key in urlDatabase) {
    // if GIVEN/REQUESTED shortURL matches the shortURL KEY in database...
    if (shortURL === key) {
      // we must check for happy path, otherwise the first time we don't match, we get error
      // we redirect to the VALUE of that shortURL id... the longURL it goes to
      return res.redirect(longURL);
    }
  }
  // 2. if not, we should send a relevant error message
  return res.send('Error 404: invalid shortened URL');
});

// This tells our server to listen on our port
app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}!`);
  console.log(users); // Want to see the initial users database
});