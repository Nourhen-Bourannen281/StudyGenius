import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { getSocket } from "../services/socket";
import { getGroupMessages } from "../services/groupService";
import { useAuthStore } from "../store/authStore";

const GroupChat = ({ groupId }) => {
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();

    // Charge l'historique existant, puis rejoint la room en temps réel
    getGroupMessages(groupId).then(setMessages);
    socket.emit("joinGroup", groupId);

    // À chaque nouveau message reçu (de n'importe quel membre, y compris soi-même)
    const handleNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };
    socket.on("newMessage", handleNewMessage);

    // Nettoyage : on retire l'écouteur quand on quitte cette page
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [groupId]);

  // Défile automatiquement vers le bas à chaque nouveau message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const socket = getSocket();
    socket.emit("sendMessage", { groupId, content: input.trim() });
    setInput("");
  };

  return (
    <div className="bg-surface-light border border-white/5 rounded-2xl flex flex-col h-[500px]">
      <div className="px-5 py-4 border-b border-white/5">
        <h2 className="text-lg font-semibold text-white">Chat du groupe</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {messages.map((msg) => {
          const isMe = msg.sender._id === user.id || msg.sender._id === user._id;
          return (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              {!isMe && <span className="text-xs text-gray-500 mb-1 px-1">{msg.sender.name}</span>}
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  isMe
                    ? "bg-brand-500 text-white rounded-br-sm"
                    : "bg-white/10 text-gray-200 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-white/5 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écris un message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-10 h-10 flex items-center justify-center bg-brand-500 rounded-xl text-white"
        >
          <Send size={16} />
        </motion.button>
      </form>
    </div>
  );
};

export default GroupChat;