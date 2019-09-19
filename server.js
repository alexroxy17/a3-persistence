

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('.data/db.json')
const db = low(adapter)
const helmet = require('helmet')

//database
db.defaults({ groceries: [
      {"firstName":"Milk", "lastName":"2"},
      {"firstName":"Bread",  "lastName":"5"},
    ]
  }).write();

app.use(helmet())
app.use(express.static('public'));

app.get("/groceries", function (request, response) {
  var dbGroceries=[];
  var groceries = db.get('groceries').value() 
  groceries.forEach(function(contact) {
    dbGroceries.push([contact.firstName,contact.lastName]); 
  });
  response.send(dbGroceries); 
});


app.post("/groceries", function (request, response) {
  db.get('groceries')
    .push({ firstName: request.query.iName, lastName: request.query.amount})
    .write()
  console.log("New user inserted in the database");
  response.json(db.get('groceries').value())
  console.log(db.get('groceries').value())
});


app.get("/reset", function (request, response) {
  db.get('groceries')
  .remove()
  .write()
  console.log("Database cleared");
  
 
  var groceries= [
      {"firstName":"Milk", "lastName":"2"},
      {"firstName":"Bread",  "lastName":"5"},
  ];
  
  groceries.forEach(function(contact){
    db.get('groceries')
      .push({ firstName: contact.firstName, lastName: contact.lastName})
      .write()
  });
  console.log("Default users added");
  response.redirect("/");
});

app.get("/clear", function (request, response) {
  // removes everything
  db.get('groceries')
  .remove()
  .write()
  console.log("Database cleared");
  response.redirect("/");
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});



//passport
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)  

const users = []
app.set('views', __dirname + '/public/views');
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({secret: '{secret}', name: 'session_id', saveUninitialized: true, resave: true})); //This is the line i use in my code that worked
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


app.get("/", checkAuthenticated, function (request, response) {
  response.render('index',{ name: request.user.name, email: request.user.email })
  
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login')
})

app.get('/email', (req,res) => {
  res.send(req.user.email)
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true 
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}