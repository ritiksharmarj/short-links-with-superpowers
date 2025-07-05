import express from "express";
import * as shortenController from "./controller";

const router = express.Router();

router.route("/").post(shortenController.createShorten);

router.route("/:shortCode").get(shortenController.getOriginalUrl);

export default router;
