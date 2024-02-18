import express from "express";
import db from "../conn.js";
import fs from "fs";
import md5 from "md5";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import passport from 'passport';
import OAuth from 'passport-google-oauth20';
import session from "express-session";

const router = express.Router();
const GoogleStrategy = OAuth.Strategy;
const newUserTemplate = fs.readFileSync("./routes/newUserTemplate.json", "utf8");
const transporter = nodemailer.createTransport({
	service: 'gmail',
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	auth: {
		user: 'boilernow2023@gmail.com',
		pass: process.env.APP_PASS,
	}
});

router.use(
	session({
		secret: "TOPSECRETWORD",
		resave: false,
		saveUninitialized: true,
	})
);
router.use(passport.initialize());
router.use(passport.session());

router.get("/home", (req, res) => {
	// add !req.session.user && 
	if (!req.isAuthenticated()) {
		res.redirect("/login")
		console.log('Log In First');
	} else {
		// res.render("home.ejs");
		console.log('Landed');
	}
});

router.get("/auth/google",
	passport.authenticate('google', { scope: ["profile", "email"] })
);

router.get("/auth/google/boilernow",
	passport.authenticate('google', { failureRedirect: "http://localhost:8000/login" }),
	function (req, res, err) {
		console.log("google login")
		console.log(res.data)
		res.redirect("http://localhost:8000/home");
	});

router.get('/', async (req, res) => {
	// test connection to database
	try {
		var results = await db
			.collection("users")
			.find({})
			.toArray();

		console.log(results);
		res.json(results);

	} catch (e) {
		console.log(e);
		res.status(500).send("Internal Server Error");
	}
});

router.get("/login", (req, res) => {
	// render login page
	console.log("login page rendered");
	res.json("login page rendered");
});

router.get("/register", (req, res) => {
	// render register page
	console.log("register page rendered");
	res.json("register page rendered");
});

// POST Route for Register
router.post('/register', async function (req, res) {
	console.log("Req body: " + req.body);

	if (req.body.password.length < 6) {
		console.log("Password length is less than 6!");
		res.status(500).send('Password length is less than 6!');
		return;
	}

	let jsonObj = JSON.parse(newUserTemplate);

	jsonObj.createdDateTime = new Date();
	jsonObj.name = req.body.name;
	jsonObj.login.email = req.body.email;
	jsonObj.login.password = md5(req.body.password);

	try {
		const user = await db
			.collection("users")
			.findOne({ email: jsonObj.email });
		if (user != null) {
			console.log('User already exists');
			return;
		}
	} catch (e) {
		console.log(e);
		res.status(500).send("Error fetching user");
	}

	if (req.body.email.endsWith('@purdue.edu')) {
		const link = `http://localhost:${process.env.PORT}/verify-user/${req.body.name}/${req.body.email}/${md5(req.body.password)}`;
		const msg = {
			from: '"Team BoilerNow" boilernow2023@gmail.com',
			to: req.body.email,
			subject: 'BoilerNow Email Verification',
			text: `Hello from BoilerNow! Boiler Up! Please click the link to verify your email:\n${link}.\n`
		}
		transporter.sendMail(msg, function (error, info) {
			if (error) {
				console.log(error);
			} else {
				console.log('Email sent: ' + info.response);
			}
		});
		// TODO: Render Home Page
		return;
	}

	// Insert new document to users collection
	try {
		const newUser = await db
			.collection("users")
			.insertOne(jsonObj);
		console.log("Inserted new user with _id: " + newUser['insertedId']);

	} catch (e) {
		console.log(e);
		res.status(500).send("Error creating new user");
	}
});

router.get("/verify-user/:name/:email/:password", async function (req, res) {
	console.log("User Successfully Verified!");

	const { name, email, password } = req.params;

	let jsonObj = JSON.parse(newUserTemplate);
	jsonObj.createdDateTime = new Date();
	jsonObj.name = name;
	jsonObj.login.email = email;
	jsonObj.login.password = md5(password);

	try {
		const user = await db
			.collection("users")
			.findOne({ email: jsonObj.email });
		if (user != null) {
			console.log('User already exists');
			return;
		}
	} catch (e) {
		console.log(e);
		res.status(500).send("Error fetching user");
	}

	// Insert new document to users collection
	try {
		const newUser = await db
			.collection("users")
			.insertOne(jsonObj);
		console.log("Inserted new user with _id: " + newUser['insertedId']);

	} catch (e) {
		console.log(e);
		res.status(500).send("Error creating new user");
	}
});

