require("dotenv").config(); // Load environment variables
const express = require("express");
const morgan = require("morgan");
const cors = require("cors"); // ✅ Import CORS
const listEndpoints = require("express-list-endpoints");
const { authenticateToken } = require("./middleware/authMiddleware");
const db = require("./config/db"); // Ensure DB connection is established

// Initialize Express app
const app = express();

//the previous implementation was importing the AI routes unconditionally even if openai api key is not set 

const apikey = process.env.OPENAI_API_KEY;

if (apikey && apikey !== "not_set") {
  console.log("AI routes enabled - key provided");
  const aiRoutes = require("./routes/aiRoutes");
  app.use("/api/ai", aiRoutes);
} else {
  console.log("AI routes disabled - OPENAI_API_KEY is missing or set to 'not_set'");
}


// Initialize HTTP server
const http = require("http");
const server = http.createServer(app);

// Initialize Socket.io
const socketIo = require("socket.io");
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }
});

// Make io available to other modules
app.set('socketio', io);

// Importing Routes
const userRoutes = require("./routes/userRoutes")(io);
const bookingRoutes = require("./routes/bookingRoutes")(io); // ✅ Pass io here
const restaurantRoutes = require("./routes/restaurantRoutes");
const tableRoutes = require("./routes/tablesRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const notificationRoutes = require("./routes/notificationsRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// ✅ CORS Middleware Configuration
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(morgan("dev")); // Log API requests

// Serve Firebase Service Worker
app.use(express.static("public"));

// Register Firebase Messaging Service Worker
app.get("/firebase-messaging-sw.js", (req, res) => {
  res.sendFile(__dirname + "/public/firebase-messaging-sw.js");
});

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("🔥 Welcome to the Restaurant Booking API! 🚀");
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);

// this will register AI routes conditionally 
if (apikey && apikey !== "not_set") {
  console.log("AI routes enabled - key provided");
  const aiRoutes = require("./routes/aiRoutes");
  app.use("/api/ai", aiRoutes);
} else {
  console.log("AI routes disabled - OPENAI_API_KEY is missing or set to 'not_set'");
}

// Protected Route Example
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ message: "You have access to this protected route" });
});


// Handle socket connections
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Join booking updates room
  socket.join('bookingUpdates');

  // Listen for client joining specific restaurant room
  socket.on("joinRestaurant", (restaurantId) => {
    socket.join(`restaurant-${restaurantId}`);
    console.log(`User joined restaurant-${restaurantId}`);
  });

  // Listen for custom events from clients
  socket.on("clientAction", (data) => {
    console.log("Client action received:", data);
    // Process the client action if needed
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Create a global function to emit booking events
global.emitBookingEvent = (eventName, data) => {
  io.to('bookingUpdates').emit(eventName, data);
};

// Display All API Routes on Startup
console.table(listEndpoints(app));

// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Export io for use in other files if needed
module.exports = { io };