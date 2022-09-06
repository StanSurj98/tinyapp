const generateRandomString = () => {
  const length = 6; // for a 6 digit random string
  const char = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; // the characters we allow

  let results = "";
  // loop through the characters at a random order, char[randomIndex from num generator]
  for (let i = length; i > 0; i--) {
    results += char[Math.floor(Math.random() * char.length)];
  }
  return results;
};


module.exports = generateRandomString;