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
    console.log(`📚 [GET_ALL_WATCH_HISTORY] Starting fetch for userId: ${userId}`);

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
      console.log(`🎬 [GET_ALL_WATCH_HISTORY] Filtering by contentType: ${contentType}`);
    }

    if (genre) {
      filter.genre = { $in: [genre] };
      console.log(`🎭 [GET_ALL_WATCH_HISTORY] Filtering by genre: ${genre}`);
    }

    if (completed !== undefined) {
      filter.completed = completed === 'true';
      console.log(`✅ [GET_ALL_WATCH_HISTORY] Filtering by completed: ${completed}`);
    }

    console.log(`🔍 [GET_ALL_WATCH_HISTORY] Final filter:`, JSON.stringify(filter, null, 2));

    const skip = (Number(page) - 1) * Number(limit);
    const sortObj: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    console.log(`📄 [GET_ALL_WATCH_HISTORY] Pagination - Page: ${page}, Limit: ${limit}, Skip: ${skip}`);
    console.log(`📊 [GET_ALL_WATCH_HISTORY] Sort - By: ${sortBy}, Order: ${sortOrder}`);

    const [watchHistory, totalCount] = await Promise.all([
      WatchHistory.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      WatchHistory.countDocuments(filter)
    ]);

    console.log(`✅ [GET_ALL_WATCH_HISTORY] Successfully fetched ${watchHistory.length} entries out of ${totalCount} total`);

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
    console.error('❌ [GET_ALL_WATCH_HISTORY] Error fetching watch history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch watch history',
      error
    });
  }
};

