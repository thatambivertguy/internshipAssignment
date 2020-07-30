const express=require('express')
const session=require('express-session')
const {db,Users}=require('./Database/db')
const passport=require('./passport/setuppassport')
const app=express()

const hostname = process.env.HOST;
const port = process.env.PORT;


app.set('view engine','hbs')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/',express.static(__dirname+'/public'))

app.use(
    session({
      secret: 'secret_key',
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 1000 * 60 * 60,
      },
    }),
  )

app.use(passport.initialize())
app.use(passport.session())




app.get('/login',(req,res)=>{
    res.render('login')
})


app.get('/signup',(req,res)=>{
    res.render('signup')
})

app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return res.redirect('/signup') }
      if (!user) { return res.send("Wrong password") }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/home')
      });
    })(req, res, next);
  });

app.post('/signup', (req, res) => {
    Users.create({
      username: req.body.username,
      usertype: req.body.usertype,
      password: req.body.password,
    })
      .then((user) => {
        res.redirect('/login')
      })
      .catch((err) => {
        res.redirect('/signup')
      })
  })

app.get('/',checkLoggedIn,(req,res)=>{
    res.send('Welcome Home')
})

app.get('/home',checkLoggedIn,(req,res)=>{
    if(req.user.usertype=='A'){
        res.render('usertypeA')
    }else if(req.user.usertype=='B'){
        res.render('usertypeB')

    }else if(req.user.usertype=='C'){
        res.render('usertypeC')

    }
})

function checkLoggedIn(req, res, next) {
    if (req.user) {
      return next()
    }
    res.redirect('/login')
}

db.sync().then(()=>{
    app.listen(4000,()=>{
        console.log('server started at http://localhost:4000')
    })
    // app.listen(port,()=>{
    // console.log(`Server running at http://${hostname}:${port}/`);
//})
})