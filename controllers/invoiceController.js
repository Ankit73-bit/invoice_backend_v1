import Invoice from "../models/invoiceModel.js";

// POST api/invoices
export const createInvoice = async (req, res, next) => {
  try {
    const { clientName, clientEmail, items } = req.body;

    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
    const company = req.body.companyId;

    const invoice = await Invoice.create({
      company,
      clientName,
      clientEmail,
      items,
      totalAmount,
    });

    res.status(201).json({
      status: "success",
      data: {
        invoice,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create invoice!" });
  }
};

// GET api/invoices
export const getInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .sort({ createdAt: -1 })
      .populate("company");

    res.status(200).json({
      status: "success",
      results: invoices.length,
      data: {
        invoices,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices!" });
  }
};
