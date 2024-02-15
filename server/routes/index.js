import express from "express";
import db from "../conn.js";

const router = express.Router();

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
app.post('/register', function (req, res) {
	console.log(req.body);
});

// POST Route for Login
app.post('/login', function (req, res) {
	console.log(req.body);
});

export default router;