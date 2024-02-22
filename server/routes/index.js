import express from "express";
import db from "../conn.js";
import fs from "fs";
import md5 from "md5";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import passport from 'passport';
import OAuth from 'passport-google-oauth20';
import session from "express-session";
import { ObjectId } from 'mongodb'

const router = express.Router();
const GoogleStrategy = OAuth.Strategy;

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
		const user = req.user;
		res.redirect("http://localhost:3000/profile?user=" + user._id);
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


router.get('/user/:id', async (req, res) => {
	console.log("here")
    try {
        const { id } = req.params;
		console.log(id);

		// Later in your code
		const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
		console.log(user);

        if (user) {
			console.log(user)
            res.status(200).json(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching user');
    }
});

// POST Route for Register
router.post('/register', async function (req, res) {
	const userData = req.body;
	console.log(userData);

	if (userData.password.length < 6) {
		console.log("Password length is less than 6!");
		res.status(500).send('Password length is less than 6!');
		return;
	}

	const newUserObj = JSON.parse(fs.readFileSync("./routes/newUserTemplate.json", "utf8"));

	// Set user details
	newUserObj.login.email = userData.email;
	newUserObj.login.password = md5(userData.password);
	newUserObj.name = userData.name;
	newUserObj.createdDatetime = new Date();

	// Check if email already exists
	try {
		const user = await db
			.collection("users")
			.findOne({ "login.email": newUserObj.login.email });
		if (user != null) {
			console.log('User already exists');
			return;
		}
	} catch (e) {
		console.log(e);
		res.status(500).send("Error fetching user");
	}
	
	if (userData.email.endsWith('@purdue.edu')) {
		newUserObj.isPurdueEmail = true
	}

	// If email is a purdue.edu email, send them an email verification
	// if (userData.email.endsWith('@purdue.edu')) {
	// 	const link = `http://localhost:${process.env.PORT}/verify-user/${userData.name}/${userData.email}/${md5(userData.password)}`;
	// 	const msg = {
	// 		from: '"Team BoilerNow" boilernow2023@gmail.com',
	// 		to: userData.email,
	// 		subject: 'BoilerNow Email Verification',
	// 		text: `Hello from BoilerNow! Boiler Up! Please click the link to verify your email:\n${link}.\n`
	// 	}
	// 	transporter.sendMail(msg, function (error, info) {
	// 		if (error) {
	// 			console.log(error);
	// 		} else {
	// 			console.log('Email sent: ' + info.response);
	// 		}
	// 	});
	// 	// TODO: Render Home Page
	// 	return;
	// }

	// Insert new document to users collection
	try {
		const result = await db.collection("users").insertOne(newUserObj);
		console.log("Inserted new user with _id: " + result.insertedId);
		res.status(200).send("Successfully created new user");

	} catch (e) {
		if (e.name === "MongoServerError" && e.code === 121) {
            console.log("Document failed validation.");
            console.log(e.errInfo);
            res.status(500).send("Document failed validation.");
        } else {
			console.log(e);
			res.status(500).send("Error creating new user");
		}
	}
});


router.get("/verify-user/:name/:email/:password", async function (req, res) {
	console.log("User Successfully Verified!");

	const { name, email, password } = req.params;

	const newUserObj = JSON.parse(fs.readFileSync("./routes/newUserTemplate.json", "utf8"));

	// Set user details
	newUserObj.login.email = email;
	newUserObj.login.password = md5(password);
	newUserObj.name = name;
	newUserObj.createdDatetime = new Date();

	// Check if email already exists
	try {
		const user = await db
			.collection("users")
			.findOne({ "login.email": newUserObj.login.email });
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
		const result = await db.collection("users").insertOne(newUserObj);
		console.log("Inserted new user with _id: " + result.insertedId);
		res.status(200).send("Successfully created new user");

	} catch (e) {
		if (e.name === "MongoServerError" && e.code === 121) {
            console.log("Document failed validation.");
            console.log(e.errInfo);
            res.status(500).send("Document failed validation.");
        } else {
			console.log(e);
			res.status(500).send("Error creating new user");
		}
	}
});


// POST Route for Login
router.post('/login', async function (req, res) {
	try {
		const { email, password } = req.body;

		const existingUser = await db.collection("users").findOne({ "login.email": email });

		if (!existingUser) {
			console.log("User with email `" + email + "`Not Found");
			return res.status(404).json({ error: "User not found" });
		}

		console.log(existingUser)

		if (existingUser.login.password !== md5(password)) {
			console.log("Incorrect Password");
			return res.status(401).json({ error: "Incorrect password" });
		}

		console.log("Successfully logged in to email: " + email);
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
	const userEmail = req.body.email;
	try {
		const user = await db
			.collection("users")
			.findOne({ "login.email": userEmail })
			.then((userExists) => {
				if (userExists != null) {
					const secret = process.env.JWT_SECRET + userExists.password;
					const payload = {
						email: userEmail
					};
					const token = jwt.sign(payload, secret, { expiresIn: '15m' });
					const link = `http://localhost:3000/reset-password?email=${encodeURIComponent(userEmail)}&token=${encodeURIComponent(token)}`;
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
	const user = await db.collection("users").findOne({ "login.email": email });
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
		res.redirect(`http://localhost:3000/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);

	} catch (error) {
		console.log(error);
		console.log("Verification Failed");
		res.sendStatus(500);
	}
});

router.post("/reset-password", async function (req, res) {
    const { email, password } = req.body;
    
    if (password.length < 6) {
        console.log("Password length is less than 6!");
        res.status(400).send('Password length is less than 6!');
        return;
    }

    try {
        const updateResult = await db.collection("users").updateOne(
            { "login.email": email },
            { "$set": { "login.password": md5(password) } }
        );

        if (updateResult.matchedCount === 0) {
            res.status(404).send('User not found');
        } else {
            console.log('Updated Password');
			res.status(200)        
		}
    } catch (err) {
        console.error(`Failed to update password: ${err}`);
        res.status(500).send('Failed to update password');
    }
});

let currentUser = null;

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
				console.log("Google login: " + profile);
				const newUserObj = JSON.parse(fs.readFileSync("./routes/newUserTemplate.json", "utf8"));

				// Set user details
				newUserObj.login.email = profile.emails[0].value;
				newUserObj.login.googleId = profile.id;
				newUserObj.name = profile.displayName;
				newUserObj.createdDatetime = new Date();
				console.log(newUserObj);

				const user = await db.collection("users").findOne({ "login.email": newUserObj.login.email });
				if (user) {
					console.log('User already exists');
					currentUser = user;
					return cb(null, user);
				}

				// Insert new document to users collection
				const newUser = await db.collection("users").insertOne(newUserObj);
				console.log("Inserted new user with _id: " + newUser.insertedId);
				currentUser = user;
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