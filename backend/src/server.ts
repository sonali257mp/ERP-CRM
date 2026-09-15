import express from "express";
import cors from "cors";
import "dotenv/config";
import authRouter from "./routes/auth";
import customerRouter from "./routes/customers";
import stockMovementRouter from "./routes/stockMovements";
import productRouter from "./routes/products";
import challanRouter from "./routes/challans";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/customers", customerRouter);
app.use("/stock-movements",stockMovementRouter);
app.use("/products", productRouter);app.use("/products", productRouter);
app.use("/challans", challanRouter);

app.get("/", (req, res) => {
  res.json({
    message: "ERP & CRM Backend API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});