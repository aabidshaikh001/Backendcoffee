const mongoose = require("mongoose")

const locationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    subtext: {
      type: String,
    },
    hours: {
      type: String,
      required: true,
    },
    hours2: {
      type: String,
    },
    note: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    coordinates: {
      type: String,
    },
    mapUrl: {
      type: String,
    },
    image: {
      type: String,
      default: "/placeholder.svg",
    },
    imagePublicId: {
      type: String,
    },
    description: {
      type: String,
    },
    amenities: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["active", "coming-soon", "closed"],
      default: "active",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

const Location = mongoose.model("Location", locationSchema)

module.exports = Location

