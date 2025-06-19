import { connectDB } from "./db";
import { Party } from "./models/Party";
import dotenv from "dotenv";

dotenv.config();

const seedParties = async () => {
  await connectDB();
  
  const parties = [
    { title: "House of the Dragon", members: [], isPrivate: false },
    { title: "Breaking Bad Rewatch", members: [], isPrivate: true },
    { title: "Stranger Things Marathon", members: [], isPrivate: false },
  ];
  
  await Party.deleteMany({}); 
  await Party.insertMany(parties);
  
  console.log("Parties seeded successfully!");
  process.exit(0);
};

seedParties().catch(console.error);