import Invoice from "../models/invoiceModel.js";
import mongoose from "mongoose";

/**
 * @description Get invoice analytics summary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getInvoiceSummary = async (req, res) => {
  try {
    // Input validation
    if (req.query.companyId && !mongoose.isValidObjectId(req.query.companyId)) {
      return res.status(400).json({
        status: "error",
        error: "Invalid company ID format",
      });
    }

    const match = {};

    // Admin with company filter
    if (req.user.role === "admin" && req.query.companyId) {
      match.company = mongoose.Types.ObjectId.createFromHexString(
        req.query.companyId
      );
    }
    // Non-admin users
    else if (req.user.role !== "admin") {
      if (!req.user.company) {
        return res.status(403).json({
          status: "error",
          error: "User company not specified",
        });
      }
      match.company = mongoose.Types.ObjectId.createFromHexString(
        req.user.company
      );
    }

    const stats = await Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$grossAmount" },
        },
      },
    ]);

    // Initialize summary with default values
    const summary = {
      totalInvoices: 0,
      totalRevenue: 0,
      paid: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      overdue: { count: 0, amount: 0 },
      lastUpdated: new Date().toISOString(),
    };

    // Process aggregation results
    stats.forEach((s) => {
      summary.totalInvoices += s.count;
      summary.totalRevenue += s.totalAmount;

      switch (s._id) {
        case "Paid":
          summary.paid = { count: s.count, amount: s.totalAmount };
          break;
        case "Pending":
          summary.pending = { count: s.count, amount: s.totalAmount };
          break;
        case "Overdue":
          summary.overdue = { count: s.count, amount: s.totalAmount };
          break;
      }
    });

    // Calculate percentages
    summary.paid.percentage =
      summary.totalInvoices > 0
        ? Math.round((summary.paid.count / summary.totalInvoices) * 100)
        : 0;
    summary.pending.percentage =
      summary.totalInvoices > 0
        ? Math.round((summary.pending.count / summary.totalInvoices) * 100)
        : 0;
    summary.overdue.percentage =
      summary.totalInvoices > 0
        ? Math.round((summary.overdue.count / summary.totalInvoices) * 100)
        : 0;

    res.status(200).json({
      status: "success",
      data: summary,
    });
  } catch (error) {
    console.error("[Analytics Error]", error);
    res.status(500).json({
      status: "error",
      error: "Failed to load analytics summary",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @description Get monthly invoice statistics
 */
export const getMonthlyInvoiceStats = async (req, res) => {
  try {
    const match = {};

    if (req.user.role === "admin" && req.query.companyId) {
      if (!mongoose.isValidObjectId(req.query.companyId)) {
        return res.status(400).json({ error: "Invalid company ID" });
      }
      match.company = mongoose.Types.ObjectId.createFromHexString(
        req.query.companyId
      );
    } else if (req.user.role !== "admin") {
      match.company = mongoose.Types.ObjectId.createFromHexString(
        req.user.company
      );
    }

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

    const result = monthNames.map((month, index) => {
      const stat = monthlyStats.find((s) => s._id === index + 1);
      return {
        month,
        count: stat?.count || 0,
        revenue: stat?.revenue || 0,
      };
    });

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error("[Monthly Stats Error]", error);
    res.status(500).json({
      status: "error",
      error: "Failed to fetch monthly stats",
    });
  }
};

/**
 * @description Get top clients by revenue or invoice count
 */
export const getTopClients = async (req, res) => {
  try {
    const match = {};
    const sortBy = req.query.sort === "count" ? "invoiceCount" : "totalRevenue";
    const limit = parseInt(req.query.limit) || 5;

    if (req.user.role === "admin" && req.query.companyId) {
      match.company = mongoose.Types.ObjectId.createFromHexString(
        req.query.companyId
      );
    } else if (req.user.role !== "admin") {
      match.company = mongoose.Types.ObjectId.createFromHexString(
        req.user.company
      );
    }

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
      { $limit: limit },
    ]);

    const populated = await Promise.all(
      topClients.map(async (item) => {
        const client = await mongoose.model("Client").findById(item._id);
        return {
          client: {
            _id: client._id,
            name: client.clientCompanyName,
            email: client.email,
          },
          invoiceCount: item.invoiceCount,
          totalRevenue: item.totalRevenue,
        };
      })
    );

    res.status(200).json({
      status: "success",
      data: populated,
    });
  } catch (error) {
    console.error("[Top Clients Error]", error);
    res.status(500).json({
      status: "error",
      error: "Failed to fetch top clients",
    });
  }
};

export const getStatusSummary = async (req, res) => {
  try {
    const match = {};

    if (req.user.role === "admin" && req.query.companyId) {
      if (!mongoose.isValidObjectId(req.query.companyId)) {
        return res.status(400).json({ error: "Invalid company ID" });
      }
      match.company = mongoose.Types.ObjectId.createFromHexString(
        req.query.companyId
      );
    } else if (req.user.role !== "admin") {
      match.company = mongoose.Types.ObjectId.createFromHexString(
        req.user.company
      );
    }

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
    const match = {};

    if (req.user.role === "admin" && req.query.companyId) {
      if (!mongoose.isValidObjectId(req.query.companyId)) {
        return res.status(400).json({ error: "Invalid company ID" });
      }
      match.company = mongoose.Types.ObjectId.createFromHexString(
        req.query.companyId
      );
    } else if (req.user.role !== "admin") {
      match.company = mongoose.Types.ObjectId.createFromHexString(
        req.user.company
      );
    }

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
