import express from "express";
import db from "../conn.js";
import md5 from "md5";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";


const router = express.Router();

const transporter = nodemailer.createTransport({
	service: 'gmail',
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	auth: {
		user: 'boilernow2023@gmail.com',
		pass: process.env.APP_PASS,
	}
});


// POST Route for /forgotPassword
router.post("/forgotPassword", async function (req, res) {
	const userEmail = req.body.email.toLowerCase();
	try {
		const user = await db.collection("users").findOne({ "login.email": userEmail })
        
        if (user) {
            const secret = process.env.JWT_SECRET + userExists.password;
            const payload = {
                email: userEmail
            };
            const token = jwt.sign(payload, secret, { expiresIn: '15m' });
            const link = `http://localhost:3000/reset-password?email=${encodeURIComponent(userEmail)}&token=${encodeURIComponent(token)}`;
            console.log(userEmail);
            const msg = {
                from: '"Team BoilerNow" boilernow2023@gmail.com',
                to: userEmail,
                subject: 'BoilerNow Password Reset',
                text: `Hello from BoilerNow! Boiler Up! Please click the link to reset your email:\n${link}.\n The link is only valid for 15 minutes.`
            }
            transporter.sendMail(msg, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            console.log("Link Sent Successfuly! Check your inbox!");
        } else {
            console.log('User Not Found');
            res.status(500).send("User Not Found");
            // redirect
        }
	} catch (e) {
		console.log(e);
		res.status(500).send("Error fetching user");
		// redirect
	}
});


router.get("/reset-password/:email/:token", async function (req, res) {
	const email = req.params.email.toLowerCase();
    const token = req.params.token;
    try {
	    const user = await db.collection("users").findOne({ "login.email": email });

        if (user) {
            const secret = process.env.JWT_SECRET + user.password;
            try {
                jwt.verify(token, secret);
                console.log("Verified");
                // TODO: Render Reset Password with Email
                res.redirect(`http://localhost:3000/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);

            } catch (error) {
                console.log(error);
                console.log("Verification Failed");
                res.sendStatus(500);
            }
        } else {
            console.log('Invalid Link, verification failed.');
            res.sendStatus(500);
        }
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

router.post("/reset-password", async function (req, res) {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    
    if (password.length < 6) {
        console.log("Password length is less than 6!");
        res.status(400).send('Password length is less than 6!');
        return;
    }

    try {
        const updateResult = await db.collection("users").updateOne(
            { "login.email": email },
            { "$set": { "login.password": md5(password) } }
        );

        if (updateResult.matchedCount === 0) {
            res.status(404).send('User not found');
        } else {
            console.log('Updated Password');
			res.status(200)        
		}
    } catch (err) {
        console.error(`Failed to update password: ${err}`);
        res.status(500).send('Failed to update password');
    }
});


export default router;