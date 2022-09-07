const getUserByEmail = (database, user_email) => {
  // 1. find the user obj by email in a database
  // 1.1) look thru each of the database's user_ids
  for (const user_id in database) {
    // 1.2) check if the email at that user_ids match the email being registered
    if (database[user_id].email === user_email) {
      return database[user_id];
    }
  }
  // 2. if not found, return null
  return null;
};

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

getUserByEmail(users, "user2@example.com");




module.exports = getUserByEmail;