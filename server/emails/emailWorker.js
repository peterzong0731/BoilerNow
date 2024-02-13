import nodemailer from "nodemailer";
import db from "../conn.js"

// For testing purposes so I dont send an email on every run
const sendEmail = false;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_FROM_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function checkEvents() {
    const pipeline = [
        {
            $match: {
                'activityDateTime': new Date("2024-02-15T05:00:00.000+00:00")
            }
        },
        {
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
        {
            $match: {
                'joinedData.emailNotifications.eventReminders': true
            }
        },
        {
            $group: {
                _id: '$_id',
                eventName: {$first: '$eventName'},
                belongsToOrg: {$first: '$belongsToOrg'},
                usersInterested: {$push: '$joinedData._id'}
            }
        },
        {
            $lookup: {
                from: 'orgs',
                localField: 'belongsToOrg',
                foreignField: '_id',
                as: 'joinedData'
            }
        },
        {
            $project: {
                _id: 0,
                eventName: 1,
                usersInterested: 1,
                'orgName': '$joinedData.name',
                'orgShorthand': '$joinedData.shorthand'
            }
        }
    ];
    var results = await db.collection("events").aggregate(pipeline).toArray( (err) => { 
        if (err) console.log(err);
    });

    results.forEach(event => {
        let mailOptions = {
            from: `BoilerNow ${process.env.EMAIL_FROM_USER}`,
            to: process.env.EMAIL_TO_TEST,
            subject: `${event['orgShorthand']}'s ${event['eventName']} event is coming up!`,
            text: "Text content"
        }
        if (sendEmail) {
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) console.log(err);
                else console.log("Email sent: " + info.response);
            });
        }

        console.log(event);

    });
    
}

//await connectToDatabase();
await checkEvents();

