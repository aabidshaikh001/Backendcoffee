const Location = require("../models/Location")
const cloudinary = require("../config/cloudinary")

// Get all locations
exports.getAllLocations = async (req, res) => {
  try {
    const { status, search } = req.query

    // Build filter object
    const filter = {}
    if (status && status !== "all") filter.status = status
    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }, { address: { $regex: search, $options: "i" } }]
    }

    const locations = await Location.find(filter).sort({ name: 1 })
    res.status(200).json(locations)
  } catch (error) {
    res.status(500).json({ message: "Error fetching locations", error: error.message })
  }
}

// Get location by ID
exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findOne({ id: req.params.id })

    if (!location) {
      return res.status(404).json({ message: "Location not found" })
    }

    res.status(200).json(location)
  } catch (error) {
    res.status(500).json({ message: "Error fetching location", error: error.message })
  }
}

// Create new location
exports.createLocation = async (req, res) => {
  try {
    // Check if location with same ID already exists
    const existingLocation = await Location.findOne({ id: req.body.id })
    if (existingLocation) {
      return res.status(400).json({ message: "A location with this ID already exists" })
    }

    // Handle image upload if it's a base64 string (from frontend preview)
    if (req.body.image && req.body.image.startsWith("data:image")) {
      try {
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.body.image, {
          folder: "aroma-coffee-locations",
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

    const location = new Location(req.body)
    const savedLocation = await location.save()

    res.status(201).json(savedLocation)
  } catch (error) {
    res.status(500).json({ message: "Error creating location", error: error.message })
  }
}

// Update location
exports.updateLocation = async (req, res) => {
  try {
    // Handle image upload if it's a base64 string (from frontend preview)
    if (req.body.image && req.body.image.startsWith("data:image")) {
      try {
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.body.image, {
          folder: "aroma-coffee-locations",
          resource_type: "image",
          transformation: [{ width: 1200, height: 800, crop: "limit" }, { quality: "auto" }],
        })

        // Update the image URL and add publicId
        req.body.image = uploadResult.secure_url
        req.body.imagePublicId = uploadResult.public_id

        // Delete old image if there was one
        const existingLocation = await Location.findOne({ id: req.params.id })
        if (existingLocation && existingLocation.imagePublicId) {
          await cloudinary.uploader.destroy(existingLocation.imagePublicId)
        }
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError)
        // Keep existing image if upload fails
        delete req.body.image
      }
    }

    const location = await Location.findOneAndUpdate({ id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    })

    if (!location) {
      return res.status(404).json({ message: "Location not found" })
    }

    res.status(200).json(location)
  } catch (error) {
    res.status(500).json({ message: "Error updating location", error: error.message })
  }
}

// Delete location
exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findOne({ id: req.params.id })

    if (!location) {
      return res.status(404).json({ message: "Location not found" })
    }

    // Delete image from Cloudinary if it exists
    if (location.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(location.imagePublicId)
      } catch (deleteError) {
        console.error("Error deleting image from Cloudinary:", deleteError)
        // Continue with deletion even if image deletion fails
      }
    }

    await Location.deleteOne({ id: req.params.id })

    res.status(200).json({ message: "Location deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error deleting location", error: error.message })
  }
}

// Get featured locations
exports.getFeaturedLocations = async (req, res) => {
  try {
    const featuredLocations = await Location.find({
      status: "active",
    }).sort({ name: 1 })

    res.status(200).json(featuredLocations)
  } catch (error) {
    res.status(500).json({ message: "Error fetching featured locations", error: error.message })
  }
}

