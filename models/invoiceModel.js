import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, "Item description is required"],
    trim: true,
  },
  hsncode: String,
  quantity: {
    type: Number,
    min: [0, "Quantity must be 0 or more"],
  },
  unitPrice: { type: mongoose.Schema.Types.Mixed },
  total: {
    type: Number,
    required: [true, "Item total is required"],
    min: [0, "Item total must be 0 or more"],
  },
});

const detailsSchema = new mongoose.Schema(
  {
    referenceNo: { type: String },
    referenceDate: { type: Date },
    otherReferences: { type: String },
    purchaseNo: { type: String },
    purchaseDate: { type: Date },
    termsOfDelivery: { type: String },
    dispatchDetails: {
      dispatchNo: { type: String },
      date: { type: Date },
      through: { type: String },
      destination: { type: String },
    },
  },
  { _id: false }
);

const gstSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["CGST", "SGST", "IGST", "None"],
      default: "None",
    },
    cgstRate: { type: Number },
    sgstRate: { type: Number },
    igstRate: { type: Number },
    cgst: { type: Number },
    sgst: { type: Number },
    igst: { type: Number },
    fuelSurchargeRate: { type: Number },
    fuelSurcharge: { type: Number },
    totalGstAmount: { type: Number },
    totalAmount: { type: Number },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema({
  invoiceNo: {
    type: String,
    required: true,
    unique: true,
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
    required: [true, "A Invoice must have invoice date"],
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  consignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Consignee",
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: [true, "A Invoice must have client"],
  },
  items: [itemSchema],
  details: detailsSchema,
  hrDescription: {
    year: { type: Number },
    month: { type: String },
    hrCode: { type: String },
    hrName: { type: String },
  },
  dataFrom: { type: String },
  totalBeforeGST: Number,
  gstDetails: gstSchema,
  note: { type: String },
  declaration: { type: String },
  roundingOff: { type: Number },
  grossAmount: { type: Number, required: true },
  inWords: { type: String },
  status: {
    type: String,
    enum: ["Pending", "Paid", "Overdue"],
    default: "Pending",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

invoiceSchema.index({ company: 1, invoiceNo: 1 }, { unique: true });

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
