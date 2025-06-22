// WatchListController.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import WatchList from '../models/WatchList';
import WatchHistory from '../models/WatchHistory';

interface AuthenticatedRequest extends Request {
  auth: {
    userId: string;
  };
}

export const getAllWatchListItems = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log("Entered the gtwatchalltiens ")
    const userId = req.auth.userId;
    
    const {
      page = 1,
      limit = 20,
      sortBy = 'addedAt',
      sortOrder = 'desc',
      contentType,
      genre,
      priority,
      includeWatched = false
    } = req.query as any;

    const filter: any = { userId };

    if (contentType) {
      filter.contentType = contentType;
    }

    if (genre) {
      filter.genre = { $in: [genre] };
    }

    if (priority) {
      filter.priority = Number(priority);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortObj: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    let watchlistItems = await WatchList.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    if (includeWatched === 'false') {
      const watchedContentIds = await WatchHistory.find({ 
        userId,
        completed: true 
      }).distinct('contentId');

      watchlistItems = watchlistItems.filter(item => 
        !watchedContentIds.includes(item.contentId)
      );
    }

    const totalCount = await WatchList.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: watchlistItems,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalItems: totalCount,
        itemsPerPage: Number(limit),
        hasNextPage: skip + watchlistItems.length < totalCount,
        hasPrevPage: Number(page) > 1
      }
    });
  } catch (error: any) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch watchlist',
      error: error.message
    });
  }
};

export const addToWatchList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log("Entered the add to watchlist funciton ")

    const userId = req.auth.userId;
    const {
      contentId,
      contentType,
      title,
      priority = 3,
      genre,
      estimatedDuration
    } = req.body;

    const existingItem = await WatchList.findOne({ userId, contentId });
    
    if (existingItem) {
      return res.status(409).json({
        success: false,
        message: 'Item already exists in watchlist'
      });
    }

    const watchedItem = await WatchHistory.findOne({ 
      userId, 
      contentId, 
      completed: true 
    });

    if (watchedItem) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add already watched content to watchlist'
      });
    }

    const newWatchListItem = new WatchList({
      id: `${userId}_${contentId}_${Date.now()}`,
      userId,
      contentId,
      contentType,
      title,
      priority,
      genre: Array.isArray(genre) ? genre : [genre],
      estimatedDuration,
      addedAt: new Date()
    });

    const savedItem = await newWatchListItem.save();

    res.status(201).json({
      success: true,
      message: 'Item added to watchlist successfully',
      data: savedItem
    });
  } catch (error: any) {
    console.error('Error adding to watchlist:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Item already exists in watchlist'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add item to watchlist',
      error: error.message
    });
  }
};

export const getWatchListItemById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const watchlistItem = await WatchList.findOne({
      _id: id,
      userId
    });

    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    const watchHistory = await WatchHistory.findOne({
      userId,
      contentId: watchlistItem.contentId
    });

    res.status(200).json({
      success: true,
      data: {
        ...watchlistItem.toObject(),
        watchStatus: watchHistory ? {
          watchPercentage: watchHistory.watchPercentage,
          completed: watchHistory.completed,
          watchedAt: watchHistory.watchedAt
        } : null
      }
    });
  } catch (error: any) {
    console.error('Error fetching watchlist item:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid watchlist item ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch watchlist item',
      error: error.message
    });
  }
};

export const updateWatchListItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const userId = req.auth.userId;
    const { id } = req.params;
    const { priority, genre, estimatedDuration } = req.body;

    const watchlistItem = await WatchList.findOne({
      _id: id,
      userId
    });

    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    if (priority !== undefined) watchlistItem.priority = priority;
    if (genre !== undefined) watchlistItem.genre = Array.isArray(genre) ? genre : [genre];
    if (estimatedDuration !== undefined) watchlistItem.estimatedDuration = estimatedDuration;

    const updatedItem = await watchlistItem.save();

    res.status(200).json({
      success: true,
      message: 'Watchlist item updated successfully',
      data: updatedItem
    });
  } catch (error: any) {
    console.error('Error updating watchlist item:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid watchlist item ID'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update watchlist item',
      error: error.message
    });
  }
};

export const removeFromWatchList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const deletedItem = await WatchList.findOneAndDelete({
      _id: id,
      userId
    });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item removed from watchlist successfully',
      data: { id: deletedItem._id, title: deletedItem.title }
    });
  } catch (error: any) {
    console.error('Error removing from watchlist:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid watchlist item ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to remove item from watchlist',
      error: error.message
    });
  }
};

export const getWatchListStatistics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;

    const stats = await WatchList.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalEstimatedDuration: { $sum: '$estimatedDuration' },
          averagePriority: { $avg: '$priority' },
          genreBreakdown: { $push: '$genre' },
          contentTypeBreakdown: { $push: '$contentType' },
          priorityBreakdown: {
            $push: {
              priority: '$priority',
              count: 1
            }
          }
        }
      }
    ]);

    const genreStats = await WatchList.aggregate([
      { $match: { userId } },
      { $unwind: '$genre' },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const contentTypeStats = await WatchList.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$contentType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const priorityStats = await WatchList.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const result = {
      overview: stats[0] || {
        totalItems: 0,
        totalEstimatedDuration: 0,
        averagePriority: 0
      },
      genreDistribution: genreStats,
      contentTypeDistribution: contentTypeStats,
      priorityDistribution: priorityStats
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error fetching watchlist statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch watchlist statistics',
      error: error.message
    });
  }
};

export const getNextToWatch = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    const { limit = 10 } = req.query as any;
    console.log("ENtered the getNext to watch function ");
    const nextItems = await WatchList.find({ userId })
      .sort({ priority: -1, addedAt: 1 })
      .limit(Number(limit))
      .lean();

    const watchedContentIds = await WatchHistory.find({ 
      userId,
      completed: true 
    }).distinct('contentId');

    const unwatchedItems = nextItems.filter(item => 
      !watchedContentIds.includes(item.contentId)
    );

    res.status(200).json({
      success: true,
      data: unwatchedItems,
      message: `Next ${unwatchedItems.length} items to watch`
    });
  } catch (error: any) {
    console.error('Error fetching next to watch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch next items to watch',
      error: error.message
    });
  }
};

