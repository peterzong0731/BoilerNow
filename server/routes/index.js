import express from "express";
import db from "../conn.js";
import fs from "fs";
import md5 from "md5";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const router = express.Router();
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
	console.log(req.body);

	if (req.body.password.length < 6) {
		console.log("Password length is less than 6!");
		res.status(500).send('Password length is less than 6!');
		return;
	}

	if (req.body.username.endsWith('@purdue.edu')) {
		const link = `http://localhost:${process.env.PORT}/verify-user/${req.body.name}/${req.body.username}/${md5(req.body.password)}`;
		const msg = {
		  from: '"Team BoilerNow" boilernow2023@gmail.com',
		  to: req.body.username,
		  subject: 'BoilerNow Email Verification',
		  text: `Hello from BoilerNow! Boiler Up! Please click the link to verify your email:\n${link}.\n`
		}
		transporter.sendMail(msg, function(error, info){
		  if (error) {
			console.log(error);
		  } else {
			console.log('Email sent: ' + info.response);
		  }
		});
		// TODO: Render Home Page
		return;
	}

	let jsonObj = JSON.parse(newUserTemplate);

	jsonObj.createdDateTime = new Date();
	jsonObj.name = req.body.username;
	jsonObj.email = req.body.email;
	jsonObj.password = md5(req.body.password);

	try {
		const user = await db
			.collection("users")
			.findOne({ email: jsonObj.email });
		if (user != null) {
			console.log('User already exists');
			console.log(user);
			return;
		}
	} catch (e) {
		console.log(e);
		res.status(500).send("Error fetching user");
	}

	// Insert new document to events collection
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
	var username = req.body.username;
	var userPass = md5(req.body.password);

	try {
		const user = await db
			.collection("users")
			.findOne({ email: username })
			.then((existingUser) => {
				if (existingUser != null) {
					if (existingUser.password == userPass) {
						console.log('Successfully Logged in');
					} else {
						console.log('Incorrect Password');
					}
				} else {
					console.log('User Not Found');
				}
			});
	} catch (e) {
		console.log(e);
		res.status(500).send("Error fetching user");
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

export default router;