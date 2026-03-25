require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

async function seedAdmin() {
    const name = process.env.ADMIN_NAME || 'Billify Admin';
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const phone = process.env.ADMIN_PHONE || '9999999999';

    if (!email || !password) {
        console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in billify-backend/.env');
        process.exit(1);
    }

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        existingUser.name = name;
        existingUser.phone = phone;
        existingUser.role = 'admin';
        existingUser.emailVerified = true;

        if (password) {
            existingUser.password = password;
        }

        await existingUser.save();
        console.log(`Updated admin user: ${email}`);
    } else {
        await User.create({
            name,
            email,
            phone,
            password,
            role: 'admin',
            emailVerified: true,
        });
        console.log(`Created admin user: ${email}`);
    }

    await mongoose.connection.close();
}

seedAdmin().catch(async (error) => {
    console.error('Failed to seed admin user:', error);
    await mongoose.connection.close();
    process.exit(1);
});