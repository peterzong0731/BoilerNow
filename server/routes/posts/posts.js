import express from "express";
import fs from "fs";
import db from "../../conn.js";
import { ObjectId } from "mongodb";

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
        - 500 : Error retrieving all posts. -> There was a db error when trying to retrieve all posts.    
*/
router.get('/', async (req, res) => {
    console.log("All posts route called.");

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
                    "posts.postsId": 1,
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
        - 400 : Invalid ID provided. -> The userId is not a valid ObjectId.
        - 404 : The given userId has no posts. -> Either the userID does not match an existing user or the user has no posts.
        - 500 : Error retrieving all posts. -> There was a db error when trying to retrieve all posts.    
*/
router.get('/:userId', async (req, res) => {
    console.log("All posts route called.");

    const userId = req.params.userId;

    if (!ObjectId.isValid(userId)) {
        return res.status(400).send("Invalid ID provided.");
    }

    try {
        const results = await db.collection("users").aggregate([
            { $match: { _id: new ObjectId(userId) } },
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

        console.log(results);
        res.status(200).json(results)

        // if (results[0]) {
        //     res.status(200).json(results);
        // } else {
        //     res.status(404).send("The given userId has no posts.");
        // }

    } catch (e) {
        console.log("Get all posts error:");
        console.log(e);
        res.status(500).send("Error retrieving all posts.");
    }
});


/*  
    Description: Create newly created post
    Incoming data:
        params: 
            userId: string | ObjectId
        body: {
            "title": string,
            "content": string,
            "eventId": ObjectId
        }
    Outgoing data: None
    On Success:
        - 200 : Post published successfully. -> Post was inserted into the user's document.
    On Error:
        - 400 : Invalid ID provided. -> The userId or eventId is not a valid ObjectId.
        - 400 : UserId does not match an existing user. -> The userId is not found in the db.
        - 400 : Post was not published. -> No user document was modified to insert the post.
        - 500 : Error publishing post. -> There was a db error when trying to insert the post.    
*/
router.post('/create/:userId', async (req, res) => {
    console.log("Create new post route called.");
    const userId = req.params.userId;
    const title = req.body.title;
    const content = req.body.content;
    const eventId = req.body.eventId;

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(eventId)) {
        return res.status(400).send("Invalid ID provided.");
    }

    // Fill in data to post object
    const newPostObj = JSON.parse(newPostTemplate);
    newPostObj.postId = new ObjectId();
    newPostObj.title = title;
    newPostObj.content = content;
    newPostObj.eventId = new ObjectId(eventId);
    newPostObj.postedDatetime = new Date();

    // TODO: If image:
    // newPostObj.image = image;

    // Insert post by modifying the user's document
    console.log(newPostObj)
    try {
        const results = await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            { $push: { posts: newPostObj } }
        );

        console.log(results);

        if (results.matchedCount === 0) {
            return res.status(400).send("UserId does not match an existing user.");
        }
    
        if (results.modifiedCount === 0) {
            return res.status(400).send('Post was not published.');
        }

        res.status(200).send('Post published successfully.');

    } catch (e) {
        console.log("Error publishing post: ");
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
        - 400 : Invalid ID provided. -> The userId or postId is not a valid ObjectId.
        - 400 : PostId not found in user's document. -> The postId was not found in userId's posts array. Could be that userId was not found.
        - 400 : Post was not deleted. -> No user document was modified to delete the post.
        - 500 : Error deleting post. -> There was a db error when trying to delete the post.    
*/
router.delete('/delete/:userId/:postId', async (req, res) => {
    console.log("Delete existing event route called.");
    
    const userId = req.params.userId;
    const postId = req.params.postId;

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(postId)) {
        return res.status(400).send("Invalid ID provided.");
    }

    try {
        var results = await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { posts: { postId: new ObjectId(postId) } } }
        );
            
        console.log(results);
            
        if (results.matchedCount === 0) {
            return res.status(400).send("PostId not found in user's document.");
        }
    
        if (results.modifiedCount === 0) {
            return res.status(400).send('Post was not deleted.');
        }

        res.status(200).send('Post deleted successfully.');

    } catch (e) {
        console.log("Error deleting post:");
        console.log(e);
        res.status(500).send("Error deleting post.");
    }
});


export default router;