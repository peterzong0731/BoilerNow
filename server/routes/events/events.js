import express from "express";
import fs from "fs";
import db from "../../conn.js";
import { ObjectId } from "mongodb";

const router = express.Router();
const newEventTemplate = JSON.parse(fs.readFileSync("./routes/events/dbTemplates/newEventTemplate.json", "utf8"));

// All events
router.get('/', async (req, res) => {
    console.log("All events route called.");
    console.log();

    try {
        var results = await db
            .collection("events")
            .find({})
            .toArray();

        console.log(results);
        res.json(results);

    } catch (e) {
        console.log(e);
        res.status(500).send("Internal Server Error");
    }
});

// Create newly created event
router.post('/create', async (req, res) => {
    console.log("Create new event route called.");
    const eventData = req.body;
    eventData.createdDateTime = new Date();

    try {
        const results = await db.collection("events").insertOne(eventData);
        console.log("Inserted new event with _id: " + results.insertedId);
        res.status(201).send("Successfully created the new event.");
    } catch (e) {
        if (e.name === "MongoServerError" && e.code === 121) {
            console.log("Document failed validation.");
            console.log(e.errInfo);
            res.status(500).json(e.errInfo);
        } else {
            console.log(e);
            res.status(500).send("Error creating new event.");
        }
        
    }
});

// Modify existing event
//router.patch('/update', async (req, res) => {
router.get('/update', async (req, res) => {
    console.log("Edit existing event route called.");
    res.send("Edit existing event route called.");
    console.log();
});


// Delete existing event
//router.delete('/delete', async (req, res) => {
router.get('/delete/:eventId', async (req, res) => {
    console.log("Delete existing event route called.");
    console.log();

    const eventId = req.params.eventId;
    // Verify id is a valid mongodb ObjectId
    if (!ObjectId.isValid(eventId)) {
        console.log("Invalid eventId");
        res.status(500).send("Invalid event id.");
        return;
    }

    try {
        var results = await db
            .collection("events")
            .deleteOne({
                _id: new ObjectId(eventId)
            });
        
        console.log(results);
        
        if (results.deletedCount == 1) {
            res.status(200).send("Event deleted");
        }
        
    } catch (e) {
        console.log(e);
        res.status(500).send("Internal Server Error.");
    }    
});


// Retrieve specific event
router.get('/:eventId', async (req, res) => {
    console.log("Get specific event route called.");
    console.log();

    const userId = req.query.userId;
    const eventId = req.params.eventId;

    // Verify userId is a valid mongodb ObjectId
    if (!ObjectId.isValid(userId)) {
        console.log("Invalid userId");
        res.status(500).send("Invalid user id.");
        return;
    }

    // Verify eventId is a valid mongodb ObjectId
    if (!ObjectId.isValid(eventId)) {
        console.log("Invalid eventId");
        res.status(500).send("Invalid event id.");
        return;
    }

    console.log(userId)

    try {
        var results = await db
            .collection("events")
            .findOne({
                _id: new ObjectId(eventId),
                $or: [
                    {
                        "visibility.type": "Public",
                    },
                    {
                        "visibility.type": "Private",
                        "visibility.allowedUsers": new ObjectId(userId)
                    }
                ]
            });

        console.log(results);

        if (results.length == 0) {
            res.status(404).send("Event not found.");
        } else {
            res.status(200).json(results);
        }
        
    } catch (e) {
        console.log(e);
        res.status(500).send("Internal Server Error.");
    }
})


export default router;