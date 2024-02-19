import express from "express";
import fs from "fs";
import db from "../../conn.js";
import { ObjectId } from "mongodb";

const router = express.Router();


// All events
router.get('/', async (req, res) => {
    console.log("Get all events.");
    
    console.log(req.query);
    const filterYear = +req.query.year;
    const filterMonth = +req.query.month + 1;

    try {
        var results = await db
            .collection("events")
            .find({
                $expr: {
                    $and: [
                        { $eq: [{ $year: "$eventStartDatetime"}, filterYear]},
                        { $eq: [{ $month: "$eventStartDatetime"}, filterMonth]}
                    ]
                }
            })
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
    console.log(req.body)

    const eventData = req.body;
    const newEventObj = JSON.parse(fs.readFileSync("./routes/events/dbTemplates/newEventTemplate.json", "utf8"));
    const userId = new ObjectId(eventData.createdBy);

    // Set event details
    newEventObj.name = eventData.title;
    newEventObj.description = eventData.description;
    newEventObj.category = eventData.category;
    newEventObj.location = eventData.location;
    newEventObj.eventStartDatetime = new Date(eventData.startDate);
    newEventObj.eventEndDatetime = new Date(eventData.endDate);
    newEventObj.capacityLimit = +eventData.capacity;
    newEventObj.usersInterested = [userId];
    newEventObj.visibility.type = eventData.status;
    newEventObj.belongsToOrg = new ObjectId();
    newEventObj.createdByUser = userId;
    newEventObj.createdDatetime = new Date()

    try {
        const results = await db.collection("events").insertOne(newEventObj);

        const userResult = await db.collection("users").updateOne(
            { _id: userId },
            { $push: { hostedEvents: results.insertedId } }
        );

        if (userResult.matchedCount === 0) {
            throw new Error('Host user not found.');
        }
        if (userResult.modifiedCount === 0) {
            throw new Error('Failed to update user with the new event.');
        }

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

// get events created by a user
router.get('/user-events/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(userId)
        const events = await db.collection('events').find({ createdByUser: new ObjectId(userId) }).toArray();
        console.log(events)
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Error fetching events');
    }
});

// Modify existing event
router.patch('/update/:eventid', async (req, res) => {
    try {
        const { eventid } = req.params;
        console.log(eventid)

        const eventData = req.body;
        console.log(eventData)

        // Set event details
        const updatedEvent = {
            "name": eventData.title,
            "description": eventData.description,
            "category": eventData.category,
            "location": eventData.location,
            "eventStartDatetime": new Date(eventData.startDate),
            "eventEndDatetime": new Date(eventData.endDate),
            "capacityLimit": +eventData.capacity,
            "visibility.type": eventData.status
        }       
    
        const updateResult = await db.collection('events').updateOne(
            { _id: new ObjectId(eventid) },
            { $set: updatedEvent }
        );
    
        if (updateResult.matchedCount === 0) {
            console.log("Event not found");
            return res.status(404).send('Event not found');
        }
    
        if (updateResult.modifiedCount === 0) {
            console.log("No data was changed from before.");
            return res.status(400).send('Event not updated');
        }
    
        res.status(200).send('Event updated successfully');
        console.log("Successfully updated event.")
    } catch (error) {
        console.error('Error updating event:', error);
        //res.status(500).send('Error updating event');
        res.status(500).json(error)
    }
});

// Delete existing event
router.delete('/delete/:eventId', async (req, res) => {
    console.log("Delete existing event route called.");
    
    const { eventId } = req.params;
        
    // Verify id is a valid mongodb ObjectId
    if (!ObjectId.isValid(eventId)) {
        console.log("Invalid eventId");
        return res.status(400).send("Invalid event id."); // 400 Bad Request for client error
    }
    
    try {
        var results = await db
            .collection("events")
            .deleteOne({
                _id: new ObjectId(eventId) // Convert string to ObjectId
            });
            
        console.log(results);
            
        if (results.deletedCount === 1) {
            console.log("Event deleted.")
            res.status(200).send("Event deleted");
        } else {
            console.log("Event not found.");
            res.status(404).send("Event not found."); // 404 Not Found if nothing was deleted
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

        if (results) {
            const eventVisibilityType = results.visibility.type;
            if (eventVisibilityType == "Private" ) { // &&userNotLoggedIn) {
                console.log("This event is set to Private. User must be logged in to view.");
                res.status(400).send("This event is set to Private. User must be logged in to view.");
                return;
            }
            console.log("Event found.");
            res.status(200).json(results);
        } else {
            console.log("Event with id `" + eventId + "` not found.");
            res.status(404).send("Event not found.");
        }        
        
    } catch (e) {
        console.log(e);
        res.status(500).send("Internal Server Error.");
    }
})


export default router;