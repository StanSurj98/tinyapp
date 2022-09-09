// Given DB and email, finds user in global DB, returns user object || undefined.
const getUserByEmail = (database, user_email) => {
  // 1. find the user obj by email in a database
  // 1.1) look thru each of the database's user_ids
  for (const user_id in database) {
    const user = database[user_id]
    // 1.2) check if the email at that user_ids match the email being registered
    if (user.email === user_email) {
      return user;
    }
  }
  // 2. if not found, return null
  return undefined;
};

// A function to help generate unique alphanumeric strings
const generateRandomString = () => {
  const length = 6;
  const char = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let results = "";
  // loop through the characters at a random order, char[randomIndex from num generator]
  for (let i = length; i > 0; i--) {
    results += char[Math.floor(Math.random() * char.length)];
  }
  return results;
};


// Given user_ID and DB, filters through urls that only belong to the user
const urlsForUser = (user_ID, urlDatabase) => {
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

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser
};