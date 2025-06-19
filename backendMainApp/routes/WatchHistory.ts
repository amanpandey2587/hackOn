// import express from 'express';
const express=require('express')
import {
    getAllWatchHistory,
    createWatchHistory,
    getWatchHistoryById,
    deleteWatchHistory
  } from '../controllers/WatchHistory';
  import { requireAuth } from '@clerk/express';
  
  const router = express.Router();
  
  
  // GET /api/watch-history
  router.get('/getWatchHistory', getAllWatchHistory);
  
  // POST /api/watch-history
  router.post('/createWatchHistory', createWatchHistory);
  
  // GET /api/watch-history/:id
  router.get('/getWatchHistoryById/:id', getWatchHistoryById);
  
  // DELETE /api/watch-history/:id
  router.delete('/getWatchHistoryById/:id', deleteWatchHistory);
  
  export default router;