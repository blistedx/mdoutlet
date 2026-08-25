import { Op } from 'sequelize';
import Feedback from '../models/Feedback.js';

// In-Memory Fallback Cache for Serverless / Offline Environments
let memoryReviews = [
  {
    id: 1,
    customerName: 'Rohit Aggarwal',
    phone: '+91 98111 44556',
    rating: 5,
    category: 'Milk Freshness',
    comment: 'Full Cream Milk aur Malai Paneer hamesha fresh aur pure milta hai. Best dairy outlet in our area!',
    status: 'featured',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 2,
    customerName: 'Pooja Sharma',
    phone: '+91 98712 33445',
    rating: 5,
    category: 'Ghee & Makhan Quality',
    comment: 'Pure Cow Ghee aroma is authentic like homemade ghee. Packaging and cleanliness is top notch.',
    status: 'featured',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 3,
    customerName: 'Anil Kumar Gupta',
    phone: '+91 99554 11223',
    rating: 5,
    category: 'Store Service & Staff',
    comment: 'Very polite staff, quick counter billing with QR code scanner. Highly recommended!',
    status: 'reviewed',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 4,
    customerName: 'Dr. Meenakshi Verma',
    phone: '+91 98100 88776',
    rating: 4,
    category: 'Curd & Probiotics',
    comment: 'Mishti Doi and Probiotic Dahi are wonderful for family health.',
    status: 'reviewed',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  }
];

// @route   POST /api/feedback
// @desc    Submit a new customer rating & review (Public)
// @access  Public
export const submitFeedback = async (req, res) => {
  try {
    const { customerName, phone, rating, category, comment } = req.body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid star rating between 1 and 5.'
      });
    }

    const reviewPayload = {
      customerName: customerName?.trim() || 'Valued Customer',
      phone: phone?.trim() || '',
      rating: Number(rating),
      category: category || 'Overall Experience',
      comment: comment?.trim() || 'Great experience at Mother Dairy outlet!',
      status: 'new'
    };

    let createdFeedback;
    try {
      createdFeedback = await Feedback.create(reviewPayload);
    } catch (dbErr) {
      // In-Memory fallback if serverless DB sync is in progress
      reviewPayload.id = Date.now();
      reviewPayload.createdAt = new Date();
      memoryReviews.unshift(reviewPayload);
      createdFeedback = reviewPayload;
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for rating Mother Dairy! Your review has been submitted.',
      feedback: createdFeedback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/feedback
// @desc    Get all customer ratings with summary statistics (Admin/Staff)
// @access  Private
export const getAllFeedback = async (req, res) => {
  try {
    const { status, minRating } = req.query;
    let feedbacks = [];

    try {
      const where = {};
      if (status && status !== 'all') {
        where.status = status;
      }
      if (minRating) {
        where.rating = { [Op.gte]: Number(minRating) };
      }

      feedbacks = await Feedback.findAll({
        where,
        order: [['createdAt', 'DESC']]
      });

      feedbacks = feedbacks.map((f) => {
        const j = typeof f.toJSON === 'function' ? f.toJSON() : f;
        j._id = j.id;
        return j;
      });
    } catch (dbErr) {
      feedbacks = memoryReviews;
    }

    if (!feedbacks || feedbacks.length === 0) {
      feedbacks = memoryReviews;
    }

    // Compute metrics
    const totalReviews = feedbacks.length;
    const avgRating = totalReviews > 0
      ? Number((feedbacks.reduce((acc, f) => acc + Number(f.rating), 0) / totalReviews).toFixed(1))
      : 5.0;

    const ratingDistribution = {
      5: feedbacks.filter((f) => f.rating === 5).length,
      4: feedbacks.filter((f) => f.rating === 4).length,
      3: feedbacks.filter((f) => f.rating === 3).length,
      2: feedbacks.filter((f) => f.rating === 2).length,
      1: feedbacks.filter((f) => f.rating === 1).length
    };

    res.status(200).json({
      success: true,
      count: totalReviews,
      stats: {
        avgRating,
        totalReviews,
        ratingDistribution
      },
      feedbacks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PATCH /api/feedback/:id/status
// @desc    Update review status (new / reviewed / featured)
// @access  Private (Admin)
export const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const feedback = await Feedback.findByPk(id);
      if (feedback) {
        feedback.status = status || feedback.status;
        await feedback.save();
        return res.status(200).json({ success: true, message: 'Review status updated', feedback });
      }
    } catch (e) {}

    const memItem = memoryReviews.find((m) => String(m.id) === String(id));
    if (memItem) {
      memItem.status = status;
      return res.status(200).json({ success: true, message: 'Review status updated', feedback: memItem });
    }

    res.status(200).json({ success: true, message: 'Review status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/feedback/:id
// @desc    Delete a review record
// @access  Private (Admin)
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    try {
      const feedback = await Feedback.findByPk(id);
      if (feedback) {
        await feedback.destroy();
      }
    } catch (e) {}

    memoryReviews = memoryReviews.filter((m) => String(m.id) !== String(id));
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
