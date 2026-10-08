const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const privateKey = fs.readFileSync(
  path.join(__dirname, "..", "..", process.env.JAAS_PRIVATE_KEY_PATH.replace("./", "")),
  "utf8"
);

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