import express from "express";
const router = express.Router();
import db from "../conn.js";

router.get('/', async (req, res) => {
    // test connection to database
	var results = await db
		.collection("users")
		.find({})
		.toArray(function (err, result) {
			if (err) throw err;
			res.json(result);
		});
	console.log(results);

	res.send(results);
});

export default router;