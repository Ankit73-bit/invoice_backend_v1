// address.schema.js
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    add1: { type: String },
    add2: { type: String },
    add3: { type: String },
    city: { type: String },
    state: { type: String },
    pinCode: { type: String },
    country: { type: String, default: "India" },
    panNo: { type: String },
    gstNo: { type: String },
    stateCode: { type: String },
  },
  { _id: false }
); // _id: false avoids creating a sub-ID field

export default addressSchema;
