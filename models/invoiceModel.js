import mongoose from "mongoose";

const { Schema } = mongoose;

const itemSchema = new Schema(
  {
    description: {
      type: String,
      required: [true, "Item description is required"],
      trim: true,
    },
    hsncode: String,
    qty: {
      type: Number,
      min: [0, "Quantity must be 0 or more"],
    },
    unitPrice: { type: mongoose.Schema.Types.Mixed },
    total: {
      type: Number,
      required: [true, "Item total is required"],
      min: [0, "Item total must be 0 or more"],
    },
  },
  { _id: false }
);

const invoiceSchema = new Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  clientName: String,
  clientEmail: String,
  items: [itemSchema],
  totalAmount: Number,
  createdAt: { type: Date, default: Date.now },
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
