// models/User.js
const mongoose = require('mongoose'); // Import mongoose only once

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Attendee', 'Organizer', 'Admin'], default: 'Attendee' },
});

module.exports = mongoose.model('User', userSchema);
