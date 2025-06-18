import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { Webhook } from "svix";
import dotenv from "dotenv";
import { setupSocket } from "./socket";
import { connectDB } from "./db";
import partyRoutes from "./routes/parties";
import { Server } from "socket.io";
import http from "http";
import messageRoutes from "./routes/messages";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const startServer = async () => {
  await connectDB(); // ✅ Wait for DB to connect
  setupSocket(io);

  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  }));

  app.use(express.json());
  app.use("/api/parties", partyRoutes);
  app.use("/api/messages", messageRoutes);

  server.listen(4000, () =>
    console.log("Server running on http://localhost:4000")
  );
};

startServer();

// // Middleware
// app.use(cors({
//   origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Vite default port
// }));

// // Raw middleware for webhooks (must come before express.json())
// app.use('/webhooks', express.raw({ type: 'application/json' }));
// app.use(express.json());

// // MongoDB connection
// mongoose.connect(process.env.MONGODB_URI as string)
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((error) => console.error('MongoDB connection error:', error));

// // User Schema
// interface IWatchlistItem {
//   movieId: string;
//   addedAt: Date;
// }

// interface IWatchHistoryItem {
//   movieId: string;
//   watchedAt: Date;
//   progress: number;
// }

// interface IUser extends mongoose.Document {
//   clerkId: string;
//   email: string;
//   firstName?: string;
//   lastName?: string;
//   profileImage?: string;
//   createdAt: Date;
//   lastActive: Date;
//   subscription: 'basic' | 'standard' | 'premium';
//   watchlist: IWatchlistItem[];
//   watchHistory: IWatchHistoryItem[];
// }

// const userSchema = new mongoose.Schema<IUser>({
//   clerkId: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   firstName: String,
//   lastName: String,
//   profileImage: String,
//   createdAt: { type: Date, default: Date.now },
//   lastActive: { type: Date, default: Date.now },
//   subscription: { 
//     type: String, 
//     enum: ['basic', 'standard', 'premium'], 
//     default: 'basic' 
//   },
//   watchlist: [{
//     movieId: String,
//     addedAt: { type: Date, default: Date.now }
//   }],
//   watchHistory: [{
//     movieId: String,
//     watchedAt: { type: Date, default: Date.now },
//     progress: { type: Number, default: 0 }
//   }]
// });

// const User = mongoose.model<IUser>('User', userSchema);

// // Webhook Types
// interface ClerkWebhookEvent {
//   data: {
//     id: string;
//     email_addresses: Array<{ email_address: string }>;
//     first_name?: string;
//     last_name?: string;
//     profile_image_url?: string;
//     created_at: number;
//   };
//   type: string;
// }

// // Webhook handler
// app.post('/webhooks/clerk', async (req: express.Request, res: express.Response) => {
//   const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

//   if (!WEBHOOK_SECRET) {
//     console.error('CLERK_WEBHOOK_SECRET is not set');
//     return res.status(500).json({ error: 'Webhook secret not configured' });
//   }

//   // Get the headers
//   const headers = req.headers;
//   const payload = req.body;

//   // Get the Svix headers for verification
//   const svix_id = headers['svix-id'] as string;
//   const svix_timestamp = headers['svix-timestamp'] as string;
//   const svix_signature = headers['svix-signature'] as string;

//   // If there are no headers, error out
//   if (!svix_id || !svix_timestamp || !svix_signature) {
//     return res.status(400).json({ error: 'Missing svix headers' });
//   }

//   // Create a new Svix instance with your secret
//   const wh = new Webhook(WEBHOOK_SECRET);

//   let evt: ClerkWebhookEvent;

//   // Verify the payload with the headers
//   try {
//     evt = wh.verify(payload, {
//       'svix-id': svix_id,
//       'svix-timestamp': svix_timestamp,
//       'svix-signature': svix_signature,
//     }) as ClerkWebhookEvent;
//   } catch (err) {
//     console.error('Error verifying webhook:', err);
//     return res.status(400).json({ error: 'Error occurred during verification' });
//   }

//   // Handle the webhook
//   const eventType = evt.type;

//   try {
//     switch (eventType) {
//       case 'user.created':
//         await handleUserCreated(evt.data);
//         break;
//       case 'user.updated':
//         await handleUserUpdated(evt.data);
//         break;
//       case 'user.deleted':
//         await handleUserDeleted(evt.data);
//         break;
//       default:
//         console.log(`Unhandled event type: ${eventType}`);
//     }

//     res.status(200).json({ message: 'Webhook processed successfully' });
//   } catch (error) {
//     console.error('Error processing webhook:', error);
//     res.status(500).json({ error: 'Error processing webhook' });
//   }
// });

// // Webhook handlers
// const handleUserCreated = async (userData: ClerkWebhookEvent['data']) => {
//   try {
//     const user = new User({
//       clerkId: userData.id,
//       email: userData.email_addresses[0]?.email_address,
//       firstName: userData.first_name,
//       lastName: userData.last_name,
//       profileImage: userData.profile_image_url,
//       createdAt: new Date(userData.created_at),
//     });

//     await user.save();
//     console.log('New user created:', user.email);
//   } catch (error) {
//     console.error('Error creating user:', error);
//     throw error;
//   }
// };

// const handleUserUpdated = async (userData: ClerkWebhookEvent['data']) => {
//   try {
//     const user = await User.findOne({ clerkId: userData.id });
    
//     if (user) {
//       user.email = userData.email_addresses[0]?.email_address || user.email;
//       user.firstName = userData.first_name;
//       user.lastName = userData.last_name;
//       user.profileImage = userData.profile_image_url;
//       user.lastActive = new Date();
      
//       await user.save();
//       console.log('User updated:', user.email);
//     }
//   } catch (error) {
//     console.error('Error updating user:', error);
//     throw error;
//   }
// };

// const handleUserDeleted = async (userData: ClerkWebhookEvent['data']) => {
//   try {
//     await User.findOneAndDelete({ clerkId: userData.id });
//     console.log('User deleted:', userData.id);
//   } catch (error) {
//     console.error('Error deleting user:', error);
//     throw error;
//   }
// };

// // API Routes for your frontend to interact with user data
// app.get('/api/users/:clerkId', async (req: express.Request, res: express.Response) => {
//   try {
//     const user = await User.findOne({ clerkId: req.params.clerkId });
    
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Update last active
//     user.lastActive = new Date();
//     await user.save();

//     res.json(user);
//   } catch (error) {
//     console.error('Error fetching user:', error);
//     res.status(500).json({ message: 'Error fetching user' });
//   }
// });

// // Add to watchlist
// app.post('/api/users/:clerkId/watchlist', async (req: express.Request, res: express.Response) => {
//   try {
//     const { movieId } = req.body;
//     const user = await User.findOne({ clerkId: req.params.clerkId });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Check if already in watchlist
//     const existingItem = user.watchlist.find(item => item.movieId === movieId);
//     if (existingItem) {
//       return res.status(400).json({ message: 'Movie already in watchlist' });
//     }

//     user.watchlist.push({ movieId, addedAt: new Date() });
//     await user.save();

//     res.json({ message: 'Added to watchlist', watchlist: user.watchlist });
//   } catch (error) {
//     console.error('Error adding to watchlist:', error);
//     res.status(500).json({ message: 'Error adding to watchlist' });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// export default app;