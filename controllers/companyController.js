import Company from "../models/companyModel.js";

export const createCompany = async (req, res, next) => {
  try {
    const { companyName, allowManualItemTotals } = req.body;

    const company = await Company.create({
      companyName,
      allowManualItemTotals,
    });

    res.status(201).json({
      status: "success",
      data: {
        company,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create company!" });
  }
};
