import calculateInvoiceSummary from "../helper/calculateInvoiceSummary.js";
import convertToWords from "../helper/convertToWords.js";
import getCurrentFinancialYear from "../helper/services.js";
import Company from "../models/companyModel.js";
import Invoice from "../models/invoiceModel.js";
import APIFeatures from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import mongoose from "mongoose";

export const createInvoice = catchAsync(async (req, res, next) => {
  const {
    client,
    consignee,
    items,
    gstType,
    cgstRate,
    sgstRate,
    igstRate,
    fuelSurchargeRate,
    roundingOff = 0,
    ...rest
  } = req.body;

  const targetCompanyId =
    req.user.role === "admin" && req.body.company
      ? req.body.company
      : req.user.company;

  const currentFY = getCurrentFinancialYear();

  const company = await Company.findOneAndUpdate(
    { _id: targetCompanyId },
    [
      {
        $set: {
          invoiceCounter: {
            $cond: {
              if: { $eq: ["$invoiceFinancialYear", currentFY] },
              then: { $add: ["$invoiceCounter", 1] },
              else: 1,
            },
          },
          invoiceFinancialYear: currentFY,
        },
      },
    ],
    { new: true }
  );

  if (!company || company.isActive === false) {
    return next(new AppError("Company not found or is inactive", 404));
  }

  if (!client || !items || items.length === 0) {
    return next(
      new AppError("Client and at least one item are required.", 400)
    );
  }

  const invoiceNo = `${company.invoicePrefix}/${currentFY}/${String(
    company.invoiceCounter
  ).padStart(3, "0")}`;

  const {
    items: updatedItems,
    totalBeforeGST,
    gstDetails,
    grossAmount,
  } = calculateInvoiceSummary({
    items,
    gstType,
    cgstRate,
    sgstRate,
    igstRate,
    fuelSurchargeRate,
    roundingOff,
  });

  const amountInWords = convertToWords(grossAmount);

  const invoice = await Invoice.create({
    company: company._id,
    companyBankDetails: company.companyBankDetails,
    client,
    consignee,
    items: updatedItems,
    invoiceNo,
    financialYear: currentFY,
    totalBeforeGST,
    gstDetails,
    roundingOff,
    grossAmount,
    inWords: amountInWords,
    ...rest,
  });

  res.status(201).json({
    status: "success",
    data: { invoice },
  });
});

export const getNextInvoiceNumber = async (req, res) => {
  try {
    const targetCompanyId =
      req.user.role === "admin" && req.query.companyId
        ? req.query.companyId
        : req.user.company;

    const company = await Company.findById(targetCompanyId);
    if (!company) return res.status(404).json({ error: "Company not found" });

    const currentFY = getCurrentFinancialYear();
    const counter =
      company.invoiceFinancialYear === currentFY
        ? company.invoiceCounter + 1
        : 1;

    const invoiceNumber = `${company.invoicePrefix}/${currentFY}/${String(
      counter
    ).padStart(3, "0")}`;

    return res.status(200).json({ invoiceNumber });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch invoice number" });
  }
};

export const getInvoices = catchAsync(async (req, res) => {
  const companyId = req.query.companyId || req.user.company;

  const features = new APIFeatures(
    Invoice.find({ company: companyId })
      .populate("client")
      .populate("consignee")
      .populate("company"),
    req.query
  )

    .filter()
    .sort()
    .limitFields()
    .paginate();

  const invoices = await features.query;

  res.status(200).json({
    status: "success",
    results: invoices.length,
    data: { invoices },
  });
});

export const getAllInvoices = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = req.query.companyId
    ? { company: new mongoose.Types.ObjectId(req.query.companyId) }
    : {};

  const features = new APIFeatures(
    Invoice.find(filter)
      .populate("company")
      .populate("client")
      .populate("consignee"),
    req.query
  )
    .filter()
    .sort()
    .limitFields();

  const totalCount = await features.query.clone().countDocuments();

  const invoices = await features.query.skip(skip).limit(limit);

  res.status(200).json({
    status: "success",
    results: totalCount,
    data: invoices,
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
    },
  });
});

export const getInvoice = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError(`Invalid invoice ID: ${id}`, 400));
  }

  const invoice = await Invoice.findById(id)
    .populate("consignee")
    .populate("client");

  if (!invoice) {
    return next(new AppError("Invoice not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: invoice,
  });
});

export const updateInvoice = catchAsync(async (req, res, next) => {
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!invoice) {
    return next(new AppError("Invoice not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { invoice },
  });
});

export const deleteInvoice = catchAsync(async (req, res, next) => {
  const invoice = await Invoice.findByIdAndDelete(req.params.id);

  if (!invoice) {
    return next(new AppError("Invoice not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
