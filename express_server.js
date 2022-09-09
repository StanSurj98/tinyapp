// 
// ----- Requirements -----
// 
const PORT = 8080; // Default port 8080
const express = require('express'); // Imports the express module
const app = express();
const morgan = require('morgan'); // Morgan helps with console.log()
const bcrypt = require('bcryptjs'); // bcrypt necessary password hashing
const cookieSession = require('cookie-session') // cookieSession adds encrypted cookies



// 
// ----- Helper Functions -----
// 
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

// 
// ---- Databases ----
// 
const users = {};

const urlDatabase = {};



// 
// ----Middleware----
// 
// NOTE: Middleware that takes in (req, res, next) => {} NEEDS the "next" param

// Setting EJS as the view engine
app.set("view engine", "ejs");

// This parses the data from a Buffer data type to a string, must be BEFORE routing code
app.use(express.urlencoded({ extended: true })); 
// will add data to "request" object under the key "body".

// setup morgan to console.log for us
app.use(morgan("dev"));

// CookieSession for encrypted cookies
app.use(cookieSession({
  name: 'session',
  keys: ["superSecretCookieSession"],

  // Cookie Options
  maxAge: 10 * 60 * 1000 // 10 mins
}))


// 
// ----- POST Routes -----
// 

// Handle /register, set cookie for new users, add to DB
app.post("/register", (req, res) => {
  // These two below we get from the forms for register
  const user_email = req.body.email;
  const user_password = req.body.password;
  // Using bcrypt to hash the given password
  const hashedPassword = bcrypt.hashSync(user_password, 10);

  // 1. If email/pass fields empty OR user already exists; error 400
  if (!user_email || !user_password) return res.status(400).send("Empty Field");
  if (getUserByEmail(users, user_email)) return res.status(400).send("Enter a unique Email address");

  // 2. getting here, we can register, generate new unique id
  const user_id = generateRandomString();
  // 3. add new user to global users database
  users[user_id] = {
    id: user_id,
    email: user_email,
    password: hashedPassword,
  }
  // When registering we SET the session cookie
  req.session.user_id = user_id;
  return res.redirect("/urls");
});

// Handles /logout && clears cookies
app.post('/logout', (req, res) => {
  // nullifies session cookies
  req.session = null
  return res.redirect('/login');
});

// Handles /login with Authentication
app.post('/login', (req, res) => {
  // These two below we get from the forms for login
  const user_email = req.body.email;
  const user_password = req.body.password;
  // The function returns the user obj, we will assign that to a variable in this scope
  const user = getUserByEmail(users, user_email);

  if (!user_email || !user_password) return res.status(400).send("Empty Field");
  // 1. Compare entered email vs email in user object from database; error403 if not found
  if (!user) return res.status(403).send("Invalid Credentials");
  // 2. check if given password, matches hashed pass in user DB
  const passwordMatch = bcrypt.compareSync(user_password, user.password);
  if (!passwordMatch) return res.status(403).send(`Invalid Credentials`)
  // 3. if both checks pass - set cookie to user_id value in user object from database
  if (user_email === user.email && passwordMatch) {
    // 4. when logging in we set encrypted session cookie
    req.session.user_id = user.id;
    return res.redirect("/urls");
  }
});

// EDIT - POST to /urls/:id/edit with Auth
app.post("/urls/:id/edit", (req, res) => {
  // 1. Every post request, read session cookies
  const user_id = req.session.user_id;
  const userObj = users[user_id]; // that cookie corresponds to userObj
  // 2. if userObj is falsey... not logged in or incorrect session cookie
  if (! userObj) {
    // I want to return to /login below... but the rubric says error message so...?
    // return res.redirect('/login');
    return res.status(400).send('You are not logged in. Please <a href="/login">try again<a>');
  }

  // 3. if logged in, filters this user's unique list of URLs
  const shortURL = req.params.id;
  const thisUserURLs = urlsForUser(user_id, urlDatabase);
  // 4. updates the longURL but not shortURL
  thisUserURLs[shortURL].longURL = req.body.longURL;
  return res.redirect('/urls');
});

// DELETE - POST to /urls/:id/delete, handles delete buttons with Auth
app.post("/urls/:id/delete", (req, res) => {
  // 1. checks if you're logged in
  const user_id = req.session.user_id;
  const userObj = users[user_id];
  if (! userObj) return res.status(400).send('You are not logged in. Please <a href="/login">try again<a>');

  // 2. if so, deletes the entire object in urlDatabase
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  return res.redirect('/urls');
});

// UPDATE - POST /urls/:id, should be authenticated users only and if id doesn't exist, error
app.post('/urls/:id', (req, res) => {
  // 1. checks if you're logged in
  const user_id = req.session.user_id;
  const userObj = users[user_id];
  if (! userObj) return res.status(400).send('You are not logged in. Please <a href="/login">try again<a>');

  // 2. checks if you own the particular URL
  const shortURL = req.params.id;
  const thisUserURLs = urlsForUser(user_id, urlDatabase);
  // 3. if not, error 404.
  if(!thisUserURLs[shortURL]) {
    return res.status(404).send('Could not find URL in your account');
  }
});

