import { getCurrentFinancialYear } from "../helper/services.js";
import Company from "../models/companyModel.js";

export const createCompany = async (req, res, next) => {
  try {
    const {
      companyName,
      allowManualItemTotals,
      invoicePrefix,
      address,
      ...rest
    } = req.body;

    const invoiceFinancialYear = getCurrentFinancialYear();

    const company = await Company.create({
      companyName,
      address,
      allowManualItemTotals,
      invoicePrefix,
      invoiceFinancialYear,
      ...rest,
    });

    res.status(201).json({
      status: "success",
      data: {
        company,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create company!" });
  }
};

export const getAllCompanies = async (req, res) => {
  const companies = await Company.find();
  res.status(200).json({ status: "success", data: companies });
};

export const getCompanyById = async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) return res.status(404).json({ error: "Company not found" });
  res.status(200).json({ status: "success", data: company });
};

export const updateCompany = async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!company) return res.status(404).json({ error: "Company not found" });
  res.status(200).json({ status: "success", data: company });
};

export const deactivateCompany = async (req, res) => {
  const company = await Company.findByIdAndUpdate(
    req.params.id,
    { isActive: false, deactivatedAt: new Date() },
    { new: true }
  );

  if (!company) {
    return res.status(404).json({ error: "Company not found." });
  }

  await User.updateMany({ company: req.params.id }, { isActive: false });

  res.status(200).json({
    status: "success",
    message: "Company and its users deactivated.",
    company,
  });
};

export const reactivateCompany = async (req, res) => {
  const company = await Company.findByIdAndUpdate(
    req.params.id,
    { isActive: true, deactivatedAt: null },
    { new: true }
  );

  if (!company) {
    return res.status(404).json({ error: "Company not found." });
  }

  await User.updateMany({ company: req.params.id }, { isActive: true });

  res.status(200).json({
    status: "success",
    message: "Company reactivated.",
    company,
  });
};
