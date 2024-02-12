import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from "mongodb";
const Db = process.env.ATLAS_URL;
const client = new MongoClient(Db);
 
let conn;
try {
    conn = await client.connect();
    console.log("Connecting to MongoDB...");
} catch(e) {
    console.error(e);
}

console.log("Connected!")
const db = conn.db("boilerNow");

export default db;