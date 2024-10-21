const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const { sendVerificationCode } = require("./services/EmailService");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://viettdqe170219:KTiOMNdRfWejBLKb@cluster0.otgtk.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error connecting to MongoDB", err));

// Routes
app.get("/", (req, res) => res.send("Backend is running"));

// Import routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes"); // Removed the stray 'n'
const orderRoutes = require("./routes/orderRoutes");
const chatRoutes = require("./routes/chatRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.use(express.json());

// Use routes
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/chats", chatRoutes);
app.use("/payments", paymentRoutes)

// API đăng ký người dùng
app.post("/signup", async (req, res) => {
  const { username, email, password, phoneNumber, address } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      passwordHash,
      phoneNumber,
      address,
      verificationCode: code,
    });

    // Gửi mã xác thực đến email
    await sendVerificationCode(email, code);
    await newUser.save();

    res.json({ message: "User registered successfully. Verification code sent to email." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error during signup");
  }
});

// Socket.io for chat
io.on("connection", (socket) => {
  console.log("User connected to chat");
  socket.on("message", (msg) => {
    io.emit("message", msg);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

//payment


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
