import nodemailer from "nodemailer";
import fs from "fs";
import db from "../conn.js"


const emailTemplate = fs.readFileSync("./emailNotifications/emailTemplate.html", "utf8");
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_FROM_USER,
        pass: process.env.EMAIL_PASS
    }
});


async function checkEvents() {
    // Emails set to send 1 day +- 5 minutes before event starts. Milliseconds and seconds are ignored
    const currentDatetime = new Date();
    currentDatetime.setSeconds(0, 0);
    currentDatetime.setDate(currentDatetime.getDate() + 1);

    const pipeline = [
        {   // Filter events to only those occuring in the next ~ 1 day
            $match: {
                'eventDatetime': {
                    $lte: new Date(currentDatetime.getTime() + (5 * 60000)),
                    $gt: new Date(currentDatetime.getTime() - (5 * 60000))
                }
            }
        },
        {   // Join with users collection to get list of users interested in each event
            $lookup: {
                from: 'users',
                localField: 'usersInterested',
                foreignField: '_id',
                as: 'joinedData'
            }
        },
        {
            $unwind: '$joinedData'
        },
        {   // Keep users that have event reminder email notifications on
            $match: {
                'joinedData.emailNotifs.eventReminders': true
            }
        },
        {
            $group: {
                _id: '$_id',
                eventName: {$first: '$eventName'},
                belongsToOrg: {$first: '$belongsToOrg'},
                usersInterested: {
                    $push: {
                        email: '$joinedData.login.email',
                        displayName: '$joinedData.displayName'
                    }
                }
            }
        },
        {   // Join with orgs collection to get event's org info
            $lookup: {
                from: 'orgs',
                localField: 'belongsToOrg',
                foreignField: '_id',
                as: 'joinedData'
            }
        },
        {   // Keep only certain entries
            $project: {
                _id: 0,
                eventName: 1,
                usersInterested: 1,
                'orgName': '$joinedData.name',
                'orgShorthand': '$joinedData.shorthand'
            }
        }
    ];

    var results = await db
        .collection("events")
        .aggregate(pipeline)
        .toArray();

    console.log(results);
    
    // Loop through each event
    results.forEach(event => {
        console.log(event.usersInterested);
        // Loop through each user interested
        event.usersInterested.forEach( user => {
            sendEmail(event, user);
        });
    });
}

function sendEmail(event, user) {
    let email = user.email;
    let name = user.displayName;
    let mailOptions = {
        from: `BoilerNow ${process.env.EMAIL_FROM_USER}`,
        to: process.env.EMAIL_TO_TEST,
        subject: `${event.orgShorthand}'s ${event.eventName} event is coming up!`,
        html: emailTemplate.replace("{{name}}", name)
                           .replace("{{eventName}}", event.eventName)
                           .replace("{{hostName}}", event.orgName)
                           .replace("{{email}}", email)
    }
    
    // For testing purposes so I dont send an email on every run
    const sendEmail = false;
    if (sendEmail) {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.log(err);
            else console.log("Email sent: " + info.response);
        });
    }
}

await checkEvents();

