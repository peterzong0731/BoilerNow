import express from "express";
import db from "../../conn.js";
import fs from "fs";
import md5 from "md5";
import { ObjectId } from 'mongodb'
import { allDataPresent } from "../../verif/endpoints.js";


const router = express.Router();
const newUserTemplate = fs.readFileSync("./routes/users/dbTemplates/newUserTemplate.json", "utf8");

/*  
    Description: Get user information
    Incoming data:
        params:
            userId: string | ObjectId
    Outgoing data: 
        {
            "login": {
                "email": string,
                "isPurdueEmail": bool
            },
            "name": string,
            "bio": string,
			"age": number,
            "emailNotifs": {
                "newEventByOrg": bool,
                "newPostForEvent": bool,
                "upcomingEvents": bool
            },
            "followingOrgs": [ObjectId],
            "interestedEventHistory": [ObjectId],
            "hostedEvents": [ObjectId],
            "posts": [Objects]
        }
    On Success:
        - 200 : JSON object containing the user data -> Data will be sent following the Outgoing data structure.
    On Error:
        - 400 : <message> -> The incoming request does not contain the required data fields.
        - 404 : User not found. -> Cannot find a user with the provided userId.
        - 500 : Error fetching user. -> There was a db error when fetching the user data.
*/
router.get('/user/:userId', async (req, res) => {
	const inputDataCheck = allDataPresent(
		["userId"],
		[],
		req
	);

	if (!inputDataCheck.correct) {
		return res.status(400).send(inputDataCheck.message);
	}

    const userId = req.params.userId;
	console.log("User id: " + userId);

	try {	
		const user = await db.collection('users').findOne(
			{ _id: new ObjectId(userId) },
			{
				projection: {
					_id: 0,
					"login.password": 0,
					"login.googleId": 0,
					createdDatetime: 0
				}
			}
		);

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).send('User not found.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching user.');
    }
});


/*  
    Description: Register new user
    Incoming data:
        body: {
            "email": string,
            "password": string,
            "name": string,
            "age": number
        }
    Outgoing data: 
        {
            "userId": string,
			"name", string
        }
    On Success:
        - 201 : JSON object containing the user id and name -> Data will be sent following the Outgoing data structure.
    On Error:
        - 400 : <message> -> The incoming request does not contain the required data fields.
        - 500 : User with that email already exists. -> An account with the provided email already exists.
        - 500 : Error fetching user. -> There was a db error when checking if the user already exists.    
        - 500 : Error creating new user. -> There was a db error when trying to create the new user.
*/
router.post('/register', async function (req, res) {
	const inputDataCheck = allDataPresent(
		[],
		["email", "password", "name", "age"],
		req
	);

	if (!inputDataCheck.correct) {
		return res.status(400).send(inputDataCheck.message);
	}

    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    const name = req.body.name;
	const age = +req.body.age;

	if (password.length < 6) {
		console.log("Password length is less than 6!");
		res.status(500).send('Password length is less than 6!');
		return;
	}

	const newUserObj = JSON.parse(newUserTemplate);

	// Set user details
	newUserObj.login.email = email;
	newUserObj.login.password = md5(password);
	newUserObj.name = name;
	newUserObj.age = age;
	newUserObj.createdDatetime = new Date();

	// Check if email already exists
	try {
		const user = await db
			.collection("users")
			.findOne({ "login.email": newUserObj.login.email });
		if (user != null) {
			console.log('User already exists');
			res.status(500).send("User with that email already exists.");
			return;
		}
	} catch (e) {
		console.log(e);
		res.status(500).send("Error fetching user.");
	}
	
	if (email.endsWith('@purdue.edu')) {
		newUserObj.isPurdueEmail = true
	}

	// If email is a purdue.edu email, send them an email verification
	// if (email.endsWith('@purdue.edu')) {
	// 	const link = `http://localhost:${process.env.PORT}/verify-user/${name}/${email}/${md5(password)}`;
	// 	const msg = {
	// 		from: '"Team BoilerNow" boilernow2023@gmail.com',
	// 		to: email,
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
		res.status(201).json({ "userId": result.insertedId, "name": name });

	} catch (e) {
		if (e.name === "MongoServerError" && e.code === 121) {
            console.log("Document failed validation:");
            console.log(e.errInfo.details.schemaRulesNotSatisfied[0].propertiesNotSatisfied);
        } else {
		    console.log(e);
        }
		res.status(500).send("Error creating new user.");
	}
});


