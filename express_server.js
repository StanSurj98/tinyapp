// 
// ----- Requirements -----
// 
const PORT = 8080; // Default port 8080
const express = require('express'); // Imports the express module
const app = express();
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session')



// 
// ----- Helper Functions -----
// 
const generateRandomString = require('./generateRandomString');
const { getUserByEmail } = require('./helpers');
const urlsForUser = require('./urlsForUser');

// 
// ---- Databases ----
// 
const users = {
  // the test users below have non-hashed passwords
  // userRandomID: {
  //   id: "userRandomID",
  //   email: "user@example.com",
  //   password: "purple-monkey-dinosaur",
  // },
  // user2RandomID: {
  //   id: "user2RandomID",
  //   email: "user2@example.com",
  //   password: "dishwasher-funk",
  // },
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID",
  }
};



// 
// ----Middleware----
// 

// Setting EJS as the view engine
app.set("view engine", "ejs");

// This parses the data from a Buffer data type to a string, must be BEFORE routing code
app.use(express.urlencoded({ extended: true })); 
// will add data to "request" object under the key "body".

// NOTE: Middleware that takes in (req, res, next) => {} NEEDS the "next" param
app.use(morgan("dev")); // setup morgan to console.log for us

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

  // if email/pass empty OR user already exists; error 400
  if (!user_email || !user_password) return res.status(400).send("Empty Field");
  if (getUserByEmail(users, user_email)) return res.status(400).send("Enter a unique Email address");

  // getting here, we can register, generate new unique id
  const user_id = generateRandomString();
  // add new user to global users database
  users[user_id] = {
    id: user_id,
    email: user_email,
    password: hashedPassword,
  }

  console.log(users);// to see if new user is added to global object
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
    // 4. when logging in we set the session cookie to be the user.id encrypted
    req.session.user_id = user.id;
    return res.redirect("/urls");
  }
});

// EDIT - POST to /urls/:id/edit with Auth
app.post("/urls/:id/edit", (req, res) => {
  // Anytime GET request sent to /urls - we check for cookies
  const user_id = req.session.user_id;
  const userObj = users[user_id]; // that cookie corresponds to userObj
  // if userObj is falsey (aka. we not logged in)
  if (! userObj) {
    // return res.redirect('/login');
    return res.send('Error 400: You are not logged in');
  }
  const shortURL = req.params.id;
  const thisUserURLs = urlsForUser(user_id, urlDatabase);
  // changed this, shortURLs are now objects themselves. req.body.longURL is still the submitted form data for new longURL
  thisUserURLs[shortURL].longURL = req.body.longURL; // updates the longURL but not shortURL
  return res.redirect('/urls');
});

// DELETE - POST to /urls/:id/delete, handles delete buttons with Auth
app.post("/urls/:id/delete", (req, res) => {
  // 1. checks if you're logged in
  const user_id = req.session.user_id;
  const userObj = users[user_id];
  if (! userObj) return res.send('Error 400: You are not logged in');

  const shortURL = req.params.id;
  delete urlDatabase[shortURL]; // deletes the entire object in urlDatabase
  return res.redirect('/urls');
});

// UPDATE - POST /urls/:id, should be authenticated users only and if id doesn't exist, error
app.post('/urls/:id', (req, res) => {
  // 1. checks if you're logged in
  const user_id = req.session.user_id;
  const userObj = users[user_id];
  if (! userObj) return res.send('Error 400 You are not logged in');

  // 2. checks if you own the particular URL
  const shortURL = req.params.id;
  const thisUserURLs = urlsForUser(user_id, urlDatabase);
  if(!thisUserURLs[shortURL]) {
    return res.status(404).send('Could not find URL in your account');
  }
});

