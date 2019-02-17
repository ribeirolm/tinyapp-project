const express = require("express");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['01234567'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.set("view engine", "ejs")

const urlDatabase = {
  "b6UTxQ": { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  "i3BoGr": { longURL: "https://www.google.ca", userID: "aJ48lW" }
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


function emailLookup(email){
  for(var user in users){
    var user_email = users[user].email;
    if (user_email === email) {
      return users[user];
    }
  }
}

function urlsForUser(id){
  var userURLs = {};
  for (var shortURL in urlDatabase) {
    var userID = urlDatabase[shortURL].userID;
    if (userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// //Compass exercise to send "Hello!" to browser
// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

app.get("/", (req, res) => {
  let templateVars = {
    user : users[req.session.user_id],
    userUrls : urlsForUser(req.session.user_id),
  };
    res.render("urls_index", templateVars);
});

//To turn response to JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


// //Compass exercise to send "Hello World" to browser
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {
  let templateVars = {
    user : users[req.session.user_id],
    userUrls : urlsForUser(req.session.user_id),
  };
    res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID:req.session.user_id}
  if (!req.session.user_id) {
    res.redirect("/")
  } else{
  res.redirect("/urls");
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user : users[req.session.user_id],
    urls : urlDatabase
  };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  var shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(403).send("This page does not exist!")
  } else {
    let templateVars = {
    user : users[req.session.user_id],
    shortURL : req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
    };
    if (req.session.user_id) {
      if (req.session.user_id === urlDatabase[shortURL].userID) {
        // urlDatabase[shortURL].longURL = req.body.longURL;
        res.render("urls_show", templateVars);
      } else {
      res.status(403).send("You are not the creator of this short URL therefore, you are unable to edit it!")
      }
    } else {
    res.redirect("/");
    }
  }
});

app.get("/u/:shortURL", (req, res) => {
  var shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    var longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(403).send("This page does not exist!")
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  var shortURL = req.params.shortURL;
  if (!req.session.user_id) {
    res.redirect("/")
  } else {
    if (req.session.user_id === urlDatabase[shortURL].userID) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    } else {
      res.status(403).send ("You are not the creator of this short URL therefore, you are unable to edit it!")
    }
  }
});

app.post("/urls/:shortURL/update", (req, res) => {
  var shortURL = req.params.shortURL;
  if (!req.session.user_id) {
    res.redirect("/")
  } else {
    if (req.session.user_id === urlDatabase[shortURL].userID) {
      urlDatabase[shortURL].longURL = req.body.longURL;
      res.redirect("/urls");
    } else {
      res.status(403).send ("You are not the creator of this short URL therefore, you are unable to edit it!")
    }
  }
});



app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls")
  } else {
    let templateVars = {
      email : req.params.email,
      password: req.params.password,
    };
    res.render("app_register", templateVars);
  }
});


app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === ""){
    res.status(400).send('You forgot to input an email or a password!');
  } else if (emailLookup(req.body.email)) {
    res.status(400).send('This email address is already registered.');
  } else {
    var user_id = generateRandomString();
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
      users[user_id] = {
        id: user_id,
        email: email,
        password: hashedPassword
      };
      req.session.user_id = users[user_id].id;
      res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls")
  } else {
    let templateVars = {
    email : req.params.email,
    password: req.params.password
    };
    res.render("app_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  var currentUser = emailLookup(req.body.email);
    if (bcrypt.compareSync(req.body.password, currentUser.password) === true) {
      req.session.user_id = currentUser.id;
      res.redirect("/urls");
    } else {
      res.status(403).send('No account was found matching this information.');
    }
});

app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/urls");
});
