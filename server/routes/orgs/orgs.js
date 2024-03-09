import express from "express";
import fs from "fs";
import db from "../../conn.js";
import { ObjectId } from "mongodb";
import { allDataPresent } from "../../verif/endpoints.js";

const router = express.Router();
const newOrgTemplate = fs.readFileSync("./routes/orgs/dbTemplates/newOrgTemplate.json", "utf8");


/*
    Description: Get specific org
    Incoming data:
        params:
            orgId: string | ObjectId
    Outgoing data:
        {
            "name": string,
            "shorthand": string,
            "orgImg": string,
            "bannerImg": string,
            "bio": string,
            "contactInfo": {
                "email": string,
                "twitter": string,
                "discord": string,
                "phoneNumber": string
            },
            "rating": double,
            "owner": string | ObjectId,
            "contributors": [ObjectId],
            "lastActive": UTC Date,
            "followers": [ObjectId],
            "events": [ObjectId],
            "dateCreated": UTC Date
        }
    On Success:
        - 200 : JSON object containing the org data -> Data will be sent following the Outgoing data structure.
    On Error:
        - 400 : <message> -> The incoming request does not contain the required data fields.
        - 404 : Org not found. -> The org with the given org id does not exist in the db.
        - 500 : Error retrieving org. -> There was a db error when trying to retrieve the org.
*/
router.get('/:orgId', async (req, res) => {
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
        var results = await db.collection("orgs").findOne({ _id: orgId });

        if (!results) {
            console.log("Org not found.");
            return res.status(404).send("Org not found.");
        }

        if (results.orgImg != "") {
            results.orgImg = `http://localhost:8000/uploads/${results.orgImg.replace('uploads\\', '')}`
        }
        if (results.orgImg != "") {
            results.bannerImg = `http://localhost:8000/uploads/${results.orgImg.replace('uploads\\', '')}`
        }
        
        res.status(200).json(results);

    } catch (e) {
        console.log(e);
        res.status(500).send("Error retrieving org.");
    }
});


/*  
    Description: Create new org
    Incoming data:
        body:
            {
                "createdBy": string | ObjectId,
                "name": string,
                "shorthand": string,
                "bio": string,
                "email": string,
                "twitter": string (optional),
                "discord": string (optional),
                "phoneNumber": string (optional)
            }
    Outgoing data: None
    On Success:
        - 201 : Successfuly created the new org. -> The org was added to the db.
    On Error:
        - 400 : <message> -> The incoming request does not contain the required data fields.
        - 500 : Error creating new org. -> There was a db error when trying to create the org.
*/
router.post('/create', async (req, res) => {
    const inputDataCheck = allDataPresent(
        [],
        ["createdBy", "name", "shorthand", "bio", "email"],
        req
    );

    if (!inputDataCheck.correct) {
        return res.status(400).send(inputDataCheck.message);
    }

    const userId = new ObjectId(req.body.createdBy);
    const name = req.body.name;
    const shorthand = req.body.shorthand;
    const bio = req.body.bio;
    const email = req.body.email;
    const twitter = req.body.twitter || "";
    const discord = req.body.discord || "";
    const phoneNumber = req.body.phoneNumber || "";

    const newOrgObj = JSON.parse(newOrgTemplate);

    // Set Org details
    newOrgObj.name = name;
    newOrgObj.shorthand = shorthand;
    newOrgObj.bio = bio;
    // TODO orgImg
    // TODO bannerImg
    newOrgObj.contactInfo.email = email;
    newOrgObj.contactInfo.twitter = twitter;
    newOrgObj.contactInfo.discord = discord;
    newOrgObj.contactInfo.phoneNumber = phoneNumber;
    newOrgObj.owner = userId;
    newOrgObj.followers = [userId];
    newOrgObj.lastActive = new Date();
    newOrgObj.dateCreated = new Date();

    try {
        const results = await db.collection("orgs").insertOne(newOrgObj);

        const user = await db.collection("users").updateOne(
            { _id: userId },
            { $addToSet: { followingOrgs: results.insertedId } }
        );

        console.log("Created new org with _id: " + results.insertedId);
        res.status(201).send("Successfully created the new org.");

    } catch (e) {
        if (e.name === "MongoServerError" && e.code === 121) {
            console.log("Document failed validation:");
            console.log(e.errInfo.details.schemaRulesNotSatisfied[0].propertiesNotSatisfied);
        } else {
            console.log(e);
        }
        res.status(500).send("Error creating new org.");
    }
});


