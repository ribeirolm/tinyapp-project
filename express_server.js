const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// const bcrypt = require ("bcrypt");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser('The dog barks loudly when no one is listening'));
app.set("view engine", "ejs")

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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

// //To add a userID to the URL database:
// function addUserIDtoShortURL(shortURL){
//   for (var shortURL in urlDatabase){
//   urlDatabase[shortURL].userID = users["userRandomID"].id;
//   };
// }
// addUserIDtoShortURL("testing");
// console.log(urlDatabase)


function generateRandomString() {
  var randomString = "";
  var possibleChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 7; i++) {
    randomString += possibleChar.charAt(Math.floor(Math.random() * possibleChar.length))
  }
  return(randomString);
}


function emailLookup(email){
  for(var user in users){
    var user_email = users[user].email;
    if (user_email === email) {
      return users[user];
    }
  }
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
  let templateVars = {
    user : req.cookies["user_id"],
    urls : urlDatabase
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
    user : req.cookies["user_id"],
    urls : urlDatabase
  };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.render("app_login", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user : req.cookies["user_id"],
    shortURL : req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  var longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  urlDatabase[shortURL].userID = req.cookies["user_id"];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  var shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {
    email : req.params.email,
    password: req.params.password
  };
  res.render("app_register", templateVars);
});


app.post("/register", (req, res) => {
  // switch(){
  //   case emailLookup(req.body.email)=== true:
  //     res.status(400).send('This email address is already registered.');
  //     break;
  //   case req.body.email === "":
  //     res.status(400).send('You forgot to input an email!');
  //     break;
  //   case req.body.password === "";
  //     res.status(400).send('You forgot to input a password!');
  //     break;
//     case req.body.password === "" && req.body.email === "";
  //     res.status(400).send('You forgot to input an email and password!');
  //     break;
  //   default:
  //     var user_id = generateRandomString();
  //     users[user_id] = {id: user_id, email: req.body.email, password: req.body.password};
  //     res.cookie("user_id", user_id);
  //     res.redirect("/urls");
  // };

  if (req.body.email === "" || req.body.password === ""){
    res.status(400).send('You forgot to input an email or a password!');
  } else if (emailLookup(req.body.email)) {
    res.status(400).send('This email address is already registered.');
  } else {
    var user_id = generateRandomString();
      users[user_id] = {
        id: user_id,
        email: req.body.email,
        password: req.body.password
      };
      res.cookie("user_id", users[user_id]);
      res.redirect("/urls");
  }
});

//User should be directed to the login page
app.get("/login", (req, res) => {
  let templateVars = {
    email : req.params.email,
    password: req.params.password
  };
  res.render("app_login", templateVars);
});

//After selecting login, the user should be redirected to the urls page if their email and password match an existing user
app.post("/login", (req, res) => {
  var currentUser = emailLookup(req.body.email);
  if (!currentUser) {
    res.status(403).send('No account was found matching this information.');
  } else {
    if (req.body.password === currentUser.password) {
      res.cookie("user_id", currentUser);
      res.redirect("/urls");
    } else {
      res.status(403).send('No account was found matching this information.');
    }
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  var shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  var shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;

  console.log(urlDatabase);

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
