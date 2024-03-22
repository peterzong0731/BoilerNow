import fs from "fs";
import db from "../conn.js"
import { transporter, convertDateToEST } from "./emailUtil.js";

const emailTemplate = fs.readFileSync("./emails/emailTemplates/newEventTemplate.html", "utf8");

const sendNewEventEmail = async (eventObj) => {
    try {
        const org = await db.collection("orgs").findOne({ "_id": eventObj.belongsToOrg});
        const users = await db.collection("users").find({ 
            followingOrgs: { $elemMatch: { $eq: eventObj.belongsToOrg } },
            "emailNotifs.newEventByOrg": true 
        },).toArray();

        users.forEach(user => {
            let email = user.login.email;
            let startTime = convertDateToEST(eventObj.eventStartDatetime);
            let endTime = convertDateToEST(eventObj.eventEndDatetime);
            let mailOptions = {
                from: '"Team BoilerNow" boilernow2023@gmail.com',
                to: email,
                subject: `${org.name} created a new event!`,
                html: emailTemplate.replace("{{orgName}}", org.name)
                                .replace("{{title}}", eventObj.title)
                                .replace("{{description}}", eventObj.description)
                                .replace("{{location}}", eventObj.location)
                                .replace("{{startTime}}", startTime)
                                .replace("{{endTime}}", endTime)
            };
            transporter.sendMail(mailOptions);
            console.log("New event email sent to: " + email);
        });

    } catch (e) {
        console.log("Error sending new event emails.")
        console.log(e);
    }
};


export { sendNewEventEmail };