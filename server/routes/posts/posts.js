import express from "express";
import fs from "fs";
import db from "../../conn.js";

const router = express.Router();
const newPostTemplate = fs.readFileSync("./routes/posts/dbTemplates/newPostTemplate.json", "utf8");


// All posts Route
router.get('/', async (req, res) => {
    console.log("All events route called.");
    res.send("All events route called.");
    console.log();
});

// Create newly created event
router.post('/new', async (req, res) => {
    console.log("Create new event route called.");
    res.send("Create new event route called.");
    console.log();
});

// Modify existing event
router.patch('/update', async (req, res) => {
    console.log("Edit existing event route called.");
    res.send("Edit existing event route called.");
    console.log();
});

// Delete existing event
router.delete('/delete', async (req, res) => {
    console.log("Delete existing event route called.");
    res.send("Delete existing event route called.");
    console.log();
});


export default router;