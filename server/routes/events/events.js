import express from "express";
import fs from "fs";
import db from "../../conn.js";
import { ObjectId } from "mongodb";

const router = express.Router();
const newEventTemplate = fs.readFileSync("./routes/events/dbTemplates/newEventTemplate.json", "utf8");

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
//router.post('/create', async (req, res) => {
router.get('/create', async (req, res) => {
    console.log("Create new event route called.");
    console.log();

    // Parse template to JavaScript object
    let jsonObj = JSON.parse(newEventTemplate);

    // Modify values
    console.log(req.body);
    jsonObj.createdDateTime = new Date();

    // Insert new document to events collection
    try {
        const results = await db
            .collection("events")
            .insertOne(jsonObj);
        console.log("Inserted new event with _id: " + results['insertedId']);
        res.status(200).send("Successfully created the new event.");

    } catch (e) {
        console.log(e);
        res.status(500).send("Error creating new event");
    }


    // Change back to formatted JSON string for printing
    const printedJson = JSON.stringify(jsonObj, null, 2);

    console.log(printedJson);
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
router.get('/get/:eventId', async (req, res) => {
    console.log("Get specific event route called.");
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
            .findOne({
                _id: new ObjectId(eventId)
            });
        
        console.log(results);
        res.status(200).json(results);
    } catch (e) {
        console.log(e);
        res.status(500).send("Internal Server Error.");
    }
})


export default router;