// ADD - POST to /urls, creates new shortURL and posts another saved URL with Auth
app.post('/urls', (req, res) => {
  // 1. checks if you're logged in
  const user_id = req.session.user_id;
  const userObj = users[user_id];
  if (! userObj) return res.status(400).send('You are not logged in. Please <a href="/login">try again<a>');

  // 2. if so, create the new URL
  let shortURL = generateRandomString();
  // 3. at the NEW shortURL key, we will add BOTH the property longURL AND the userID property
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: user_id,
  };
  return res.redirect(`/urls/${shortURL}`);
});

// 
// ---- GET RENDERING routers ----
// 

// READ - GET method for /login page
app.get('/login', (req, res) => {
  const user_id = req.session.user_id;
  const userObj = users[user_id];
  // 1. if logged in, go to /urls main page
  if(userObj) {
    return res.redirect('/urls');
  }
  // 2. send in template with null user if not logged in for empty header at /login page
  const templateVars = {
    user: null,
  }
  return res.render('urls_login', templateVars);
});

// READ - GET method for our /register form
app.get('/register', (req, res) => {
  const user_id = req.session.user_id;
  const userObj = users[user_id];
  // 1. if already logged in, go to main page
  if(userObj) {
    return res.redirect('/urls');
  }

  // 2. else we pass null user for empty header at /register
  const templateVars = { 
    user: null,
  };
  return res.render('urls_register', templateVars);
});

// READ - GET, redirects / to /urls w Auth || to /login w/o
app.get('/', (req, res) => {
  const user_id = req.session.user_id;
  const userObj = users[user_id];
  // 1. if userObj is falsey (not logged in)
  if (! userObj) {
    return res.redirect('/login');
  }
  // 2. else if logged in, redirects to /urls
  return res.redirect('/urls');
});

// BROWSE - GET, /urls, w Auth, shows index || error w/o Auth
app.get("/urls", (req, res) => {
  // 1. checks if you're logged in
  const user_id = req.session.user_id;
  const userObj = users[user_id];
  if (! userObj) return res.status(400).send('You are not logged in. Please <a href="/login">try again<a>');

  // 2. if so, filter the urls belonging to user
  const thisUserURLs = urlsForUser(user_id, urlDatabase);

  // 3. pass only those URLs into index template to show our unique list
  const templateVars = { 
    user: userObj,
    thisUserURLs: thisUserURLs,
  };
  return res.render("urls_index", templateVars);
});

// READ - GET /urls/new w Auth || to /login w/o 
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  const userObj = users[user_id];
  // 1. instead of erroring, we go to /login this time
  if (!userObj) {
    return res.redirect('/login');
  }

  // 2. else we pass the entire userObj so we can render correct information
  const templateVars = {
    user: userObj,
  }
  return res.render('urls_new', templateVars);
});

// READ - GET /urls/("/:id") -> ROUTE param in req.params.id (Express feature)
app.get("/urls/:id", (req, res) => {
  // 1. checks if you're logged in
  const user_id = req.session.user_id;
  const userObj = users[user_id];
  // Again, I wanted to reroute to /login, but rubrik says send an error...
  if (! userObj) return res.status(400).send('You are not logged in. Please <a href="/login">try again<a>');

  // 2. checks THIS user's unique URLs, if not found/doesn't own... error
  const shortURL = req.params.id;
  const thisUserURLs = urlsForUser(user_id, urlDatabase);
  if(!thisUserURLs[shortURL]) {
    return res.status(404).send('Could not find URL in your account');
  }
  // 3. else pass the unique list to urls_show for rendering
  const templateVars = {
    id: shortURL,
    longURL: thisUserURLs[shortURL].longURL,
    user: userObj,
  };
  return res.render("urls_show", templateVars);
});

// READ - GET, redirects shortURL href to the website at longURL
// NO Auth necessary
app.get("/u/:id", (req, res) => {
  const reqShortURL = req.params.id;
  // 1. let's check if the request url exists in our database
  for (const shortURL in urlDatabase) {
    const longURL = urlDatabase[shortURL].longURL; // the VALUE at db shortURL (the longURL)
    if (reqShortURL === shortURL) {
      // 2. check for happy path, otherwise the first time we don't match, we get error
      return res.redirect(longURL);
    }
  }
  // 3. if not, we should send a relevant error message
  return res.status(404).send('Invalid shortened URL');
});

// CATCHALL - Error 404 not found
app.get('*', (req, res) => {
  res.status(404).send('The page you are looking for does not exist.');
});

// 
// ----- Server Listen ----- 
// 
// This tells our server to listen on our port
app.listen(PORT, () => {
  console.log(`TinyApp listening on port: ${PORT}!`);
});