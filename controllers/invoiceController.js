import { getCurrentFinancialYear } from "../helper/services.js";
import Company from "../models/companyModel.js";

export const createInvoice = async (req, res, next) => {
  try {
    const { clientName, clientEmail, items } = req.body;

    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    // 1. Get the company
    const targetCompanyId =
      req.user.role === "admin" && req.body.companyId
        ? req.body.companyId
        : req.user.company;

    const company = await Company.findById(targetCompanyId);

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    const currentFY = getCurrentFinancialYear();

    if (company.invoiceFinancialYear !== currentFY) {
      company.invoiceCounter = 1;
      company.invoiceFinancialYear = currentFY;
    }

    // 2. Generate invoice number
    const invoiceNumber = `${company.invoicePrefix}-${currentFY}/${String(
      company.invoiceCounter
    ).padStart(3, "0")}`;

    // 3. Create the invoice
    const invoice = await Invoice.create({
      company: company._id,
      clientName,
      clientEmail,
      items,
      totalAmount,
      invoiceNumber,
    });

    // 4. Increment the company's invoice counter
    company.invoiceCounter += 1;
    await company.save();

    res.status(201).json({
      status: "success",
      data: {
        invoice,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create invoice!" });
    console.log(error);
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ company: req.user.company }).populate(
      "company"
    );

    res.status(200).json({
      status: "success",
      results: invoices.length,
      data: {
        invoices,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices!" });
    console.log(error);
  }
};

export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("company")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: invoices.length,
      data: {
        invoices,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch all invoices!" });
    console.log(error);
  }
};
