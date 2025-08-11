import ClientItem from "../models/clientItemModel.js";

// Get all client items for a specific client
export const getClientItems = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { companyId } = req.user;
    const { category } = req.query; // Add category filter

    const query = {
      clientId,
      companyId,
      isActive: true,
    };

    // Add category filter if provided
    if (category && category !== "all") {
      query.category = category;
    }

    const items = await ClientItem.find(query)
      .populate("clientId")
      .sort({ category: 1, createdAt: -1 }); // Sort by category first, then by creation date

    res.json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error) {
    console.error("Error fetching client items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch client items",
      error: error.message,
    });
  }
};

// Get all items for all clients (with pagination and category filter)
export const getAllClientItems = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { page = 1, limit = 20, search, category } = req.query;

    const query = {
      companyId,
      isActive: true,
    };

    // Add search functionality
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: "i" } },
        { hsnCode: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Add category filter
    if (category && category !== "all") {
      query.category = category;
    }

    const items = await ClientItem.find(query)
      .populate("clientId")
      .sort({ category: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ClientItem.countDocuments(query);

    res.json({
      success: true,
      data: items,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching all client items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch client items",
      error: error.message,
    });
  }
};

// Get all categories for a specific client
export const getClientItemCategories = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { companyId } = req.user;

    const categories = await ClientItem.distinct("category", {
      clientId,
      companyId,
      isActive: true,
    });

    res.json({
      success: true,
      data: categories.sort(),
    });
  } catch (error) {
    console.error("Error fetching client item categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

// Get all categories for all clients in a company
export const getAllCategories = async (req, res) => {
  try {
    const { companyId } = req.user;

    const categories = await ClientItem.distinct("category", {
      companyId,
      isActive: true,
    });

    res.json({
      success: true,
      data: categories.sort(),
    });
  } catch (error) {
    console.error("Error fetching all categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

// Get items grouped by category for a specific client
export const getClientItemsByCategory = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { companyId } = req.user;

    const items = await ClientItem.find({
      clientId,
      companyId,
      isActive: true,
    })
      .populate("clientId")
      .sort({ category: 1, createdAt: -1 });

    // Group items by category
    const groupedItems = items.reduce((acc, item) => {
      const category = item.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});

    res.json({
      success: true,
      data: groupedItems,
      categories: Object.keys(groupedItems).sort(),
      totalItems: items.length,
    });
  } catch (error) {
    console.error("Error fetching client items by category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch client items by category",
      error: error.message,
    });
  }
};

// Create a new client item
export const createClientItem = async (req, res) => {
  try {
    const { clientId, description, unitPrice, hsnCode, company, category } =
      req.body;
    const { _id: userId } = req.user;

    // // Check if item with same description already exists for this client
    // const existingItem = await ClientItem.findOne({
    //   clientId,
    //   company,
    //   description: { $regex: new RegExp(`^${description}$`, "i") },
    //   isActive: true,
    // });

    // if (existingItem) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Item with this description already exists for this client",
    //   });
    // }

    const clientItem = new ClientItem({
      clientId,
      description,
      unitPrice,
      hsnCode,
      company,
      category: category || "General", // Default category if not provided
      createdBy: userId,
    });

    await clientItem.save();
    await clientItem.populate("clientId");

    res.status(201).json({
      success: true,
      message: "Client item created successfully",
      data: clientItem,
    });
  } catch (error) {
    console.error("Error creating client item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create client item",
      error: error.message,
    });
  }
};

// Update a client item
export const updateClientItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, unitPrice, hsnCode, category } = req.body;
    const { companyId } = req.user;

    const clientItem = await ClientItem.findOne({
      _id: id,
      companyId,
      isActive: true,
    });

    if (!clientItem) {
      return res.status(404).json({
        success: false,
        message: "Client item not found",
      });
    }

    // Check if updated description conflicts with existing items
    if (description !== clientItem.description) {
      const existingItem = await ClientItem.findOne({
        clientId: clientItem.clientId,
        companyId,
        description: { $regex: new RegExp(`^${description}$`, "i") },
        isActive: true,
        _id: { $ne: id },
      });

      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: "Item with this description already exists for this client",
        });
      }
    }

    clientItem.description = description;
    clientItem.unitPrice = unitPrice;
    clientItem.hsnCode = hsnCode;
    if (category) {
      clientItem.category = category;
    }

    await clientItem.save();
    await clientItem.populate("clientId");

    res.json({
      success: true,
      message: "Client item updated successfully",
      data: clientItem,
    });
  } catch (error) {
    console.error("Error updating client item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update client item",
      error: error.message,
    });
  }
};

export const deleteClientItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const clientItem = await ClientItem.findOneAndDelete({
      _id: id,
    });

    if (!clientItem) {
      return res.status(404).json({
        success: false,
        message: "Client item not found",
      });
    }

    res.json({
      success: true,
      message: "Client item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting client item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete client item",
      error: error.message,
    });
  }
};
