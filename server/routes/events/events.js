import express from "express";
import fs from "fs";
import db from "../../conn.js";
import { ObjectId } from "mongodb";
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
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
router.post('/create', upload.array('images'), async (req, res) => {
    console.log("Create new event route called.");
    const eventData = req.body;
    eventData.createdDateTime = new Date();

    if (req.files) {
        eventData.images = req.files.map(file => {
            return file.path;
        });
    }

    if (eventData.usersInterested && typeof eventData.usersInterested === 'string') {
        try {
            eventData.usersInterested = JSON.parse(eventData.usersInterested);
        } catch (error) {
            return res.status(400).send("Invalid usersInterested format.");
        }
    }

    if (eventData.usersInterestedNames && typeof eventData.usersInterestedNames === 'string') {
        try {
            eventData.usersInterestedNames = JSON.parse(eventData.usersInterestedNames);
        } catch (error) {
            return res.status(400).send("Invalid usersInterestedNames format.");
        }
    }

    try {
        const results = await db.collection("events").insertOne(eventData);

        const userId = eventData.createdBy;

        const userResult = await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
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
        const events = await db.collection('events').find({ createdBy: userId }).toArray();
        console.log(events)
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Error fetching events');
    }
});

// Modify existing event
//router.patch('/update', async (req, res) => {
router.patch('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id)
        const eventData = req.body;

        console.log(eventData)
    
        const updateResult = await db.collection('events').updateOne(
            { _id: new ObjectId(id) },
            { $set: eventData }
        );
    
        if (updateResult.matchedCount === 0) {
            return res.status(404).send('Event not found');
        }
    
        if (updateResult.modifiedCount === 0) {
            return res.status(400).send('Event not updated');
        }
    
        res.status(200).send('Event updated successfully');
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).send('Error updating event');
    }
});
    


// Delete existing event
//router.delete('/delete', async (req, res) => {
router.delete('/delete/:eventId', async (req, res) => {
    console.log("Delete existing event route called.");
    
    const eventId = req.params.eventId;
        
    // Verify id is a valid mongodb ObjectId
    if (!ObjectId.isValid(eventId)) {
        console.log("Invalid eventId");
        return res.status(400).send("Invalid event id.");
    }
    
    try {
        var results = await db
            .collection("events")
            .deleteOne({
                _id: new ObjectId(eventId)
            });
            
        console.log(results);
            
        if (results.deletedCount === 1) {
            res.status(200).send("Event deleted");
        } else {
            res.status(404).send("Event not found.");
        }
            
    } catch (e) {
        console.log(e);
        res.status(500).send("Internal Server Error.");
    }    
});

// Retrieve specific event
// router.get('/:eventId', async (req, res) => {
//     console.log("Get specific event route called.");
//     console.log();

//     const userId = req.query.userId;
//     const eventId = req.params.eventId;

//     //Verify userId is a valid mongodb ObjectId
//     if (!ObjectId.isValid(userId)) {
//         console.log("Invalid userId");
//         res.status(500).send("Invalid user id.");
//         return;
//     }

//     //Verify eventId is a valid mongodb ObjectId
//     if (!ObjectId.isValid(eventId)) {
//         console.log("Invalid eventId");
//         res.status(500).send("Invalid event id.");
//         return;
//     }

//     console.log(userId)

//     try {
//         var results = await db
//             .collection("events")
//             .findOne({
//                 _id: new ObjectId(eventId),
//                 $or: [
//                     {
//                         "visibility.type": "Public",
//                     },
//                     {
//                         "visibility.type": "Private",
//                         "visibility.allowedUsers": new ObjectId(userId)
//                     }
//                 ]
//             });

//         console.log(results);

//         if (results.length == 0) {
//             res.status(404).send("Event not found.");
//         } else {
//             res.status(200).json(results);
//         }
        
//     } catch (e) {
//         console.log(e);
//         res.status(500).send("Internal Server Error.");
//     }
// })

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

        if (results && results.images) {
            results.images.map(image => `http://localhost:8000/uploads/${image.replace('uploads\\', '')}`);
        }
        
       // console.log(results);
        res.status(200).json(results);
    } catch (e) {
        console.log(e);
        res.status(500).send("Internal Server Error.");
    }
})

// joining an event
router.patch('/join/:eventId/:userId', async (req, res) => {
    const { eventId } = req.params;
    const { userId } = req.params;

    if (!ObjectId.isValid(eventId) || !ObjectId.isValid(userId)) {
        return res.status(400).send("Invalid ID provided.");
    }

    try {
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).send('User not found');
        }
        const userName = user.name;

        const result = await db.collection('events').updateOne(
            { _id: new ObjectId(eventId) },
            {
                $addToSet: {
                    usersInterested: new ObjectId(userId),
                    usersInterestedNames: userName
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send('Event not found');
        }

        if (result.modifiedCount === 0) {
            return res.status(200).send('User already interested or not updated');
        }

        res.status(200).send('User added to the interested list');
    } catch (error) {
        console.error('Error joining event:', error);
        res.status(500).send('Error joining event');
    }
});

// unregister from event
router.patch('/unregister/:eventId/:userId', async (req, res) => {
    console.log("here")
    const { eventId } = req.params;
    const { userId } = req.params;

    if (!ObjectId.isValid(eventId) || !ObjectId.isValid(userId)) {
        return res.status(400).send("Invalid ID provided.");
    }

    try {
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).send('User not found');
        }
        const userName = user.name;

        const result = await db.collection('events').updateOne(
            { _id: new ObjectId(eventId) },
            {
                $pull: {
                    usersInterested: new ObjectId(userId),
                    usersInterestedNames: userName
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send('Event not found');
        }

        if (result.modifiedCount === 0) {
            return res.status(200).send('User was not interested or removal not needed');
        }

        res.status(200).send('User removed from the interested list');
    } catch (error) {
        console.error('Error unregistering from event:', error);
        res.status(500).send('Error unregistering from event');
    }
});


export default router;