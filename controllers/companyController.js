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

export const getAllCompanies = async (req, res) => {
  const companies = await Company.find();
  res.status(200).json({ status: "success", data: companies });
};

export const getCompanyById = async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) return res.status(404).json({ error: "Company not found" });
  res.status(200).json({ status: "success", data: company });
};

// export const createCompany = async (req, res) => {
//   const company = await Company.create(req.body);
//   res.status(201).json({ status: "success", data: company });
// };

export const updateCompany = async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!company) return res.status(404).json({ error: "Company not found" });
  res.status(200).json({ status: "success", data: company });
};

export const deleteCompany = async (req, res) => {
  const company = await Company.findByIdAndDelete(req.params.id);
  if (!company) return res.status(404).json({ error: "Company not found" });
  res.status(204).json({ status: "success", data: null });
};
