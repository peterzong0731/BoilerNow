import express from "express";
import db from "../conn.js";
import fs from "fs";
import md5 from "md5";

const router = express.Router();
const newUserTemplate = fs.readFileSync("./routes/newUserTemplate.json", "utf8");

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

	if(req.body.password.length < 6) {
		console.log("Password length is less than 6!");
		res.status(500).send('Password length is less than 6!');
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
            .findOne({email: jsonObj.email});
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
router.post('/login', function (req, res) {
	console.log(req.body);
});

export default router;