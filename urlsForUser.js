// // This helper function takes in the user_id cookie
// // compares it to the user_ID for each shortURL in our URLS database




// const urlDatabase = {
//   b6UTxQ: {
//     longURL: "https://www.tsn.ca",
//     userID: "aJ48lW",
//   },
//   i3BoGr: {
//     longURL: "https://www.google.ca",
//     userID: "aJ48lW",
//   },
//   h2h13h: {
//     longURL: "https://www.reddit.com",
//     userID: "blash23",
//   },
//   D3hagb: {
//     longURL: "https://www.youtube.com",
//     userID: "fa2h2g",
//   },
//   bxcvr3: {
//     longURL: "https://www.crunchyroll.com",
//     userID: "aJ48lW",
//   },
// };

// const user_ID = "aJ48lW";

const urlsForUser = (user_ID, urlDatabase) => {
  // problem - we're returning too early... need to create new object
  const thisUserURLs = {};
  // 1. look through the urlDatabase
  for (const shortURL in urlDatabase) {
    // 2. at each shortURL, look at the userID property and compare
    if (urlDatabase[shortURL].userID === user_ID) {
      // if the db userID === given user_ID;
      // return the entire shortURL object for that user only in our new object
      thisUserURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return thisUserURLs;
};


// urlsForUser(user_ID)

module.exports = urlsForUser;