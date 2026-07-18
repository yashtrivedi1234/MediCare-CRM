const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { runSetup, DEMO_ACCOUNTS, DEMO_PASSWORD } = require("../seed");

const router = express.Router();

const signToken = (userId, role) => {
  return jwt.sign({ sub: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

router.post(
  "/register",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("fullName").notEmpty(),
    body("role").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, fullName, role } = req.body;
    try {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const user = await User.create({
        email: email.toLowerCase(),
        full_name: fullName,
        role: role || "patient",
        password_hash,
      });

      return res.status(201).json({ user: user.toJSON() });
    } catch (err) {
      return res.status(500).json({ message: "Registration failed" });
    }
  }
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = signToken(user.id, user.role);
      return res.json({ token, user: user.toJSON() });
    } catch (err) {
      return res.status(500).json({ message: "Login failed" });
    }
  }
);

router.get("/me", auth, async (req, res) => {
  return res.json({ user: req.user.toJSON() });
});

router.post("/setup", async (_req, res) => {
  try {
    const { email, password, created, accounts } = await runSetup();
    return res.json({
      message: created
        ? "Demo accounts and sample data are ready"
        : "Demo accounts already exist — sample data topped up if needed",
      email,
      password,
      accounts,
    });
  } catch (err) {
    return res.status(500).json({ message: "Setup failed" });
  }
});

router.get("/demo-accounts", (_req, res) => {
  return res.json({
    password: DEMO_PASSWORD,
    accounts: DEMO_ACCOUNTS.map(({ email, full_name, role }) => ({
      email,
      password: DEMO_PASSWORD,
      full_name,
      role,
    })),
  });
});

module.exports = router;
