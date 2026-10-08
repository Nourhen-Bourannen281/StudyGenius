const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

let privateKey;

// Render : clé privée stockée dans une variable d'environnement
if (process.env.JAAS_PRIVATE_KEY) {
  privateKey = process.env.JAAS_PRIVATE_KEY.replace(/\\n/g, "\n");
}
// Local : clé privée stockée dans le fichier .pk
else if (process.env.JAAS_PRIVATE_KEY_PATH) {
  const keyPath = path.join(
    __dirname,
    "..",
    "..",
    process.env.JAAS_PRIVATE_KEY_PATH.replace("./", "")
  );

  privateKey = fs.readFileSync(keyPath, "utf8");
} else {
  throw new Error(
    "JAAS_PRIVATE_KEY or JAAS_PRIVATE_KEY_PATH is not configured"
  );
}

const generateJaasToken = ({ userId, userName, roomName }) => {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    aud: "jitsi",
    iss: "chat",
    sub: process.env.JAAS_APP_ID,
    room: roomName,
    exp: now + 2 * 60 * 60,
    context: {
      user: {
        id: userId,
        name: userName,
        moderator: true,
      },
      features: {
        livestreaming: false,
        recording: false,
        "screen-sharing": true,
        transcription: false,
      },
    },
  };

  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    keyid: process.env.JAAS_KEY_ID,
  });
};

module.exports = { generateJaasToken };