import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cors from "cors";

// Initialize connection to database
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

