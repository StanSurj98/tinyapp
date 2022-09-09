# TinyApp - Shorten your URLs 
## Setup 
Make sure you read the package.json and download all dependencies.

In express_server.js, they are already required in under the:

```//----- Requirements----- ``` 

section at the top. 

Only alter the PORT if you must, otherwise run http://localhost:8080/ once you start the server.


## Starting the server

In your console, type in: 

``` npm start ```

this will tell the server to listen to port: 8080 by default. Just like that, your server for TinyApp is now started!


## How to use TinyApp
### Making an account & logging in
When not logged in, you are not able to create a shortened URL. Register with an email and password with the register page and make an account!

Every account password is hashed for security, and each session has an encrypted cookie.

### Creating new URLs and Editing URLs
Click the corresponding buttons at the top of the header to direct you to the relevant features. Here, enter the URLs you wish to shorten or alter an existing shortened URL to lead somewhere else!

### Going to a Shortened URL
In your search bar, type in the following:

http://localhost:8080/u/[shortURLhere]

Anyone can now access the website you are linking to with your shortened URL!

Thank you for using TinyApp!
