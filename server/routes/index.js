import express from "express";
import db from "../conn.js";

const router = express.Router();

router.get('/', async (req, res) => {
    // test connection to database
	try {
		var results = await db
			.collection("users")
			.find({})
			.toArray();

		console.log(results);
		res.json(results);
		
	} catch (e) {
		console.log(e);
		res.status(500).send("Internal Server Error");
	}
});

export default router;