// Create watch history
export const createWatchHistory = async (req: AuthenticatedRequest, res: any) => {
  console.log("🚀 [CREATE_WATCH_HISTORY] === STARTING WATCH HISTORY CREATION ===");
  console.log("📥 [CREATE_WATCH_HISTORY] Raw request body:", JSON.stringify(req.body, null, 2));
  
  try {
    const userId = req.auth.userId;
    console.log("👤 [CREATE_WATCH_HISTORY] User ID:", userId);
    
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

    console.log("🎬 [CREATE_WATCH_HISTORY] Extracted data:");
    console.log(`  - Content ID: ${contentId}`);
    console.log(`  - Content Type: ${contentType}`);
    console.log(`  - Title: ${title}`);
    console.log(`  - Season Number: ${seasonNumber} (${typeof seasonNumber})`);
    console.log(`  - Episode Number: ${episodeNumber} (${typeof episodeNumber})`);
    console.log(`  - Watch Duration: ${watchDuration}/${totalDuration}`);

    // Determine content type and generate appropriate ID
    const isMovieContent = contentType === 'movie' || (!seasonNumber && !episodeNumber);
    console.log(`🎭 [CREATE_WATCH_HISTORY] Is Movie Content: ${isMovieContent}`);

    let generatedId: string;
    if (isMovieContent) {
      generatedId = `${userId}_${contentId}_movie`;
      console.log(`🎥 [CREATE_WATCH_HISTORY] Generated MOVIE ID: ${generatedId}`);
    } else {
      generatedId = `${userId}_${contentId}_${seasonNumber}_${episodeNumber}`;
      console.log(`📺 [CREATE_WATCH_HISTORY] Generated TV SHOW ID: ${generatedId}`);
    }

    const watchPercentage =
      totalDuration > 0
        ? Math.round((watchDuration / totalDuration) * 100)
        : 0;
    const completed = watchPercentage >= 90;

    console.log(`📊 [CREATE_WATCH_HISTORY] Calculated watch percentage: ${watchPercentage}%`);
    console.log(`✅ [CREATE_WATCH_HISTORY] Completed status: ${completed}`);

    // Check for existing entry
    console.log("🔍 [CREATE_WATCH_HISTORY] Checking for existing entry...");
    
    let existingEntryQuery: any = {
      userId,
      contentId,
      contentType
    };

    // Add season/episode to query only for TV shows
    if (!isMovieContent) {
      existingEntryQuery.seasonNumber = seasonNumber;
      existingEntryQuery.episodeNumber = episodeNumber;
    }

    console.log("🔍 [CREATE_WATCH_HISTORY] Existing entry query:", JSON.stringify(existingEntryQuery, null, 2));

    const existingEntry = await WatchHistory.findOne(existingEntryQuery);

    if (existingEntry) {
      console.log(`🔄 [CREATE_WATCH_HISTORY] Found existing entry with ID: ${existingEntry._id}`);
      console.log(`🔄 [CREATE_WATCH_HISTORY] Existing watch duration: ${existingEntry.watchDuration}, New: ${watchDuration}`);
    } else {
      console.log("➕ [CREATE_WATCH_HISTORY] No existing entry found, will create new one");
    }

    let watchHistoryData;

    if (existingEntry) {
      if (watchDuration > existingEntry.watchDuration) {
        console.log("⬆️ [CREATE_WATCH_HISTORY] Updating existing entry with higher watch duration");
        
        existingEntry.watchDuration = watchDuration;
        existingEntry.watchPercentage = watchPercentage;
        existingEntry.completed = completed;
        existingEntry.watchedAt = new Date();

        console.log("💾 [CREATE_WATCH_HISTORY] Saving updated existing entry...");
        watchHistoryData = await existingEntry.save();
        console.log("✅ [CREATE_WATCH_HISTORY] Successfully updated existing entry!");
        console.log("✅ [CREATE_WATCH_HISTORY] Updated entry data:", JSON.stringify({
          id: watchHistoryData._id,
          customId: watchHistoryData.id,
          userId: watchHistoryData.userId,
          contentId: watchHistoryData.contentId,
          watchDuration: watchHistoryData.watchDuration,
          watchPercentage: watchHistoryData.watchPercentage,
          completed: watchHistoryData.completed
        }, null, 2));
      } else {
        console.log("⏸️ [CREATE_WATCH_HISTORY] Not updating - existing watch duration is higher or equal");
        watchHistoryData = existingEntry;
      }
    } else {
      console.log("🆕 [CREATE_WATCH_HISTORY] Creating new watch history entry...");
      
      const newWatchHistoryData = {
        id: generatedId,
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
        seasonNumber: isMovieContent ? undefined : seasonNumber,
        episodeNumber: isMovieContent ? undefined : episodeNumber,
        streamingService: streamingPlatform,
        watchedAt: new Date()
      };

      console.log("📝 [CREATE_WATCH_HISTORY] New entry data to be saved:", JSON.stringify(newWatchHistoryData, null, 2));

      const newWatchHistory = new WatchHistory(newWatchHistoryData);

      console.log("💾 [CREATE_WATCH_HISTORY] Attempting to save new entry to database...");
      watchHistoryData = await newWatchHistory.save();
      
      console.log("🎉 [CREATE_WATCH_HISTORY] ✅ NEW ENTRY SUCCESSFULLY SAVED TO DATABASE! ✅");
      console.log("🎉 [CREATE_WATCH_HISTORY] Saved entry details:");
      console.log(`  - Database ID: ${watchHistoryData._id}`);
      console.log(`  - Custom ID: ${watchHistoryData.id}`);
      console.log(`  - User ID: ${watchHistoryData.userId}`);
      console.log(`  - Content ID: ${watchHistoryData.contentId}`);
      console.log(`  - Content Type: ${watchHistoryData.contentType}`);
      console.log(`  - Title: ${watchHistoryData.title}`);
      console.log(`  - Watch Duration: ${watchHistoryData.watchDuration}`);
      console.log(`  - Watch Percentage: ${watchHistoryData.watchPercentage}%`);
      console.log(`  - Completed: ${watchHistoryData.completed}`);
      console.log(`  - Season: ${watchHistoryData.seasonNumber || 'N/A'}`);
      console.log(`  - Episode: ${watchHistoryData.episodeNumber || 'N/A'}`);
      console.log(`  - Saved At: ${watchHistoryData.watchedAt}`);
    }

    console.log("📤 [CREATE_WATCH_HISTORY] Sending success response...");
    res.status(201).json({
      success: true,
      message: 'WatchHistory recorded successfully',
      data: watchHistoryData
    });

    console.log("🏁 [CREATE_WATCH_HISTORY] === WATCH HISTORY CREATION COMPLETED SUCCESSFULLY ===");

  } catch (error: any) {
    console.error('❌ [CREATE_WATCH_HISTORY] === ERROR OCCURRED ===');
    console.error('❌ [CREATE_WATCH_HISTORY] Error details:', error);
    console.error('❌ [CREATE_WATCH_HISTORY] Error name:', error.name);
    console.error('❌ [CREATE_WATCH_HISTORY] Error message:', error.message);
    
    if (error.stack) {
      console.error('❌ [CREATE_WATCH_HISTORY] Error stack:', error.stack);
    }

    if (error.name === 'ValidationError') {
      console.error('❌ [CREATE_WATCH_HISTORY] Validation error details:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }

    if (error.code === 11000) {
      console.error('❌ [CREATE_WATCH_HISTORY] Duplicate key error - ID collision detected!');
      console.error('❌ [CREATE_WATCH_HISTORY] Duplicate key details:', error.keyValue);
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

    console.log(`🔍 [GET_BY_ID] Fetching watch history for userId: ${userId}, id: ${id}`);

    const watchHistory = await WatchHistory.findOne({
      _id: id,
      userId
    });

    if (!watchHistory) {
      console.log(`❌ [GET_BY_ID] Watch history entry not found for id: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Watch history entry not found'
      });
    }

    console.log(`✅ [GET_BY_ID] Successfully found watch history entry:`, {
      id: watchHistory._id,
      customId: watchHistory.id,
      title: watchHistory.title,
      contentType: watchHistory.contentType
    });

    res.status(200).json({
      success: true,
      data: watchHistory
    });
  } catch (error: any) {
    console.error('❌ [GET_BY_ID] Error fetching watch history by ID:', error);

    if (error.name === 'CastError') {
      console.error('❌ [GET_BY_ID] Invalid ID format provided');
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

    console.log(`🗑️ [DELETE] Attempting to delete watch history for userId: ${userId}, id: ${id}`);

    const watchHistory = await WatchHistory.findOneAndDelete({
      _id: id,
      userId
    });

    if (!watchHistory) {
      console.log(`❌ [DELETE] Watch history entry not found for deletion, id: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Watch history entry not found'
      });
    }

    console.log(`✅ [DELETE] Successfully deleted watch history entry:`, {
      id: watchHistory._id,
      customId: watchHistory.id,
      title: watchHistory.title
    });

    res.status(200).json({
      success: true,
      message: 'Watch history entry deleted successfully',
      data: { id: watchHistory._id }
    });
  } catch (error: any) {
    console.error('❌ [DELETE] Error deleting watch history:', error);

    if (error.name === 'CastError') {
      console.error('❌ [DELETE] Invalid ID format provided for deletion');
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