require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blog");
const influencerRoutes = require("./routes/influencer");
const awsRoutes = require("./routes/aws");
const cors = require("cors");


const app = express();

const PORT = process.env.PORT || 5000;
// app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000", // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true // Allow credentials like cookies or authorization headers
  }));

// Middleware
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));


  app.use(
    session({
      secret: "your-secret-key", // Change to a strong, secure key
      resave: false, // Prevent resaving session if it hasn't changed
      saveUninitialized: false, // Prevent saving uninitialized sessions
      store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, // Connection URI
        collectionName: "sessions", // Name of the session collection
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // Session duration (e.g., 1 day)
        httpOnly: true, // Prevent client-side JS from accessing the cookie
        secure: false, // Set to true if using HTTPS
      },
    })
  );
  app.use(express.urlencoded({ extended: true }));  

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/aws", awsRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/influencers", influencerRoutes);



// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});