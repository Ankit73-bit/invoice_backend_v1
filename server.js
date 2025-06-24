import { connectDB } from "./config/db.js";
import express from "express";
import invoiceRoutes from "./routes/invoiceRoute.js";
import compnayRoutes from "./routes/companyRoute.js";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";

const app = express();

app.use(express.json());

app.use("/api/invoices", invoiceRoutes);
app.use("/api/company", compnayRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
});
