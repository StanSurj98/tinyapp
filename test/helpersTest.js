const { assert } = require('chai');
const { getUserByEmail } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', () => {
  it('should return a user with a valid email', () => {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return the correct user object with a valid email', () => {
    const user = getUserByEmail(testUsers, "user2@example.com");
    const expectedUserObj = {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    }
    assert.deepEqual(user, expectedUserObj);
  });

  it('should return a falsey null when passed an invalid email', () => {
    const invalidUser = getUserByEmail(testUsers, "abc@abc.com");
    assert.strictEqual(invalidUser, undefined);
  });
  
  it('should return a falsey null when passed an invalid email', () => {
    const invalidUser = getUserByEmail(testUsers, "");
    assert.strictEqual(invalidUser, undefined);
  });

});