// POST Route for Login
router.post('/login', async function (req, res) {
	try {
		const { email, password } = req.body;

		const existingUser = await db.collection("users").findOne({ email });

		if (!existingUser) {
			console.log('User Not Found');
			return res.status(404).json({ error: 'User not found' });
		}

		if (existingUser.password !== md5(password)) {
			console.log('Incorrect Password');
			return res.status(401).json({ error: 'Incorrect password' });
		}

		console.log('Successfully Logged in');
		console.log(email);
		res.status(200).json({ user: existingUser });
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// GET Route for /forgotPassword
router.get("/forgotPassword", function (req, res) {
	//res.render("forgotPassword");
});

// POST Route for /forgotPassword
router.post("/forgotPassword", async function (req, res) {
	const userEmail = req.body.username;
	try {
		const user = await db
			.collection("users")
			.findOne({ email: userEmail })
			.then((userExists) => {
				if (userExists != null) {
					const secret = process.env.JWT_SECRET + userExists.password;
					const payload = {
						email: userEmail
					};
					const token = jwt.sign(payload, secret, { expiresIn: '15m' });
					const link = `http://localhost:${process.env.PORT}/reset-password/${userExists.email}/${token}`;
					console.log(userEmail);
					const msg = {
						from: '"Team BoilerNow" boilernow2023@gmail.com',
						to: userEmail,
						subject: 'BoilerNow Password Reset',
						text: `Hello from BoilerNow! Boiler Up! Please click the link to reset your email:\n${link}.\n The link is only valid for 15 minutes.`
					}
					transporter.sendMail(msg, function (error, info) {
						if (error) {
							console.log(error);
						} else {
							console.log('Email sent: ' + info.response);
						}
					});
					console.log("Link Sent Successfuly! Check your inbox!");
				} else {
					console.log('User Not Found');
					res.status(500).send("User Not Found");
					// redirect
				}
			});
	} catch (e) {
		console.log(e);
		res.status(500).send("Error fetching user");
		// redirect
	}
});

router.get("/reset-password/:email/:token", async function (req, res) {
	const { email, token } = req.params;
	const user = await db.collection("users").findOne({ email: email });
	if (user == null) {
		console.log('Invalid Link');
		console.log("Verification Failed");
		res.sendStatus(500);
	}
	const secret = process.env.JWT_SECRET + user.password;
	try {
		jwt.verify(token, secret);
		console.log("Verified");
		// TODO: Render Reset Password with Email
	} catch (error) {
		console.log(error);
		console.log("Verification Failed");
		res.sendStatus(500);
	}
});

router.post("/reset-password", async function (req, res) {
	if (req.body.password.length < 6) {
		console.log("Password length is less than 6!");
		res.status(500).send('Password length is less than 6!');
		return;
	}
	const update = {
		"$set": {
			password: md5(req.body.password)
		}
	};
	const filter = {
		email: req.body.email
	}
	await db.collection("users").findOneAndUpdate(filter, update)
		.then(updatedUser => {
			console.log('Updated Password');
			// Render Login Page
		})
		.catch(err => {
			console.error(`Failed to update password: ${err}`);
		});
});

passport.use(
	"google",
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: "http://localhost:8000/auth/google/boilernow",
			userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
		},
		async (accessToken, refreshToken, profile, cb) => {
			try {
				console.log(profile);
				let jsonObj = JSON.parse(newUserTemplate);
				jsonObj.createdDateTime = new Date();
				jsonObj.name = profile.displayName;
				jsonObj.login.email = profile.emails[0].value;
				jsonObj.login.googleId = profile.id;
				console.log(jsonObj);

				const user = await db
					.collection("users")
					.findOne({ email: jsonObj.email });
				if (user != null) {
					console.log('User already exists');
					return cb(null, user);
				}

				// Insert new document to users collection
				const newUser = await db
					.collection("users")
					.insertOne(jsonObj);
				console.log("Inserted new user with _id: " + newUser['insertedId']);

				return cb(null, newUser);
			} catch (err) {
				return cb(err);
			}
		}
	)
);

passport.serializeUser((user, cb) => {
	cb(null, user);
});

passport.deserializeUser((user, cb) => {
	cb(null, user);
});

// Route to fetch authenticated user's information
router.get('/user', (req, res) => {
  // Check if user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // Extract user information
  const userInfo = {
    name: req.user.name || req.user.name,
    email: req.user.email && req.user.email[0] && req.user.email[0].value
  };

  // Return user information
  res.json(userInfo);
});

export default router;