const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdmin = async (req, res) => {
  try {
    const secret = req.headers["x-seed-secret"] || req.body.secret;
    if (!secret || secret !== process.env.SEED_SECRET) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const email = (process.env.ADMIN_EMAIL || "ADMIN@tinau.com").toLowerCase();
    const plainPassword = process.env.ADMIN_PASS || "tebs@2056";

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(200).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    await User.create({
      name: "System Administrator",
      email,
      password: hashedPassword,
      role: "admin",
    });

    return res.status(201).json({ message: "Admin seeded successfully" });
  } catch (err) {
    console.error("Seed admin error:", err);
    return res.status(500).json({ message: "Failed to seed admin", error: err.message });
  }
};

module.exports = { seedAdmin };
