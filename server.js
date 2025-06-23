import { connectDB } from "./config/db.js";
import express from "express";
import invoiceRoutes from "./routes/invoiceRoute.js";

const app = express();

app.use(express.json());

app.use("/api/invoices", invoiceRoutes);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
});
