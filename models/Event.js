const Joi = require('joi');
const mongoose= require('mongoose');
const Schema =mongoose.Schema;

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true, // This field is required
        trim: true, // Trims any extra spaces before/after the title
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: Date,
        required: true, // Event must have a date
    },
    time: {
        type: String, // Store the time as a string (e.g., "12:30 PM")
        required: true, 
    },
    location: {
        type: String,
        required: true, // Event must have a location
        trim: true,
    },
    organizerId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the organizer (could be a User model)
        ref: 'User', 
        required: true, 
    },
    ticketDetails: {
        price: {
            type: Number,
            required: true, // Ticket price is required
        },
        availableTickets: {
            type: Number,
            required: true, // Available tickets are required
        },
        soldTickets: {
            type: Number,
            default: 0, // Default to 0 if no tickets have been sold yet
        }
    }, 
    rsvpList: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['attending', 'maybe'], required: true }
      }]

}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Validation schema
// const eventSchemaValidation = Joi.object({
//     title: Joi.string().required().trim(),
//     description: Joi.string().required().trim(),
//     date: Joi.date().required(),
//     time: Joi.string().required().trim(),
//     location: Joi.string().required().trim(),
//     organizerId: Joi.string().required(),
//     ticketDetails: Joi.object({
//       price: Joi.number().required(),
//       availableTickets: Joi.number().required(),
//       soldTickets: Joi.number().default(0),
//     }).required(),
//   });
  

module.exports = mongoose.model('Event', eventSchema);
