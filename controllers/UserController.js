const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidEmailName = (email) => {
  const emailName = email.split("@")[0];
  const emailNameRegex = /^[a-zA-Z0-9]{6,}$/;
  return emailNameRegex.test(emailName);
};

const isValidPassword = (password) => {
  const passwordRegex = /^[a-zA-Z0-9]{6,}$/;
  return passwordRegex.test(password);
};

const isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^(03|05|07|08|09)[0-9]{8}$/;
  return phoneRegex.test(phoneNumber);
};

// User Signup
exports.signup = async (req, res) => {
  const { username, email, password, phoneNumber, address } = req.body;

  const normalizedEmail = email.toLowerCase();

  if (
    !username ||
    typeof username !== "string" ||
    username.trim().length === 0
  ) {
    return res.status(400).json({ message: "Username is required" });
  }

  if (
    !normalizedEmail ||
    typeof normalizedEmail !== "string" ||
    !isValidEmail(normalizedEmail) ||
    !normalizedEmail.endsWith("@gmail.com")
  ) {
    return res
      .status(400)
      .json({ message: "A valid Gmail address is required" });
  }

  if (!isValidEmailName(normalizedEmail)) {
    return res.status(400).json({
      message:
        "Email name must be at least 6 characters long and cannot contain special characters",
    });
  }

  if (!password || typeof password !== "string" || !isValidPassword(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 6 characters long and cannot contain special characters",
    });
  }

  if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
    return res.status(400).json({
      message: "Phone number must be a valid Vietnamese phone number",
    });
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      email: normalizedEmail,
      passwordHash,
      phoneNumber,
      address,
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//edit pass
exports.editPassword = async (req, res) => {
  const { password, newPassword } = req.body; // Lấy mật khẩu từ request body
  const token = req.headers.authorization?.split(" ")[1]; // Lấy token từ header Authorization

  if (!token) {
    return res
      .status(401)
      .json({ message: "Token is required for authentication" });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({ message: "Password is empty or invalid" });
  }

  if (!newPassword || typeof newPassword !== "string") {
    return res
      .status(400)
      .json({ message: "New password is empty or invalid" });
  }

  try {
    // Giải mã token để lấy userId từ JWT
    const decoded = jwt.verify(token, "your_jwt_secret");

    // Tìm người dùng trong cơ sở dữ liệu
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // So sánh mật khẩu hiện tại với mật khẩu đã mã hóa
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu mới
    user.passwordHash = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
// User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({ message: "Password is required" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await user.isValidPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, "your_jwt_secret");
    res.status(200).json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization token is missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout
exports.logout = (req, res) => {
  res.status(200).json({ message: "User logged out successfully" });
};

// Edit User Profile
exports.editProfile = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization token is missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    const userId = decoded.userId;
    const { username, phoneNumber, address } = req.body;

    // Validate the inputs
    if (
      !username ||
      typeof username !== "string" ||
      username.trim().length === 0
    ) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({
        message: "Phone number must be a valid Vietnamese phone number",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, phoneNumber, address },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
