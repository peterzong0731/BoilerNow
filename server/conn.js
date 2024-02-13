import dotenv from 'dotenv';
import { MongoClient } from "mongodb";

dotenv.config();

const Db = process.env.ATLAS_URL;
const client = new MongoClient(Db);

let db = null;

let conn;
try {
    conn = await client.connect();
    console.log("Connecting to MongoDB...");
    db = conn.db("boilerNow");
} catch(e) {
    console.error(e);
}

console.log("Connected!") 

export default db;