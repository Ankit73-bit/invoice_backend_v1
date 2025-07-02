import Client from "../models/clientModel.js";

// export const getAllClients = async (req, res) => {
//   const filter =
//     req.user.role === "admin" && req.query.companyId
//       ? { company: req.query.companyId }
//       : { company: req.user.company };

//   const clients = await Client.find(filter);
//   res.status(200).json({ status: "success", data: clients });
// };

export const getAllClients = async (req, res) => {
  const filter =
    req.user.role === "admin" && req.query.companyId
      ? { company: req.query.companyId }
      : { company: req.user.company };

  const clients = await Client.find(filter).populate("company", "companyName");
  res.status(200).json({ status: "success", data: clients });
};

export const getClientById = async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) return res.status(404).json({ error: "Client not found" });
  res.status(200).json({ status: "success", data: client });
};

export const createClient = async (req, res) => {
  const company =
    req.user.role === "admin" ? req.body.company : req.user.company;

  if (!company) {
    return res
      .status(400)
      .json({ error: "Company ID is required to create a client." });
  }

  const client = await Client.create({ ...req.body, company });

  res.status(201).json({ status: "success", data: client });
};

export const updateClient = async (req, res) => {
  const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!client) return res.status(404).json({ error: "Client not found" });
  res.status(200).json({ status: "success", data: client });
};

export const deleteClient = async (req, res) => {
  const client = await Client.findByIdAndDelete(req.params.id);
  if (!client) return res.status(404).json({ error: "Client not found" });
  res.status(204).json({ status: "success", data: null });
};
