import fs from "fs";
import db from "../conn.js"
import express from "express";
import { ObjectId } from "mongodb";
import { transporter, convertDateToEST } from "./emailUtil.js";
import { allDataPresent } from "../verif/endpoints.js";

const router = express.Router();
const emailTemplate = fs.readFileSync("./emails/emailTemplates/shareEventTemplate.html", "utf8");

/*
    Description: Share an event through email
    Incoming data:
        params:
            userId: string | ObjectId
            eventId: string | ObjectId
        body: {
            "email": string
        }
    Outgoing data: None
    On Success:
        - 200 : Event shared. -> The event was sent to the recipient's email.
    On Error:
        - 400 : <message> -> The incoming request does not contain the required data fields.
        - 404 : User or event not found. -> The userId or eventId was not found in the db.
        - 500 : Error sharing event. -> There was an error when sharing the event.
*/
router.post('/:userId/:eventId', async (req, res) => {
    const inputDataCheck = allDataPresent(
        ["userId", "eventId"],
        ["email"],
        req
    );

    if (!inputDataCheck.correct) {
        return res.status(400).send(inputDataCheck.message);
    }

    const userId = new ObjectId(req.params.userId);
    const eventId = new ObjectId(req.params.eventId);
    const email = req.body.email;

    try {
        const user = await db.collection("users").findOne({ "_id": userId});
        const event = await db.collection("events").findOne({ "_id": eventId});    

        if (!user || !event) {
            return res.status(404).send("User or event not found.");
        }

        const startTime = convertDateToEST(event.eventStartDatetime);
        const endTime = convertDateToEST(event.eventEndDatetime);
        
        const mailOptions = {
            from: '"Team BoilerNow" boilernow2023@gmail.com',
            to: email,
            subject: `${user.name} shared an event with you!`,
            html: emailTemplate.replace("{{senderName}}", user.name)
                            .replace("{{title}}", event.title)
                            .replace("{{description}}", event.description)
                            .replace("{{location}}", event.location)
                            .replace("{{startTime}}", startTime)
                            .replace("{{endTime}}", endTime)
        };
        
        await transporter.sendMail(mailOptions);
        console.log("Email sent to: " + email);
        res.status(200).send("Event shared.");

    } catch (e) {
        console.error(e);
        res.status(500).send('Error sharing event.');
    }
});

export default router;