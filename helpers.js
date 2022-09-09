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
  return null;
};

module.exports = {
  getUserByEmail,
};