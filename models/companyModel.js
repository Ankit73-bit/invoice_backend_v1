import mongoose from "mongoose";

const companySchema = mongoose.Schema({
  companyName: {
    type: String,
    required: [true, "Company must have a name."],
    trim: true,
    unique: true,
  },
  allowManualItemTotals: {
    type: Boolean,
    default: false,
  },
  invoiceCounter: { type: Number, default: 1 },
  invoiceFinancialYear: { type: String }, // e.g., "24-25"
  invoicePrefix: { type: String, default: "INV" },
});

const Company = mongoose.model("Company", companySchema);
export default Company;
