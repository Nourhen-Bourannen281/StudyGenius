const mongoose = require("mongoose");

// Fonction qui connecte l'application à la base MongoDB Atlas
// Elle est appelée une seule fois, au démarrage du serveur (server.js)
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connecté : ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erreur de connexion MongoDB : ${error.message}`);
    // Si la base n'est pas accessible, inutile de laisser le serveur tourner
    process.exit(1);
  }
};

module.exports = connectDB;