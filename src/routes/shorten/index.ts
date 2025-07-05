import express from "express";
import * as shortenController from "./controller";

const router = express.Router();

router.route("/").post(shortenController.createShortUrl);

router
  .route("/:shortCode")
  .get(shortenController.getOriginalUrl)
  .patch(shortenController.updateShortUrl);

export default router;
