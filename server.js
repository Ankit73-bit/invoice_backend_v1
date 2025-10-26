import { connectDB } from "./config/db.js";
import express from "express";
import invoiceRoutes from "./routes/invoiceRoute.js";
import compnayRoutes from "./routes/companyRoute.js";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import analyticsRoutes from "./routes/analyticsRoute.js";
import consigneeRoutes from "./routes/consigneeRoute.js";
import clientRoutes from "./routes/clientRoute.js";
import clientItemRoutes from "./routes/clientItemRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://paras-invoice-two.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/invoices", invoiceRoutes);
app.use("/api/companies", compnayRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/consignees", consigneeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/client-items", clientItemRoutes);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
});
