import express from "express";
import fs from "fs";
import db from "../../conn.js";

const router = express.Router();
const newUserTemplate = fs.readFileSync("./routes/users/dbTemplates/newUserTemplate.json", "utf8");

export default router;