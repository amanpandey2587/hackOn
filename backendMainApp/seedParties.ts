import { connectDB } from "./db";
import { Party } from "./models/Party";
import dotenv from "dotenv";
dotenv.config();
const seedParties = async () => {
  await connectDB();
  // Use current time for all createdAt, and mock createdBy users.
  const now = new Date();
  const parties = [
    {
      title: "House of the Dragon",
      members: [
        {
          userId: "host1",
          username: "HostUser1",
          joinedAt: now
        }
      ],
      isPrivate: false,
      tags: ["drama", "thriller", "fantasy"],    // <-- tags!
      createdBy: { userId: "host1", username: "HostUser1" },
      createdAt: now,
    },
    {
      title: "Breaking Bad Rewatch",
      members: [
        {
          userId: "host2",
          username: "HostUser2",
          joinedAt: now
        }
      ],
      isPrivate: true,
      password: "hashedsamplepw",  // If you want to provide a pre-set password (hash or plaintext)
      tags: ["drama", "thriller", "crime"],
      createdBy: { userId: "host2", username: "HostUser2" },
      createdAt: now,
    },
    {
      title: "Stranger Things Marathon",
      members: [
        {
          userId: "host3",
          username: "HostUser3",
          joinedAt: now
        }
      ],
      isPrivate: false,
      tags: ["scifi", "thriller", "comedy", "drama"],
      createdBy: { userId: "host3", username: "HostUser3" },
      createdAt: now,
    },
  ];
  await Party.deleteMany({});
  await Party.insertMany(parties);
  console.log("Parties seeded successfully!");
  process.exit(0);
};
seedParties().catch(console.error);