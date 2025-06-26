import { connectDB } from "./config/db.js";
import express from "express";
import invoiceRoutes from "./routes/invoiceRoute.js";
import compnayRoutes from "./routes/companyRoute.js";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import analyticsRoutes from "./routes/analyticsRoute.js";
import consigneeRoutes from "./routes/consigneeRoute.js";
import clientRoutes from "./routes/clientRoute.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:8000", // change this to your frontend URL in prod
    credentials: true, // if using cookies/auth headers
  })
);

app.use("/api/invoices", invoiceRoutes);
app.use("/api/companies", compnayRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/consignees", consigneeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
});
