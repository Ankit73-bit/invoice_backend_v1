import mongoose from "mongoose";
import addressSchema from "./adderssSchema.js";

const consigneeSchema = new mongoose.Schema({
  consigneeCompanyName: { type: String, required: true, trim: true },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  consigneeName: { type: String },
  address: addressSchema,
  contact: { type: String },
  email: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Consignee = mongoose.model("Consignee", consigneeSchema);
export default Consignee;
