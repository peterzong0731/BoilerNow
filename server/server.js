import express from "express";
import cors from "cors";
import cron from "node-cron";
import { Worker } from "worker_threads";
import "./conn.js";

// Routes
import indexRouter from "./routes/index.js";
import eventRouter from "./routes/events/events.js";
import postRouter from "./routes/posts/posts.js";

const app = express();
app.use(cors());
app.use(express.json());

// Connect routes
app.use('/', indexRouter);
app.use('/events', eventRouter);
app.use('/posts', postRouter);

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`Server is running on port: ${port}`);
});

// Schedule email task to check and send emails every 5 minutes. Occurs on separate thread to prevent server from slowing down
//cron.schedule('*/10 * * * * *', () => {
	const worker = new Worker('./emailNotifications/emailWorker.js');
//});

