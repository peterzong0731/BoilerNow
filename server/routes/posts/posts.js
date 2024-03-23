import express from "express";
import fs from "fs";
import db from "../../conn.js";
import { ObjectId } from "mongodb";
import { allDataPresent } from "../../verif/endpoints.js";
import { sendNewPostEmail } from "../../emails/newPostEmail.js";

const router = express.Router();
const newPostTemplate = fs.readFileSync("./routes/posts/dbTemplates/newPostTemplate.json", "utf8");

/*  
    Description: Get all posts
    Incoming data: None
    Outgoing data: 
        [
            {
                "postId": ObjectId,
                "title": string
                "content": string,
                "postedDatetime": UTC Date,
                "likedBy": [ObjectId],
                "replies": [Object],
                "event": Object
            }
        ]
    On Success:
        - 200 : {Array of post objects} -> Data will be sent following the Outgoing data structure.
    On Error:
        - 400 : <message> -> The incoming request does not contain the required data fields.
        - 500 : Error retrieving all posts. -> There was a db error when trying to retrieve all posts.
*/
router.get('/', async (req, res) => {
    const inputDataCheck = allDataPresent(
		[],
		[],
		req
	);

	if (!inputDataCheck.correct) {
		return res.status(400).send(inputDataCheck.message);
	}

    try {
        const results = await db.collection("users").aggregate([
            { $unwind: "$posts" },
            { 
                $lookup: {
                    from: "events",
                    localField: "posts.eventId",
                    foreignField: "_id",
                    as: "event"
                }
            },
            {
                $project: {
                    _id: 0,
                    "posts.postId": 1,
                    "posts.title": 1,
                    "posts.content": 1,
                    "posts.postedDatetime": 1,
                    "posts.likedBy": 1,
                    "posts.replies": 1,
                    "posts.event": { $first: "$event" }
                }
            },
            { $replaceWith: "$posts" }
        ]).toArray();

        res.status(200).json(results);

    } catch (e) {
        console.log("Get all posts error:");
        console.log(e);
        res.status(500).send("Error retrieving all posts.");
    }
});


/*  
    Description: Get all posts by one userId
    Incoming data:
        params:
            userId: string | ObjectId
    Outgoing data: 
        [
            {
                "postId": ObjectId,
                "title": string
                "content": string,
                "postedDatetime": UTC Date,
                "likedBy": [ObjectId],
                "replies": [Object],
                "event": Object
            }
        ]
    On Success:
        - 200 : {Array of post objects} -> Data will be sent following the Outgoing data structure.
    On Error:
        - 400 : <message> -> The incoming request does not contain the required data fields.
        - 500 : Error retrieving all posts. -> There was a db error when trying to retrieve all posts.
*/
router.get('/:userId', async (req, res) => {
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
        const results = await db.collection("users").aggregate([
            { $match: { _id: userId } },
            { $unwind: "$posts" },
            { 
                $lookup: {
                    from: "events",
                    localField: "posts.eventId",
                    foreignField: "_id",
                    as: "event"
                }
            },
            {
                $project: {
                    _id: 0,
                    "posts.postId": 1,
                    "posts.title": 1,
                    "posts.content": 1,
                    "posts.postedDatetime": 1,
                    "posts.likedBy": 1,
                    "posts.replies": 1,
                    "posts.event": { $first: "$event" }
                }
            },
            { $replaceWith: "$posts" }
         ]).toArray();

        res.status(200).json(results)

    } catch (e) {
        console.log("Get all posts error:");
        console.log(e);
        res.status(500).send("Error retrieving all posts.");
    }
});


