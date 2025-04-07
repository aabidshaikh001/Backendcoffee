const mongoose = require("mongoose");

// Sub-schema for price options
const priceSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
});

// Main MenuItem schema
const menuItemSchema = new mongoose.Schema(
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
    category: {
      type: String,
      required: true,
      enum: ["coffee", "food", "beverage", "pastry", "other"],
    },
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "active",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: "/placeholder.svg",
    },
    description: {
      type: String,
      required: true,
    },
    longDescription: {
      type: String,
      default: "",
    },
    prices: {
      type: [priceSchema],
      default: [],
    },
    priceRange: {
      type: String,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    nutritionalInfo: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Auto-generate price range before saving
menuItemSchema.pre("save", function (next) {
  if (this.prices && this.prices.length > 0) {
    if (this.prices.length === 1) {
      this.priceRange = this.prices[0].price;
    } else {
      const prices = this.prices.map((p) =>
        parseFloat(p.price.replace("$", ""))
      );
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      this.priceRange = `$${min.toFixed(2)} - $${max.toFixed(2)}`;
    }
  }
  next();
});

const MenuItem = mongoose.model("MenuItem", menuItemSchema);
module.exports = MenuItem;
