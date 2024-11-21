const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require('path');

const app = express();
require("dotenv").config();

connectDB();

app.use(express.json());
// Allow CORS only for the frontend URL
const corsOptions = {
  origin: 'http://localhost:3000', // Frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allows credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions));

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/plots", require("./routes/plotRoutes"));
app.use("/api/agents", require("./routes/agents"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Default Route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

const PORT = process.env.PORT; 
app.listen(PORT, () => console.log(`backend is running on port ${PORT}`));