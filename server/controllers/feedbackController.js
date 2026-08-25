import { Op } from 'sequelize';
import Feedback from '../models/Feedback.js';


// @route   POST /api/feedback
// @desc    Submit a new customer rating & review (Public)
// @access  Public
export const submitFeedback = async (req, res) => {
  try {
    const { customerName, phone, rating, category, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid star rating between 1 and 5.'
      });
    }

    const newFeedback = await Feedback.create({
      customerName: customerName?.trim() || 'Valued Customer',
      phone: phone?.trim() || '',
      rating: Number(rating),
      category: category || 'Overall Experience',
      comment: comment?.trim() || 'Great experience at Mother Dairy outlet!',
      status: 'new'
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for rating Mother Dairy! Your review has been submitted.',
      feedback: newFeedback
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
    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }
    if (minRating) {
      where.rating = { [Op.gte]: Number(minRating) };
    }

    const feedbacks = await Feedback.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

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
      feedbacks: feedbacks.map((f) => {
        const j = f.toJSON();
        j._id = j.id;
        return j;
      })
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

    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    feedback.status = status || feedback.status;
    await feedback.save();

    res.status(200).json({
      success: true,
      message: 'Review status updated',
      feedback
    });
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
    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await feedback.destroy();
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
