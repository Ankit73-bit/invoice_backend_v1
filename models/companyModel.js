import mongoose from "mongoose";
import addressSchema from "./adderssSchema.js";

const BankDetailsSchema = new mongoose.Schema(
  {
    bankName: String,
    accNo: String,
    ifsc: String,
    branchName: String,
  },
  { _id: false }
);

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, "Company must have a name."],
    trim: true,
    unique: true,
  },
  address: addressSchema,
  allowManualItemTotals: {
    type: Boolean,
    default: false,
  },
  companyBankDetails: BankDetailsSchema,
  invoiceCounter: { type: Number, default: 0 },
  invoiceFinancialYear: { type: String }, // e.g., "24-25"
  invoicePrefix: { type: String, default: "INV" },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: { type: Date, default: Date.now },
  deactivatedAt: Date,
});

const Company = mongoose.model("Company", companySchema);
export default Company;
