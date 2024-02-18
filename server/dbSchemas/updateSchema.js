import db from "../conn.js";
import fs from "fs";

// NOTE: Indexes are used to ensure uniqueness of fields. To view, add, and drop indexes, you can do so on the Atlas dashboard

// Booleans to control which schema to update
const updateEventsSchema = true;
const updateOrgsSchema = true;
const updateUsersSchema = true;


// Update schema for "events" collection
if (updateEventsSchema) {
    const eventsSchema = JSON.parse(fs.readFileSync("./dbSchemas/eventsCollection.json", "utf8"));
    try {
        await db.command({
            collMod: "events",
            validator: {
                $jsonSchema: eventsSchema
            },
            validationLevel: "off"
        });
        console.log("Successfully updated \"events\" collection schema.");
    } catch (e) {
        console.log(e);
    }
}


// Update schema for "orgs" collection
if (updateOrgsSchema) {
    const orgsSchema = JSON.parse(fs.readFileSync("./dbSchemas/orgsCollection.json", "utf8"));
    try {
        await db.command({
            collMod: "orgs",
            validator: {
                $jsonSchema: orgsSchema
            },
            validationLevel: "off"
        });
        console.log("Successfully updated \"orgs\" collection schema.");
    } catch (e) {
        console.log(e);
    }
}


// Update schema for "users" collection
if (updateUsersSchema) {
    const usersSchema = JSON.parse(fs.readFileSync("./dbSchemas/usersCollection.json", "utf8"));
    try {
        await db.command({
            collMod: "users",
            validator: {
                $jsonSchema: usersSchema
            },
            validationLevel: "off"
        });
        console.log("Successfully updated \"users\" collection schema.");
    } catch (e) {
        console.log(e);
    }
}


process.exit(1);