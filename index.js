const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const path = require("path");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const port = 5001;

// Middleware setup
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "25mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "25mb" }));

// تحسين إعدادات CORS
const corsOptions = {
  origin: ["https://www.genuineman.store", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

// دعم طلبات OPTIONS (Preflight Requests)
app.options('*', cors(corsOptions));

// جميع الروابط
const authRoutes = require("./src/utils/uploadImage");
const authRoutes = require("./src/users/user.route");
const productRoutes = require("./src/products/products.route");
const reviewRoutes = require("./src/reviews/reviews.router");
const orderRoutes = require("./src/orders/orders.route");
const statsRoutes = require("./src/stats/stats.rout");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", statsRoutes);

// الاتصال بقاعدة البيانات
main()
    .then(() => console.log("MongoDB is successfully connected."))
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect(process.env.DB_URL);

    app.get("/", (req, res) => {
        res.send("يعمل الان");
    });
}

// رفع صورة واحدة
app.post("/api/uploadImage", (req, res) => {
    uploadImage(req.body.image)
        .then((url) => res.send(url))
        .catch((err) => {
            console.error("Error uploading image:", err);
            res.status(500).send(err.message || "Failed to upload image");
        });
});

// رفع عدة صور
app.post("/api/uploadImages", async (req, res) => {
    try {
        const { images } = req.body;
        if (!images || !Array.isArray(images)) {
            return res.status(400).json({ error: "Invalid request: images array is required." });
        }

        const uploadPromises = images.map((image) => uploadImage(image));
        const urls = await Promise.all(uploadPromises);

        res.json(urls);
    } catch (error) {
        console.error("Error uploading images:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// تشغيل الخادم
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});