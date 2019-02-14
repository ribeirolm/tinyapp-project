var express = require("express");
var cookieParser = require("cookie-parser");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs")

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
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
}



function generateRandomString() {
  var randomString = "";
  var possibleChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 7; i++) {
    randomString += possibleChar.charAt(Math.floor(Math.random() * possibleChar.length))
  }
  return(randomString);
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//To send "Hello!" to browser
app.get("/", (req, res) => {
  res.send("Hello!");
});

//To turn response to JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//To send "Hello World" to browser
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//To render the url index page to view all urls
app.get("/urls", (req, res) => {
  let templateVars = {urls : urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  let templateVars = {urls : urlDatabase, username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {shortURL : req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  var longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  var shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {email : req.params.email, password: req.params.password};
  res.render("app_register", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  var shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});


app.post("/urls/:shortURL/update", (req, res) => {
  var shortURL = req.params.shortURL;
  var updatedLongURL = req.body.longURL;
  urlDatabase[shortURL] = updatedLongURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});
