import { Server, Socket } from "socket.io";
import { Message } from "./models/Message";
import { verifyToken } from "@clerk/backend";

export const setupSocket = (io: Server) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.query.token as string;
    console.log("🔐 Received token:", token);

    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      const userId = payload.userId || payload.sub;
      console.log("User id is ",userId)
      if (!userId) {
        console.error("❌ No userId or sub in JWT payload:", payload);
        return next(new Error("Invalid token payload"));
      }

      socket.data.user = userId;
      console.log("✅ Authenticated Clerk user:", socket.data.user);
      next();
    } catch (err) {
      console.error("❌ Socket authentication failed:", err);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log("✅ Socket connected:", socket.id, "User:", socket.data.user);

    socket.on("joinParty", (partyId) => {
      console.log(`👥 User ${socket.data.user} joined party ${partyId}`);
      socket.join(partyId);
    });

    socket.on("sendMessage", async ({ partyId, content }) => {
      const sender = socket.data.user;
      console.log("💬 Saving message:", { partyId, sender, content });

      try {
        const msg = await Message.create({
          partyId,
          sender,
          content,
        });

        console.log("✅ Message saved:", msg);

        io.to(partyId).emit("receiveMessage", {
          sender,
          content,
          timestamp: msg.timestamp,
        });
      } catch (err) {
        console.error("❌ Error saving message:", err);
      }

      console.log("📍 End of sendMessage handler");
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected", socket.id);
    });
  });
};
