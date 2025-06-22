// backend/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import recommendationRouter from './routes/recommendation.route';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', recommendationRouter);

mongoose.connect(process.env.MONGO_URI || '', { autoIndex: true })
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(3001, () => console.log('🚀 Server running on http://localhost:3001'));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });
