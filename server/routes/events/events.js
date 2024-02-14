import express from "express";
import fs from "fs";
import db from "../../conn.js";

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
})

// Create newly created event
router.get('/new', async (req, res) => {
    console.log("Create new event route called.");
    console.log();

    // Parse template to JavaScript object
    let jsonObj = JSON.parse(newEventTemplate);

    // modify values
    console.log(req.body);
    jsonObj.createdDateTime = new Date();

    // Insert new document to events collection
    try {
        const results = await db
            .collection("events")
            .insertOne(jsonObj);
        console.log("Inserted new event with _id: " + results['insertedId']);

    } catch (e) {
        console.log(e);
        res.status(500).send("Error creating new event");
    }


    // Change back to formatted JSON string for printing
    const printedJson = JSON.stringify(jsonObj, null, 2);

    console.log(printedJson);
})

// Modify existing event
router.get('/update', async (req, res) => {
    console.log("Edit existing event route called.");
    res.send("Edit existing event route called.");
    console.log();
})

// Delete existing event
router.get('/delete', async (req, res) => {
    console.log("Delete existing event route called.");
    res.send("Delete existing event route called.");
    console.log();
})


export default router;