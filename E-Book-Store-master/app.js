require("dotenv").config()

//requiring npm packages
var createError = require('http-errors'),
    express = require("express"),
    app = express(),
    path = require('path'),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    flash = require("connect-flash"),
    LocalStrategy = require("passport-local"),
    FacebookStrategy = require("passport-facebook"),
    GoogleStrategy = require("passport-google-oauth20"),
    passportLocalMongoose = require("passport-local-mongoose"),
    methodOverride = require("method-override"),
    session = require("express-session"),
    cookieParser = require("cookie-parser"),
    request = require("request"),
    async = require("async"),
    nodemailer = require("nodemailer"),
    crypto = require("crypto"),
    logger = require('morgan'),
    sgMail=require("@sendgrid/mail"),
    favicon = require("serve-favicon"),
    MongoStore = require("connect-mongo")(session);

//requiring models
var Book = require("./models/books"),
    BestSelling = require("./models/bestSelling"),
    Comment = require("./models/comments"),
    User = require("./models/user"),
    Cart = require("./models/cart"),
    Maps = require("./models/maps"),
    Review = require("./models/review"),
    Order = require("./models/order");
// seedDB = require("./seeds.js");

//requiring routes
var indexRoutes = require("./routes/index"),
    bookRoutes = require("./routes/books"),
    addDBRoutes = require("./routes/addDB"),
    bestSellingRoutes = require("./routes/bestSelling"),
    commentRoutees = require("./routes/comments"),
    userRoutes = require("./routes/user"),
    reviewRoutes = require("./routes/reviews"),
    cartRoutes = require("./routes/cart");

var url = process.env.mongourl = "mongodb+srv://jeetu:kumar347@jeetukumar.apjlv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect("mongodb://localhost:27017/Jndata", { useNewUrlParser: true,useUnifiedTopology:true ,useCreateIndex: true})
    .then(() => console.log(`Database connected`))
    .catch(err => console.log(`Database connection error: ${err.message}`));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use('/public/images/', express.static('./public/images'));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
//done to make the images directory in the public directory static
app.use('/public/javascripts/', express.static('./public/javascripts'));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();

app.locals.moment = require('moment');

//PASSPORT CONFIGURATION
app.use(session({
    secret: "JN Store",
    //allows encrypted data to be stored during the session rather than storing the username and password a plain text
    resave: true,
    saveUninitialized: true,
    storage: new MongoStore({ mongooseConnection: mongoose.connection }), //so that there is no new connection opened
    cookie: { maxAge: 180 * 60 * 1000 } //how long the session should live before it expires (3hrs)
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
//user authenticate comes in with passport local mongoose
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

var StrategyCallback = function (accessToken, refreshToken, profile, cb) {
    process.nextTick(function () {
        User.findOne({ username: profile.displayName }).exec(function (err, UserFromFacebook) {
            if (err) {
                return cb(err);
            }

            if (UserFromFacebook) {
                return cb(null, UserFromFacebook);
            } else {
                var NewUser = new User();
                NewUser.firstName = profile.displayName;
                NewUser.username = profile.displayName;
                NewUser.token = accessToken;
                NewUser.save(function (err) {
                    if (err) {
                        console.log(err);
                    }
                })

                return cb(null, NewUser);
            }
        })
    })
}

passport.use(new FacebookStrategy({
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
    callbackURL: 'http://localhost:7000/login/facebook/return'
}, StrategyCallback));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:7000/google/auth/callback"
}, StrategyCallback))

// passport.serializeUser(User.serializeUser());
passport.serializeUser(function (user, cb) {
    // console.log(User);
    cb(null, user._id);
});

passport.deserializeUser(function (id, cb) {
    // console.log(User);
    User.findById(id, function (err, user) {
        console.log(user);
        cb(err, user);
    })
});

// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     next(createError(404));
// });

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.session = req.session; // making the session available to the templates
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


app.use("/", indexRoutes);
app.use("/books", bookRoutes);
app.use("/", addDBRoutes);
app.use("/bestSelling", bestSellingRoutes);
app.use("/", commentRoutees);
app.use("/", userRoutes);
app.use("/", cartRoutes);
app.use("/books/:id/reviews", reviewRoutes);

const PORT = process.env.PORT || 7000;

app.listen(PORT, function () {
    console.log(`E-book server started on port ${PORT}`);
});