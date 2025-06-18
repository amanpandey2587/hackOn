import { io } from "socket.io-client";

export const connectSocket = (token: string) => {
  return io("http://localhost:4000", {
    query: { token },
    transports: ["websocket"],
  });
};