// ADD - POST to /urls, creates new shortURL and posts another saved URL with Auth
app.post('/urls', (req, res) => {
  // 1. checking if cookies for user_id exists
  const user_id = req.session.user_id;
  // 2. checking if that cookie id is a user id in our users database
  const userObj = users[user_id];
  if (! userObj) return res.send('Error 400 You are not logged in');

  // if userObj does exist, we create the new URL
  let shortURL = generateRandomString();
  // at the NEW shortURL key, we will add BOTH the property longURL AND the userID property
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: user_id, // this is found from the cookies
  };
  return res.redirect(`/urls/${shortURL}`);
});

// 
// ---- GET RENDERING routers ----
// 

// READ - GET method for /login page
app.get('/login', (req, res) => {
  // check if logged in by checking the cookie
  const user_id = req.session.user_id;
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
  const user_id = req.session.user_id;
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

// READ - GET, redirects / to /urls w Auth || to /login w/o
app.get('/', (req, res) => {
  // check for cookies
  const user_id = req.session.user_id;
  const userObj = users[user_id];
  // if userObj is falsey (not logged in)
  if (! userObj) {
    return res.redirect('/login');
  }
  // else if logged in, redirects to /urls
  return res.redirect('/urls');
});

// BROWSE - GET, /urls, w Auth, shows index || error w/o Auth
app.get("/urls", (req, res) => {
  // Anytime GET request sent to /urls - we check for cookies
  const user_id = req.session.user_id;
  const userObj = users[user_id]; // that cookie corresponds to userObj
  // if userObj is falsey (aka. we not logged in)
  if (! userObj) {
    // return res.redirect('/login');
    return res.send('Error 400: You are not logged in');
  }

  // We must filter urls by the logged in user's cookies ONLY
  // 1. create our helper function to filter the relevant user_id's URLs only
  // 2. then pass those as the template vars below into the urls_index view
  // 3. what about logged in and empty object?
    // create a check, if empty object, don't display table in urls_index view
  const thisUserURLs = urlsForUser(user_id, urlDatabase);

  // when using EJS template, MUST pass an object
  const templateVars = { 
    user: userObj,
    thisUserURLs: thisUserURLs,
  };
  // otherwise, redirect to /urls and render the index template
  return res.render("urls_index", templateVars);
});

// READ - GET /urls/new w Auth || to /login w/o 
app.get("/urls/new", (req, res) => {
  // Anytime GET request to /urls/new -> we check first for cookies
  const user_id = req.session.user_id;
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

// READ - GET /urls/("/:id") -> ROUTE param in req.params.id (Express feature)
app.get("/urls/:id", (req, res) => {
  // checks login cookies
  const user_id = req.session.user_id;
  const userObj = users[user_id];
  if (!userObj) {
    // return res.redirect('/register');
    return res.status(400).send('You are not logged in');
  }

  // checks THIS user's unique URLs
  const shortURL = req.params.id;
  const thisUserURLs = urlsForUser(user_id, urlDatabase);
  if(!thisUserURLs[shortURL]) {
    return res.status(404).send('Could not find URL in your account');
  }
  const templateVars = {
    id: shortURL,
    longURL: thisUserURLs[shortURL].longURL,
    user: userObj,
  };
  // we want to render the page that shows us our single url
  return res.render("urls_show", templateVars);
});

// READ - GET, redirects shortURL href to the website at longURL
// NO Auth necessary
app.get("/u/:id", (req, res) => {
  const reqShortURL = req.params.id; // the request shortURL typed into the bar
  
  // 1. let's check if the request url exists in our database
  for (const shortURL in urlDatabase) {
    const longURL = urlDatabase[shortURL].longURL; // the VALUE at db shortURL (the longURL)
    // if REQUESTED shortURL matches the db shortURL
    if (reqShortURL === shortURL) {
      // we must check for happy path, otherwise the first time we don't match, we get error
      // we redirect to the VALUE of that shortURL id... the longURL it goes to
      return res.redirect(longURL);
    }
  }
  // 2. if not, we should send a relevant error message
  return res.send('Error 404: invalid shortened URL');
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
  console.log(`Example app listening on port: ${PORT}!`);
  console.log(users); // Want to see the initial users database
});