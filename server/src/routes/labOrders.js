const express = require("express");
const { body, validationResult } = require("express-validator");
const LabOrder = require("../models/LabOrder");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (_req, res) => {
  const labOrders = await LabOrder.find().sort({ order_date: -1 });
  res.json({ labOrders });
});

router.post(
  "/",
  auth,
  [
    body("patient_id").notEmpty(),
    body("test_name").notEmpty(),
    body("order_date").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const labOrder = await LabOrder.create(req.body);
      res.status(201).json({ labOrder });
    } catch (err) {
      res.status(500).json({ message: "Failed to create lab order" });
    }
  }
);

module.exports = router;
