import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import WatchHistory from '../models/WatchHistory';

interface AuthenticatedRequest extends Request {
  auth: {
    userId: string;
  };
}

export const getAllWatchHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;

    const {
      page = 1,
      limit = 20,
      sortBy = 'watchedAt',
      sortOrder = 'desc',
      contentType,
      genre,
      completed
    } = req.query as any;

    const filter: any = { userId };

    if (contentType) {
      filter.contentType = contentType;
    }

    if (genre) {
      filter.genre = { $in: [genre] };
    }

    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortObj: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [watchHistory, totalCount] = await Promise.all([
      WatchHistory.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      WatchHistory.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: watchHistory,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalItems: totalCount,
        itemsPerPage: Number(limit),
        hasNextPage: skip + watchHistory.length < totalCount,
        hasPrevPage: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching watch history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch watch history',
      error
    });
  }
};

// Create watch history
export const createWatchHistory = async (req: AuthenticatedRequest, res: any) => {
  console.log("Data is after entring the function ",req.body)
  try {
    const userId = req.auth.userId;
    console.log("User id in the frontned is",userId)
    const {
      contentId,
      contentType,
      title,
      watchDuration,
      totalDuration,
      genre,
      rating,
      releaseYear,
      seasonNumber,
      episodeNumber,
      streamingPlatform,
    } = req.body;

    const watchPercentage =
      totalDuration > 0
        ? Math.round((watchDuration / totalDuration) * 100)
        : 0;
    const completed = watchPercentage >= 90;

    const existingEntry = await WatchHistory.findOne({
      userId,
      contentId,
      contentType
    });

    let watchHistoryData;

    if (existingEntry) {
      if (watchDuration > existingEntry.watchDuration) {
        existingEntry.watchDuration = watchDuration;
        existingEntry.watchPercentage = watchPercentage;
        existingEntry.completed = completed;
        existingEntry.watchedAt = new Date();


        watchHistoryData = await existingEntry.save();
      } else {
        watchHistoryData = existingEntry;
      }
    } else {
      const newWatchHistory = new WatchHistory({
        id: `${userId}_${contentId}`,
        userId,
        contentId,
        contentType,
        title,
        watchDuration,
        totalDuration,
        watchPercentage,
        completed,
        genre: Array.isArray(genre) ? genre : [genre],
        rating,
        releaseYear,
        seasonNumber,
        episodeNumber,
        streamingService:streamingPlatform,
        watchedAt: new Date()
      });

      watchHistoryData = await newWatchHistory.save();
    }

    res.status(201).json({
      success: true,
      message: 'WatchHistory recorded successfully',
      data: watchHistoryData
    });
  } catch (error: any) {
    console.error('Error creating watch history:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create watch history',
      error: error.message
    });
  }
};

// Get watch history by ID
export const getWatchHistoryById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const { id } = req.params;

    const watchHistory = await WatchHistory.findOne({
      _id: id,
      userId
    });

    if (!watchHistory) {
      return res.status(404).json({
        success: false,
        message: 'Watch history entry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: watchHistory
    });
  } catch (error: any) {
    console.error('Error fetching watch history by ID:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid watch history ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch watch history',
      error: error.message
    });
  }
};

// Delete watch history
export const deleteWatchHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const { id } = req.params;

    const watchHistory = await WatchHistory.findOneAndDelete({
      _id: id,
      userId
    });

    if (!watchHistory) {
      return res.status(404).json({
        success: false,
        message: 'Watch history entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Watch history entry deleted successfully',
      data: { id: watchHistory._id }
    });
  } catch (error: any) {
    console.error('Error deleting watch history:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid watch history ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete watch history',
      error: error.message
    });
  }
};
