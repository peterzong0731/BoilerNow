import nodemailer from "nodemailer";

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

export default transporter;