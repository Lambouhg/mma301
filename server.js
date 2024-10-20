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

// Use routes
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/chats", chatRoutes);

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

const accessKey = process.env.ACCESS_KEY;
const secretKey = process.env.SECRET_KEY; //2 cái này nên bỏ vào .env
//tạo link thanh toán
app.post("/payment", async (req, res) => {
  const orderInfo = "pay with MoMo";
  const partnerCode = "MOMO";
  const redirectUrl = ""; // sau khi thành công sẽ chuyển tới trang này
  const ipnUrl = "https://5528-14-185-84-111.ngrok-free.app/callback"; //tải ngrok
  //, rồi ngrok config add-authtoken <token> thay token bằng đăng nhập trên trang chủ, và cuối cùng thì ngrok http 5000
  const requestType = "payWithMethod";
  const amount = "50000";
  const orderId = partnerCode + new Date().getTime(); //check xem trạng thái đơn hàng
  const requestId = orderId;
  const extraData = "";
  const paymentCode = "your_payment_code_here"; // Make sure it's valid
  const autoCapture = true;
  const lang = "vi";

  const rawSignature =
    `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}` +
    `&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}` +
    `&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = {
    partnerCode: partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: lang,
    requestType: requestType,
    autoCapture: autoCapture,
    extraData: extraData,
    signature: signature,
  };

  try {
    const result = await axios({
      method: "POST",
      url: "https://test-payment.momo.vn/v2/gateway/api/create",
      headers: {
        "Content-Type": "application/json",
      },
      data: requestBody,
    });
    return res.status(200).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: error.message || "server error",
    });
  }
});
app.post("/callback", async (req, res) => {
  console.log("callback::");
  console.log(req.body);
  //update order

  return res.status(200).json(req.body);
});
app.post("/transaction-status", async (req, res) => {
  const { orderId } = req.body;

  // Signature generation
  const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  // Request body
  const requestBody = {
    partnerCode: "MOMO",
    requestId: orderId,
    orderId,
    signature,
    lang: "vi",
  };

  try {
    // Axios request to MoMo API
    const result = await axios({
      method: "POST",
      url: "https://test-payment.momo.vn/v2/gateway/api/query",
      headers: {
        "Content-Type": "application/json",
      },
      data: requestBody,
    });

    // Return response to the client
    return res.status(200).json(result.data);
  } catch (error) {
    console.error("Transaction status error:", error);
    return res.status(500).json({
      statusCode: 500,
      message: error.message || "Failed to query transaction status",
    });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
