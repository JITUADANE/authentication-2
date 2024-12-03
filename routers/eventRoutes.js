const express = require("express");
const router = express.Router();
const Event = require("../models/Event"); // Path to your Event model
const eventController = require('../controllers/eventController')

router
  .get("/", eventController.getAllEvents)
  .get("/:id", eventController.getEventById)
  .post("/", eventController.createEvent)
  .put("/:id", eventController.updateEventById)
  .post("/rsvp", eventController.rsvpEvent)
  .delete("/:id", eventController.deleteEvent);

module.exports = router;
