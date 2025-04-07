const MenuItem = require("../models/MenuItem")
const cloudinary = require("../config/cloudinary")
const streamifier = require("streamifier")

// Get all menu items
exports.getAllMenuItems = async (req, res) => {
  try {
    const { category, status, search } = req.query

    // Build filter object
    const filter = {}
    if (category && category !== "all") filter.category = category
    if (status && status !== "all") filter.status = status
    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    const menuItems = await MenuItem.find(filter).sort({ createdAt: -1 })
    res.status(200).json(menuItems)
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu items", error: error.message })
  }
}


exports.getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findOne({ id: id }); // Explicit match on your custom id field

    if (!menuItem) {
      return res.status(404).json({ message: `Menu item with id '${id}' not found.` });
    }

    return res.status(200).json(menuItem);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Create new menu item
exports.createMenuItem = async (req, res) => {
  try {
    // Check if item with same ID already exists
    const existingItem = await MenuItem.findOne({ id: req.body.id })
    if (existingItem) {
      return res.status(400).json({ message: "A menu item with this ID already exists" })
    }

    // Handle image upload if it's a base64 string (from frontend preview)
    if (req.body.image && req.body.image.startsWith("data:image")) {
      try {
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.body.image, {
          folder: "aroma-coffee",
          resource_type: "image",

        })

        // Update the image URL and add publicId
        req.body.image = uploadResult.secure_url
        req.body.imagePublicId = uploadResult.public_id
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError)
        // Continue with default image if upload fails
        req.body.image = "/placeholder.svg"
      }
    }

    const menuItem = new MenuItem(req.body)
    const savedItem = await menuItem.save()

    res.status(201).json(savedItem)
  } catch (error) {
    res.status(500).json({ message: "Error creating menu item", error: error.message })
  }
}

// Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    // Handle image upload if it's a base64 string (from frontend preview)
    if (req.body.image && req.body.image.startsWith("data:image")) {
      try {
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.body.image, {
          folder: "aroma-coffee",
          resource_type: "image",
         
        })

        // Update the image URL and add publicId
        req.body.image = uploadResult.secure_url
        req.body.imagePublicId = uploadResult.public_id

        // Delete old image if there was one
        const existingItem = await MenuItem.findOne({ id: req.params.id })
        if (existingItem && existingItem.imagePublicId) {
          await cloudinary.uploader.destroy(existingItem.imagePublicId)
        }
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError)
        // Keep existing image if upload fails
        delete req.body.image
      }
    }

    const menuItem = await MenuItem.findOneAndUpdate({ id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    })

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" })
    }

    res.status(200).json(menuItem)
  } catch (error) {
    res.status(500).json({ message: "Error updating menu item", error: error.message })
  }
}

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findOne({ id: req.params.id })

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" })
    }

    // Delete image from Cloudinary if it exists
    if (menuItem.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(menuItem.imagePublicId)
      } catch (deleteError) {
        console.error("Error deleting image from Cloudinary:", deleteError)
        // Continue with deletion even if image deletion fails
      }
    }

    await MenuItem.deleteOne({ id: req.params.id })

    res.status(200).json({ message: "Menu item deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error deleting menu item", error: error.message })
  }
}

// Get featured menu items
exports.getFeaturedMenuItems = async (req, res) => {
  try {
    const featuredItems = await MenuItem.find({
      featured: true,
      status: "active",
    }).limit(6)

    res.status(200).json(featuredItems)
  } catch (error) {
    res.status(500).json({ message: "Error fetching featured menu items", error: error.message })
  }
}

// Get menu items by category
exports.getMenuItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params

    const menuItems = await MenuItem.find({
      category,
      status: "active",
    }).sort({ name: 1 })

    res.status(200).json(menuItems)
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu items by category", error: error.message })
  }
}

