import { getCurrentFinancialYear } from "../helper/services.js";
import Company from "../models/companyModel.js";
import Invoice from "../models/invoiceModel.js";
import APIFeatures from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const createInvoice = catchAsync(async (req, res, next) => {
  const { clientName, clientEmail, items } = req.body;

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  // Determine the target company (admin or user)
  const targetCompanyId =
    req.user.role === "admin" && req.body.companyId
      ? req.body.companyId
      : req.user.company;

  const currentFY = getCurrentFinancialYear();

  // Atomically increment invoiceCounter if same FY, or reset and update
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

  if (!company) {
    return next(new AppError("Company not found!", 404));
  }

  const invoiceNumber = `${company.invoicePrefix}-${currentFY}/${String(
    company.invoiceCounter
  ).padStart(3, "0")}`;

  const invoice = await Invoice.create({
    company: company._id,
    clientName,
    clientEmail,
    items,
    totalAmount,
    invoiceNumber,
    financialYear: currentFY,
  });

  res.status(201).json({
    status: "success",
    data: { invoice },
  });
});

export const getInvoices = catchAsync(async (req, res) => {
  const features = new APIFeatures(
    Invoice.find({ company: req.user.company })
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

export const getAllInvoices = catchAsync(async (req, res, next) => {
  const { skip, limit } = req.pagination;

  const features = new APIFeatures(
    Invoice.find().populate("company").populate("client").populate("consignee"),
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
  });
  next();
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

  // Calculate payment status
  const paymentStatus = calculatePaymentStatus(invoice);
  invoice.paymentStatus = paymentStatus;

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
