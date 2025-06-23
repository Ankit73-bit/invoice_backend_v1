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
});

const Company = mongoose.model("Company", companySchema);
export default Company;
