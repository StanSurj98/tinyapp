const express = require('express'); // Imports the express module
const app = express();
const PORT = 8080; // Default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Get request to root path "/"
app.get("/", (req, res) => {
  res.send(`Hello!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); // Takes the urlDatabase and display serialized json at this path
});


// This tells our server to listen on our port
app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}!`);
});