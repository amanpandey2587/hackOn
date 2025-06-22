import express from 'express';
import {
  getAllWatchListItems,
  addToWatchList,
  getWatchListItemById,
  updateWatchListItem,
  removeFromWatchList,
  getWatchListStatistics,
  getNextToWatch
} from '../controllers/WatchList';

const router = express.Router();

router.get('/', getAllWatchListItems);
router.post('/', addToWatchList);
router.get('/statistics', getWatchListStatistics);
router.get('/next', getNextToWatch);
router.get('/:id', getWatchListItemById);
router.patch('/:id', updateWatchListItem);
router.delete('/:id', removeFromWatchList);

export default router;