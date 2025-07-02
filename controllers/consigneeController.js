import Consignee from "../models/consigneeModel.js";

export const getAllConsignees = async (req, res) => {
  const filter =
    req.user.role === "admin" && req.query.companyId
      ? { company: req.query.companyId }
      : { company: req.user.company };

  const consignees = await Consignee.find(filter).populate(
    "company",
    "companyName"
  );
  res.status(200).json({ status: "success", data: consignees });
};

export const getConsigneeById = async (req, res) => {
  const consignee = await Consignee.findById(req.params.id);
  if (!consignee) return res.status(404).json({ error: "Consignee not found" });
  res.status(200).json({ status: "success", data: consignee });
};

export const createConsignee = async (req, res) => {
  const company =
    req.user.role === "admin" ? req.body.company : req.user.company;
  const consignee = await Consignee.create({ ...req.body, company });
  res.status(201).json({ status: "success", data: consignee });
};

export const updateConsignee = async (req, res) => {
  const consignee = await Consignee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!consignee) return res.status(404).json({ error: "Consignee not found" });
  res.status(200).json({ status: "success", data: consignee });
};

export const deleteConsignee = async (req, res) => {
  const consignee = await Consignee.findByIdAndDelete(req.params.id);
  if (!consignee) return res.status(404).json({ error: "Consignee not found" });
  res.status(204).json({ status: "success", data: null });
};
