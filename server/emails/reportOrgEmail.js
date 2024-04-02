import fs from "fs";
import db from "../conn.js"
import express from "express";
import { ObjectId } from "mongodb";
import { transporter } from "./emailUtil.js";
import { allDataPresent } from "../verif/endpoints.js";

const router = express.Router();
const emailTemplate = fs.readFileSync("./emails/emailTemplates/reportOrgTemplate.html", "utf8");

/*
    Description: Report an organization through email to BoilerNow and Org Owner
    Incoming data:
        params:
            userId: string | ObjectId
            orgId: string | ObjectId
        body: {
            "reason": string
        }
    Outgoing data: None
    On Success:
        - 200 : Org reported. -> The org was reported to the BoilerNow account and Org Owner as well as the reporter were notified.
    On Error:
        - 400 : <message> -> The incoming request does not contain the required data fields.
        - 404 : User or org not found. -> The userId or orgId was not found in the db.
        - 500 : Error reporting org. -> There was an error when reporting the org.
*/
router.post('/:userId/:orgId', async (req, res) => {
    const inputDataCheck = allDataPresent(
        ["userId", "orgId"],
        ["reason"],
        req
    );

    if (!inputDataCheck.correct) {
        return res.status(400).send(inputDataCheck.message);
    }

    const userId = new ObjectId(req.params.userId);
    const orgId = new ObjectId(req.params.orgId);
    const reportReason = req.body.reason;

    try {
        const user = await db.collection("users").findOne({ "_id": userId});
        const org = await db.collection("orgs").findOne({ "_id": orgId}); 

        if (!user || !org) {
            return res.status(404).send("User or Org not found.");
        }

        const orgOwner = await db.collection("users").findOne({ "_id": org.owner});
        const reportTime = new Date();
        
        const mailOptions = {
            from: '"Team BoilerNow" boilernow2023@gmail.com',
            to: 'boilernow2023@gmail.com', 
            bcc: [orgOwner.login.email, user.login.email],
            subject: `Organization Reported!`,
            html: emailTemplate.replace("{{reporterName}}", user.name)
                            .replace("{{reporterEmail}}", user.login.email)
                            .replace("{{time}}", reportTime)
                            .replace("{{reason}}", reportReason)
                            .replace("{{name}}", org.name)
                            .replace("{{owner}}", orgOwner.name)
        };
        
        await transporter.sendMail(mailOptions);
        res.status(200).send("Org Report Email Shared.");

    } catch (e) {
        console.error(e);
        res.status(500).send('Error reporting org.');
    }
});

export default router;