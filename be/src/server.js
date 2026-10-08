require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const quizRoutes = require("./routes/quizRoutes");
const progressRoutes = require("./routes/progressRoutes");
const folderRoutes = require("./routes/folderRoutes");
const groupRoutes = require("./routes/groupRoutes");
const messageRoutes = require("./routes/messageRoutes");
const badgeRoutes = require("./routes/badgeRoutes");

const errorHandler = require("./middlewares/errorHandler");
const sanitizeMiddleware = require("./middlewares/sanitize");
const { generalLimiter } = require("./middlewares/rateLimiters");
const Message = require("./models/Message");

const app = express();
const PORT = process.env.PORT || 5000;

// ======================
// Middlewares
// ======================
const allowedOrigins = process.env.NODE_ENV === "production"
  ? ["https://study-genius-sand.vercel.app"]
  : ["http://localhost:5173"];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(sanitizeMiddleware);
app.use(generalLimiter);

// ======================
// Route principale
// ======================
app.get("/", (req, res) => {
  res.json({
    message: "StudyGenius API opérationnelle",
  });
});

// ======================
// Routes API
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/groups", messageRoutes);
app.use("/api/badges", badgeRoutes);

// ======================
// 404
// ======================
app.use((req, res) => {
  res.status(404).json({
    message: "Route introuvable",
  });
});

// ======================
// Error Handler
// ======================
app.use(errorHandler);

// ======================
// HTTP + Socket.IO
// ======================
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: allowedOrigins },
});

// ======================
// Auth Socket.IO
// ======================
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Non autorisé"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Token invalide"));
  }
});

// ======================
// Socket.IO Events
// ======================
io.on("connection", (socket) => {
  console.log(`Utilisateur connecté : ${socket.userId}`);

  // ----------------------
  // Rejoindre un groupe
  // ----------------------
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`[DEBUG] Socket ${socket.id} (user ${socket.userId}) a rejoint la room ${groupId}`);
  });

  // ----------------------
  // Messages du chat
  // ----------------------
  socket.on("sendMessage", async ({ groupId, content }) => {
    try {
      const message = await Message.create({
        group: groupId,
        sender: socket.userId,
        content,
      });

      const populated = await message.populate("sender", "name");
      io.to(groupId).emit("newMessage", populated);

      console.log(`[DEBUG] Message envoyé dans le groupe ${groupId} par ${socket.userId}`);
    } catch (error) {
      console.error("Erreur d'envoi du message :", error.message);
    }
  });

  // ==================================================
  // SIGNALISATION APPEL VIDEO
  // ==================================================
  socket.on("startCall", ({ groupId, groupName, callerName }) => {
    console.log(`[DEBUG] startCall reçu pour le groupe ${groupId}, appelant : ${callerName}`);
    socket.to(groupId).emit("incomingCall", {
      groupId,
      groupName,
      callerId: socket.userId,
      callerName,
    });
  });

  // io.to() (et non socket.to()) : envoie à TOUT LE MONDE dans la room,
  // y compris celui qui vient d'accepter — sinon lui-même ne bascule jamais
  // correctement en mode "in-call" de son côté.
  socket.on("acceptCall", ({ groupId, groupName }) => {
    console.log(`[DEBUG] acceptCall reçu pour le groupe ${groupId}`);
    io.to(groupId).emit("callAccepted", {
      groupId,
      groupName,
      userId: socket.userId,
    });
  });

  socket.on("declineCall", ({ groupId }) => {
    console.log(`[DEBUG] declineCall reçu pour le groupe ${groupId}`);
    io.to(groupId).emit("callDeclined", {
      groupId,
      userId: socket.userId,
    });
  });

  // ==================================================
  // Fin d'appel
  // ==================================================
  socket.on("endCall", ({ groupId }) => {
    console.log(`[DEBUG] endCall reçu pour le groupe ${groupId}`);
    io.to(groupId).emit("callEnded", { groupId });
  });

  // ----------------------
  // Déconnexion
  // ----------------------
  socket.on("disconnect", () => {
    console.log(`Utilisateur déconnecté : ${socket.userId}`);
  });
});

// ======================
// Démarrage du serveur
// ======================
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Serveur StudyGenius démarré sur http://localhost:${PORT}`);
  });
});