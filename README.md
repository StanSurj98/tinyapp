# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Main index of all your URLs"](https://github.com/StanSurj98/tinyapp/blob/main/docs/indexPage.jpg)
!["Edit your URL"](https://github.com/StanSurj98/tinyapp/blob/main/docs/editPage.jpg)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` or `npm start` command.


## Setup  
In `express_server.js`, the dependencies are already imported for users under the:

```js
//
//----- Requirements ----- 
//
``` 

section at the top. 

Feel free to alter the port as you need. Otherwise, after starting up the server, type in the below link in your browser searchbar:

`http://localhost:8080/` 

Just like that, you can start using TinyApp!


## Make an account & Log in
When not logged in, you are not able to create a shortened URL. Register with an email and password on the register page and create an account!

!["The login page!"](https://github.com/StanSurj98/tinyapp/blob/main/docs/loginPage.jpg)

Every account password is hashed using `bcryptjs` for added security, and user authentication is protected through an encrypted cookie with `cookie-session`.

## Creating new URLs and Editing URLs
Use the header navigation tools at the top of the page to go to the relevant features. Here, enter the URLs you wish to shorten or alter an existing shortened URL to lead somewhere else!

## Using a Shortened URL
In your search bar, type in the following:

`http://localhost:8080/u/[shortURLhere]`

Anyone may now access the website you link to with your shortened URL. 

Thank you for using TinyApp!
