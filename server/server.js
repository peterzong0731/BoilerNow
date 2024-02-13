import express from "express";
import cors from "cors";
import cron from "node-cron";
import { Worker } from "worker_threads";
import "./conn.js";

// Routes
import index from "./routes/index.js";

const app = express();
app.use(cors());
app.use(express.json());

// Connect routes
app.use(index);

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`Server is running on port: ${port}`);
});

// Schedule email task to check and send emails every 5 minutes. Occurs on separate thread to prevent server from slowing down
//cron.schedule('*/10 * * * * *', () => {
	const worker = new Worker('./emails/emailWorker.js');
//});