/*  
    Description: Create new post
    Incoming data:
        params: 
            userId: string | ObjectId
        body: {
            "title": string,
            "content": string,
            "eventId": string | ObjectId
        }
    Outgoing data: None
    On Success:
        - 200 : Post published successfully with postId: <postId> -> Post was inserted into the user's document.
    On Error:
        - 400 : <message> -> The incoming request does not contain the required data fields.
        - 404 : UserId does not match an existing user. -> The userId is not found in the db.
        - 500 : Error publishing post. -> There was a db error when trying to insert the post.
*/
router.post('/create/:userId', async (req, res) => {
    const inputDataCheck = allDataPresent(
		["userId"],
		["title", "content", "eventId"],
		req
	);

	if (!inputDataCheck.correct) {
		return res.status(400).send(inputDataCheck.message);
	}
    
    const userId = new ObjectId(req.params.userId);
    const title = req.body.title;
    const content = req.body.content;
    const eventId = new ObjectId(req.body.eventId);

    // Fill in data to post object
    const newPostObj = JSON.parse(newPostTemplate);
    newPostObj.postId = new ObjectId();
    newPostObj.title = title;
    newPostObj.content = content;
    newPostObj.eventId = eventId;
    newPostObj.postedDatetime = new Date();

    // TODO: If image:
    // newPostObj.image = image;

    // Insert post by modifying the user's document
    try {
        const results = await db.collection("users").updateOne(
            { _id: userId },
            { $push: { posts: newPostObj } }
        );

        if (results.matchedCount === 0) {
            return res.status(404).send("UserId does not match an existing user.");
        }
    
        if (results.modifiedCount === 0) {
            throw new Error('Post was not published.');
        }

        console.log("Post published with postId: " + newPostObj.postId);
        res.status(200).send('Post published successfully with id: ' + newPostObj.postId);

        sendNewPostEmail(newPostObj, userId);

    } catch (e) {
        console.log(e);
        res.status(500).send('Error publishing post.');
    }
});


// Modify existing post
router.patch('/update', async (req, res) => {
    console.log("Edit existing post route called.");
    res.send("Edit existing post route called.");
    console.log();
});


/*  
    Description: Delete existing post
    Incoming data:
        params: 
            userId: string | ObjectId
            postId: string | ObjectId
    Outgoing data: None
    On Success:
        - 200 : Post deleted successfully. -> Post was deleted from the user's document.
    On Error:
        - 400 : <message> -> The incoming request does not contain the required data fields.
        - 500 : Error deleting post. -> There was a db error when trying to delete the post.
*/
router.delete('/delete/:userId/:postId', async (req, res) => {
    const inputDataCheck = allDataPresent(
		["userId", "postId"],
		[],
		req
	);

	if (!inputDataCheck.correct) {
		return res.status(400).send(inputDataCheck.message);
	}
    
    const userId = new ObjectId(req.params.userId);
    const postId = new ObjectId(req.params.postId);

    try {
        var results = await db.collection("users").updateOne(
            { _id: userId },
            { $pull: { posts: { postId: postId } } }
        );

        if (results.modifiedCount === 0) {
            throw new Error('Post was not deleted.');
        }

        res.status(200).send('Post deleted successfully.');

    } catch (e) {
        console.log(e);
        res.status(500).send("Error deleting post.");
    }
});

/*
    Description: Get all posts for a specific org
    Incoming data:
        params:
            orgId: string | ObjectId
    Outgoing data: 
        [
            {
                "postId": ObjectId,
                "title": string
                "content": string,
                "postedDatetime": UTC Date,
                "likedBy": [ObjectId],
                "replies": [Object],
                "event": Object
            }
        ]
    On Success:
        - 200 : {Array of post objects} -> Data will be sent following the Outgoing data structure.
    On Error:
        - 400 : <message> -> The incoming request does not contain the required data fields.
        - 404 : Org not found. -> The given org id does not exist in the db.
        - 500 : Error retrieving all posts. -> There was a db error when trying to retrieve all posts.
*/
router.get('/orgPosts/:orgId', async (req, res) => {
    const inputDataCheck = allDataPresent(
        ["orgId"],
        [],
        req
    );

    if (!inputDataCheck.correct) {
        return res.status(400).send(inputDataCheck.message);
    }

    const orgId = new ObjectId(req.params.orgId);

    try {
        var org = await db.collection("orgs").findOne({ _id: orgId });

        if (!org) {
            console.log("Org not found.");
            return res.status(404).send("Org not found.");
        }

        var eventIds = org.events;

        const results = await db.collection("users").aggregate([
            { $unwind: "$posts" },
            { 
                $match: {
                    "posts.eventId": { $in: eventIds } // Filters posts by eventIds in your list
                }
            },
            { 
                $lookup: {
                    from: "events",
                    localField: "posts.eventId",
                    foreignField: "_id",
                    as: "event"
                }
            },
            {
                $project: {
                    _id: 0,
                    "posts.postId": 1,
                    "posts.title": 1,
                    "posts.content": 1,
                    "posts.postedDatetime": 1,
                    "posts.likedBy": 1,
                    "posts.replies": 1,
                    "posts.event": { $first: "$event" }
                }
            },
            { $replaceWith: "$posts" }
        ]).toArray();

        res.status(200).json(results);

    } catch (e) {
        console.log(e);
        res.status(500).send("Error retrieving all posts.");
    }
});

export default router;