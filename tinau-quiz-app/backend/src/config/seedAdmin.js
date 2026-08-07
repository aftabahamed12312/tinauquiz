const bcrypt = require("bcryptjs");
const User = require("../models/User");

/**
 * Ensures the default System Admin account exists.
 * Runs once on server startup, right after the DB connection is established.
 */
const seedAdmin = async () => {
  try {
    const email = (process.env.ADMIN_EMAIL || "ADMIN@tinau.com").toLowerCase();
    const plainPassword = process.env.ADMIN_PASS || "tebs@2056";

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log(`ℹ️  Admin already exists (${existingAdmin.email})`);
      return;
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await User.create({
      name: "System Administrator",
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log(`✅ Default admin seeded: ${email}`);
  } catch (err) {
    console.error("❌ Failed to seed default admin:", err.message);
  }
};

module.exports = seedAdmin;
