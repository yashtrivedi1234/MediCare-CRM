const express = require("express");
const { body, validationResult } = require("express-validator");
const Patient = require("../models/Patient");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (_req, res) => {
  const patients = await Patient.find().sort({ created_at: -1 });
  res.json({ patients });
});

router.post(
  "/",
  auth,
  [
    body("first_name").notEmpty(),
    body("last_name").notEmpty(),
    body("phone").notEmpty(),
    body("date_of_birth").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const patient = await Patient.create(req.body);
      res.status(201).json({ patient });
    } catch (err) {
      res.status(500).json({ message: "Failed to create patient" });
    }
  }
);

module.exports = router;
