import Invoice from "../models/invoiceModel.js";

export const getInvoiceSummary = async (req, res) => {
  try {
    const match =
      req.user.role === "admin" && req.query.companyId
        ? { company: req.query.companyId }
        : { company: req.user.company };

    const stats = await Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total: { $sum: "$grossAmount" },
        },
      },
    ]);

    // Reshape result
    const summary = {
      totalInvoices: 0,
      totalRevenue: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
    };

    stats.forEach((s) => {
      summary.totalInvoices += s.count;
      summary.totalRevenue += s.total;

      if (s._id === "Paid") summary.paid = s.count;
      if (s._id === "Pending") summary.pending = s.count;
      if (s._id === "Overdue") summary.overdue = s.count;
    });

    res.status(200).json({ status: "success", data: summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load summary" });
  }
};

export const getMonthlyInvoiceStats = async (req, res) => {
  try {
    const match =
      req.user.role === "admin" && req.query.companyId
        ? { company: req.query.companyId }
        : { company: req.user.company };

    const monthlyStats = await Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
          revenue: { $sum: "$grossAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Map _id: 1–12 to month names
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const result = monthNames.map((m, i) => {
      const stat = monthlyStats.find((s) => s._id === i + 1);
      return {
        month: m,
        count: stat ? stat.count : 0,
        revenue: stat ? stat.revenue : 0,
      };
    });

    res.status(200).json({ status: "success", data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch monthly invoice stats" });
  }
};

export const getTopClients = async (req, res) => {
  try {
    const match =
      req.user.role === "admin" && req.query.companyId
        ? { company: req.query.companyId }
        : { company: req.user.company };

    const sortBy = req.query.sort === "count" ? "invoiceCount" : "totalRevenue";

    const topClients = await Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$client",
          invoiceCount: { $sum: 1 },
          totalRevenue: { $sum: "$grossAmount" },
        },
      },
      { $sort: { [sortBy]: -1 } },
      { $limit: 5 },
    ]);

    // Populate client data
    const populated = await Promise.all(
      topClients.map(async (item) => {
        const client = await mongoose.model("Client").findById(item._id);
        return {
          client,
          invoiceCount: item.invoiceCount,
          totalRevenue: item.totalRevenue,
        };
      })
    );

    res.status(200).json({ status: "success", data: populated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch top clients" });
  }
};

export const getStatusSummary = async (req, res) => {
  try {
    const match =
      req.user.role === "admin" && req.query.companyId
        ? { company: req.query.companyId }
        : { company: req.user.company };

    const data = await Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = { paid: 0, pending: 0, overdue: 0 };
    data.forEach((item) => {
      if (item._id === "Paid") result.paid = item.count;
      if (item._id === "Pending") result.pending = item.count;
      if (item._id === "Overdue") result.overdue = item.count;
    });

    res.status(200).json({ status: "success", data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch status summary" });
  }
};

export const getYearlySummary = async (req, res) => {
  try {
    const match =
      req.user.role === "admin" && req.query.companyId
        ? { company: req.query.companyId }
        : { company: req.user.company };

    const result = await Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$financialYear",
          total: { $sum: "$grossAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formatted = result.map((r) => ({
      financialYear: r._id,
      total: r.total,
      count: r.count,
    }));

    res.status(200).json({ status: "success", data: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch yearly summary" });
  }
};