router.get("/verify-user/:name/:email/:password/:age", async function (req, res) {
	console.log("User Successfully Verified!");

	const name = req.params.name;
	const email = req.params.email.toLowerCase();
	const password = req.params.password;
	const age = +req.params.age;

	const newUserObj = JSON.parse(newUserTemplate);

	// Set user details
	newUserObj.login.email = email;
	newUserObj.login.password = md5(password);
	newUserObj.name = name;
	newUserObj.age = age;
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
		res.status(201).json({ "userId": result.insertedId, "name": name });

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


/*  
    Description: Log in existing user
    Incoming data:
        body: {
            "email": string,
            "password": string
        }
    Outgoing data:
        {
            "userId": string,
			"name": string
        }
    On Success:
        - 200 : JSON object containing the user id and name -> Data will be sent following the Outgoing data structure.
    On Error:
        - 400 : <message> -> The incoming request does not contain the required data fields.
        - 401 : Incorrect password. -> The provided password does not match the associated user's password.
        - 404 : Email not found. -> The provided email address does not match an existing user.
        - 500 : Error logging user in. -> There was a db error when trying to log the user in.
*/
router.post('/login', async function (req, res) {
	const inputDataCheck = allDataPresent(
		[],
		["email", "password"],
		req
	);

	if (!inputDataCheck.correct) {
		return res.status(400).send(inputDataCheck.message);
	}

	const email = req.body.email.toLowerCase();
	const password = req.body.password;

	try {
		const existingUser = await db.collection('users').findOne({ "login.email": email });

		if (!existingUser) {
			console.log("User with email `" + email + "`Not Found");
			return res.status(404).send("Email not found.");
		}

		if (existingUser.login.password !== md5(password)) {
			console.log("Incorrect Password");
			return res.status(401).send("Incorrect password.");
		}

		console.log("Successfully logged in to email: " + email);
		//res.status(200).json({"user": existingUser})
		res.status(200).json({ "userId": existingUser._id, "name": existingUser.name });
	} catch (e) {
		console.error(e);
		res.status(500).send('Error logging user in.');
	}
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


/*  
    Description: Get list of orgs a user is following
    Incoming data:
        params:
            userId: string | ObjectId
    Outgoing data:
        [
            {
                "orgId": string,
                "name": string,
                "shorthand": string
            }
        ]
    On Success:
        - 200 : [JSON object with org id, name, and shorthand] -> Data will be sent following the Outgoing data structure.
    On Error:
        - 400 : <message> -> The incoming request does not contain the required data fields.
        - 500 : Error retrieving list of orgs user is in. -> There was a db error when trying to retrieve list of orgs user is following.
*/
router.get('/user-orgs/:userId', async (req, res) => {
	const inputDataCheck = allDataPresent(
		["userId"],
		[],
		req
	);

	if (!inputDataCheck.correct) {
		return res.status(400).send(inputDataCheck.message);
	}

	const userId = new ObjectId(req.params.userId);

	try {
		var result = await db.collection("users").aggregate([
			{ $match: { _id: userId } },
			{ $unwind: "$followingOrgs" },
			{
				$lookup: {
					from: "orgs",
					localField: "followingOrgs",
					foreignField: "_id",
					as: "orgs"
				}
			},
			{
				$unwind: "$orgs"
			},
			{
				$project: {
					_id: 0,
					orgId: "$orgs._id",
					name: "$orgs.name",
					shorthand: "$orgs.shorthand"
				}
			}
		]).toArray();

		res.status(200).json(result);

	} catch (e) {
		console.error(e);
		res.status(500).send("Error retrieving list of orgs user is following.");
	}
});


/*
    Description: Update user's email notification preferences
    Incoming data:
        params:
            userId: string | ObjectId
        body: {
            "newEventByOrg": bool,
            "newPostForEvent": bool,
            "upcomingEvents": bool
        }
    Outgoing data: None
    On Success:
        - 200 : Notification preferences updated. -> The user's email notifications preferences have been updated.
    On Error:
        - 400 : <message> -> The incoming request does not contain the required data fields.
        - 500 : Error updating notification preferences. -> There was an error when updating notification preferences.
*/
router.patch('/update-user-notif-prefs/:userId', async (req, res) => {
    const inputDataCheck = allDataPresent(
        ["userId"],
        ["newEventByOrg", "newPostForEvent", "upcomingEvents"],
        req
    );

    if (!inputDataCheck.correct) {
        return res.status(400).send(inputDataCheck.message);
    }

    const userId = new ObjectId(req.params.userId);
    const newEvent = req.body.newEventByOrg;
    const newPost = req.body.newPostForEvent;
    const upcomingEvents = req.body.upcomingEvents;

    try {
        await db.collection('users').updateOne(
            { _id: userId },
            {
                $set: { 
                    "emailNotifs.newEventByOrg": newEvent,
                    "emailNotifs.newPostForEvent": newPost,
                    "emailNotifs.upcomingEvents": upcomingEvents
                } 
            }
        );

        res.status(200).send('Notification preferences updated.');

    } catch (e) {
        console.log(e);
        res.status(500).send('Error updating notification preferences.');
    }
});


/*
    Description: Get all events attended by a user
    Incoming data:
        params:
            userId: string | ObjectId
    Outgoing data:
        [
            {
                "_id": string,
                "title": string,
                "category": string
            }
        ]
    On Success:
        - 200 : [Partial event objects] -> Data will be sent following the Outgoing data structure.
    On Error:
        - 400 : <message> -> The incoming request does not contain the required data fields.
        - 404 : User not found. -> The given userId was not found in the db.
        - 500 : Error retrieving events. -> There was a db error when trying to retrieve the user's events.
*/
router.get('/user-attended-events/:userId', async (req, res) => {
    const inputDataCheck = allDataPresent(
        ["userId"],
        [],
        req
    );

    if (!inputDataCheck.correct) {
        return res.status(400).send(inputDataCheck.message);
    }

    const userId = new ObjectId(req.params.userId);

    try {
        const user = await db.collection('users').findOne({ _id: userId });
        if (!user) {
            return res.status(404).send('User not found.');
        }

        const { interestedEventHistory } = user;
        if (!interestedEventHistory || interestedEventHistory.length === 0) {
            return res.status(200).json([]);
        }

        const eventIds = interestedEventHistory.map(id => new ObjectId(id));

        const events = await db.collection('events').find(
            { _id: { $in: eventIds } },
            {
                projection: {
                    _id: 1,
                    title: 1,
                    category: 1
                }
            }
        ).toArray();

        res.status(200).json(events);
    } catch (e) {
        console.error(e);
        res.status(500).send('Error retrieving events.');
    }
});


export default router;