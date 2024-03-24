import fs from "fs";
import db from "../conn.js"
import { transporter, convertDateToEST } from "./emailUtil.js";

const sendNewEventEmail = async (eventObj) => {
    try {
        const org = await db.collection("orgs").findOne({ "_id": eventObj.belongsToOrg});
        const users = await db.collection("users").find({ 
            followingOrgs: { $elemMatch: { $eq: eventObj.belongsToOrg } },
            "emailNotifs.newEventByOrg": true 
        },).toArray();

        let emailTemplate = fs.readFileSync("./emails/emailTemplates/newEventTemplate.html", "utf8");
        let eventImgs = []
        let imgHTML = ""
        let cid = 0
        
        eventObj.images.forEach((img) => {
            let imgPath = `uploads/${img.replace('uploads\\', '')}`;
            let imageContent = fs.readFileSync(imgPath);
            eventImgs.push({
                filename: imgPath,
                content: imageContent,
                cid: 'image' + cid.toString() 
            });
            imgHTML += "<p><img src='cid:image" + cid.toString() + "'></p>\n";
            cid++;
        });
        
        emailTemplate = emailTemplate.replace("{{images}}", imgHTML);

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
                                .replace("{{endTime}}", endTime),
                attachments: eventImgs
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