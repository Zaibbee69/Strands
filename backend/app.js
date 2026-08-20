require('dotenv').config();
const path = require("node:path");
const express = require('express');
const cors = require('cors'); // 1. Import CORS

// Middleware
const globalErrorHandler = require("./middlewares/globalErrorHandler");

// App Setup
const app = express();
const PORT = process.env.PORT;

// 2. Enable CORS for your frontend origin
app.use(cors({
    origin: true
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// --- GLOBAL ERROR HANDLER ---
app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`Server is running and listening on port ${PORT}`);
})