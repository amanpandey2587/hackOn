import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Test API route
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// Parties route
app.get("/api/parties", (req, res) => {
  res.json([
    { _id: "1", title: "Test Party 1", members: [], isPrivate: false },
    { _id: "2", title: "Test Party 2", members: [], isPrivate: true }
  ]);
});

app.listen(4000, () => {
  console.log("Test server running on http://localhost:4000");
  console.log("Available routes:");
  console.log("  GET http://localhost:4000/");
  console.log("  GET http://localhost:4000/api/test");
  console.log("  GET http://localhost:4000/api/parties");
});