const express = require("express");
const { body, validationResult } = require("express-validator");
const Appointment = require("../models/Appointment");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (_req, res) => {
  const appointments = await Appointment.find().sort({ scheduled_date: -1 });
  res.json({ appointments });
});

router.post(
  "/",
  auth,
  [
    body("patient_id").notEmpty(),
    body("doctor_id").notEmpty(),
    body("scheduled_date").notEmpty(),
    body("scheduled_time").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const appointment = await Appointment.create(req.body);
      res.status(201).json({ appointment });
    } catch (err) {
      res.status(500).json({ message: "Failed to create appointment" });
    }
  }
);

module.exports = router;