/*  
    Description: Update existing org
    Incoming data:
        body:
            {
                "name": string,
                "shorthand": string,
                "bio": string,
                "email": string,
                "twitter": string (optional),
                "discord": string (optional),
                "phoneNumber": string (optional),
                "owner": string | ObjectId
            }
    Outgoing data: None
    On Success:
        - 200 : Org updated successfully. -> The org was successfully updated in the db.
    On Error:
        - 400 : <message> -> The incoming request does not contain the required data fields.
        - 500 : Error updating org. -> There was a db error when trying to update the org.
*/
router.patch('/update/:orgId', async (req, res) => {
    const inputDataCheck = allDataPresent(
        ["orgId"],
        ["name", "shorthand", "bio", "email", "owner"],
        req
    );

    if (!inputDataCheck.correct) {
        return res.status(400).send(inputDataCheck.message);
    }

    const orgId = new ObjectId(req.params.orgId);
    const name = req.body.name;
    const shorthand = req.body.shorthand;
    const bio = req.body.bio;
    const owner = new ObjectId(req.body.owner);
    const email = req.body.email;
    const twitter = req.body.twitter || "";
    const discord = req.body.twitter || "";
    const phoneNumber = req.body.phoneNumber || "";

    // Set org details
    const orgData = {
        "name": name,
        "shorthand": shorthand,
        "bio": bio,
        "contactInfo": {
            "email": email,
            "twitter": twitter,
            "discord": discord,
            "phoneNumber": phoneNumber
        },
        "owner": owner,
        "lastActive": new Date()
    };

    try {   
        const updateResult = await db.collection('orgs').updateOne(
            { _id: orgId },
            { $set: orgData }
        );
    
        if (updateResult.matchedCount === 0) {
            return res.status(404).send('Org not found.');
        }
    
        if (updateResult.modifiedCount === 0) {
            throw new Error();
        }
    
        res.status(200).send('Org updated successfully.');

    } catch (e) {
        console.log(e);
        res.status(500).send('Error updating org.');
    }
});


/*
    Description: Delete org
    Incoming data:
        params:
            orgId: string | ObjectId
    Outgoing data: None
    On Success:
        - 200 : Org deleted. -> The org was successfully deleted from the db and removed from users' followingOrgs.
    On Error:
        - 400 : <message> -> The incoming request does not contain the required data fields.
        - 404 : Org not found. -> The org with the given org id does not exist in the db.
        - 500 : Error deleting Org. -> There was a db error when trying to delete the org.
*/
router.delete('/delete/:orgId', async (req, res) => {
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
        
        var members = await db.collection("orgs").findOne(
            { _id: orgId },
            { 
                projection: {
                    owner: 1,
                    contributors: 1,
                    followers: 1
                } 
            }
        );

        if (!members) {
            console.log("Couldn't find org to delete.");
            return res.status(404).send("Org not found.");
        }
        
        let followerIds = [members.owner.toString()];
        members.contributors.forEach( (id) => { followerIds.push(id.toString()); });
        members.followers.forEach( (id) => { followerIds.push(id.toString()); });
        followerIds = [...new Set(followerIds)].map(id => new ObjectId(id));

        var result = await db.collection("orgs").deleteOne({ _id: orgId });

        var updateUser = await db.collection("users").updateMany(
            { _id: { $in: followerIds } },
            { $pull: { followingOrgs: orgId } }
        );

        console.log("Org deleted.");
        res.status(200).send("Org deleted.");
  
    } catch (e) {
        console.log(e);
        res.status(500).send("Error deleting org.");
    }
});


/*
    Description: Get list of org members
    Incoming data:
        params:
            orgId: string | ObjectId
    Outgoing data:
        [
            {
                "name": string
            }
        ]
    On Success:
        - 200 : [JSON object with name of org members] -> Data will be sent following the Outgoing data structure.
    On Error:
        - 400 : <message> -> The incoming request does not contain the required data fields.
        - 404 : Org not found. -> The org with the given org id does not exist in the db.
        - 500 : Error retrieving members. -> There was a db error when trying to retrieve the org's members.
*/
router.get('/members/:orgId', async (req, res) => {
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
        var members = await db.collection("orgs").findOne(
            { _id: orgId },
            { 
                projection: {
                    owner: 1,
                    contributors: 1,
                    followers: 1
                } 
            }
        );

        if (!members) {
            console.log("Couldn't find org to delete.");
            return res.status(404).send("Org not found.");
        }

        let followerIds = [members.owner.toString()];
        members.contributors.forEach( (id) => { followerIds.push(id.toString()); });
        members.followers.forEach( (id) => { followerIds.push(id.toString()); });
        followerIds = [...new Set(followerIds)].map(id => new ObjectId(id));
        
        var userObjects = await db.collection("users").find(
            { _id: { $in: followerIds } },
            {
                projection: {
                    _id: 0,
                    name: 1
                }
            }
        ).toArray();

        res.status(200).json(userObjects);

    } catch (e) {
        console.log(e);
        res.status(500).send("Error retrieving members.");
    }



});




export default router;