const Avatar = require('../models/Avatar');
const { getStatus } = require('../config/db');
const { generateAvatars, WOW_EXAMPLE_OUT } = require('../services/aiService');

// Fallback in-memory store when MongoDB is disconnected
let memoryStore = [
  {
    _id: "example-wow-events",
    title: "WOW Events - Rhea & Vikram",
    inputs: {
      intro: "WOW Events Pvt. Ltd. is an events and experience design agency in India. We concept, design and produce brand launches, dealer meets, conferences and offsites that people talk about long after.",
      icp: "Marketing heads, brand managers and founders at mid-to-large Indian companies (₹50 Cr+ revenue) who run 3–10 corporate events a year and are judged on how those events land with leadership, dealers and customers.",
      life: "1. Event is 2–3 weeks away and the current vendor has dropped the ball or gone silent.\n2. Leadership is unhappy with last year's 'same old' event and the marketing head's credibility is on the line.\n3. Budget is fixed and tight, and they can't afford overruns or surprises.",
      yacht: "1. They want their annual flagship event to set a new benchmark in their industry.\n2. They want one trusted partner across the year instead of juggling many vendors.\n3. They want events that create content, PR buzz and measurable brand impact.",
      both: "For Lifeboat clients we step in fast with a rapid-rescue team, a fixed-scope plan in 48 hours and daily updates. For Yacht clients we offer an annual experience partnership with concept labs, design-led themes and post-event impact reports. Lifeboat wins become Yacht retainers."
    },
    output: WOW_EXAMPLE_OUT,
    isExample: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * Generate Avatar Dossier
 * POST /api/avatars/generate
 */
exports.generate = async (req, res) => {
  try {
    const { intro, icp, life, yacht, both } = req.body;

    if (!intro || !icp || !life || !yacht) {
      return res.status(400).json({
        success: false,
        message: 'Intro, ICP, Lifeboat, and Yacht fields are required.'
      });
    }

    const output = await generateAvatars({ intro, icp, life, yacht, both });

    return res.status(200).json({
      success: true,
      data: output
    });
  } catch (error) {
    console.error('Error in avatar generation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate avatars. ' + error.message
    });
  }
};

/**
 * Get all saved avatars
 * GET /api/avatars
 */
exports.getAll = async (req, res) => {
  try {
    if (getStatus()) {
      const query = req.user
        ? { $or: [{ user: req.user._id }, { user: null }, { isExample: true }] }
        : {};
      const avatars = await Avatar.find(query).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: avatars.length,
        source: 'mongodb',
        data: avatars
      });
    } else {
      const list = req.user
        ? memoryStore.filter(a => !a.user || a.user === req.user._id || a.isExample)
        : memoryStore;
      return res.status(200).json({
        success: true,
        count: list.length,
        source: 'memory_fallback',
        data: list
      });
    }
  } catch (error) {
    console.error('Error fetching avatars:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get avatar by ID
 * GET /api/avatars/:id
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    if (getStatus()) {
      const avatar = await Avatar.findById(id);
      if (!avatar) {
        return res.status(404).json({ success: false, message: 'Avatar not found' });
      }
      return res.status(200).json({ success: true, data: avatar });
    } else {
      const item = memoryStore.find(a => a._id === id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Avatar not found' });
      }
      return res.status(200).json({ success: true, data: item });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Save / Create new Avatar record
 * POST /api/avatars
 */
exports.create = async (req, res) => {
  try {
    const { title, inputs, output, isExample } = req.body;

    if (!inputs || !output) {
      return res.status(400).json({
        success: false,
        message: 'Inputs and generated output are required to save an avatar.'
      });
    }

    const defaultTitle = title ||
      `${output.lifeboat?.characterName?.split(' ')[1] || 'Lifeboat'} & ${output.yacht?.characterName?.split(' ')[1] || 'Yacht'}` ||
      'Customer Avatar Dossier';

    if (getStatus()) {
      const newAvatar = await Avatar.create({
        title: defaultTitle,
        user: req.user ? req.user._id : null,
        inputs,
        output,
        isExample: Boolean(isExample)
      });
      return res.status(201).json({
        success: true,
        message: 'Avatar saved to database successfully',
        data: newAvatar
      });
    } else {
      const newRecord = {
        _id: 'local-' + Date.now(),
        title: defaultTitle,
        user: req.user ? req.user._id : null,
        inputs,
        output,
        isExample: Boolean(isExample),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.unshift(newRecord);
      return res.status(201).json({
        success: true,
        message: 'Avatar saved to local storage (MongoDB offline)',
        data: newRecord
      });
    }
  } catch (error) {
    console.error('Error saving avatar:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update an existing avatar
 * PUT /api/avatars/:id
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, inputs, output } = req.body;

    if (getStatus()) {
      const updated = await Avatar.findByIdAndUpdate(
        id,
        { ...(title && { title }), ...(inputs && { inputs }), ...(output && { output }), updatedAt: Date.now() },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Avatar not found' });
      }
      return res.status(200).json({ success: true, data: updated });
    } else {
      const index = memoryStore.findIndex(a => a._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Avatar not found' });
      }
      memoryStore[index] = {
        ...memoryStore[index],
        ...(title && { title }),
        ...(inputs && { inputs }),
        ...(output && { output }),
        updatedAt: new Date()
      };
      return res.status(200).json({ success: true, data: memoryStore[index] });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete an avatar
 * DELETE /api/avatars/:id
 */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    if (getStatus()) {
      const deleted = await Avatar.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Avatar not found' });
      }
      return res.status(200).json({ success: true, message: 'Avatar deleted successfully' });
    } else {
      const initialLength = memoryStore.length;
      memoryStore = memoryStore.filter(a => a._id !== id);
      if (memoryStore.length === initialLength) {
        return res.status(404).json({ success: false, message: 'Avatar not found' });
      }
      return res.status(200).json({ success: true, message: 'Avatar deleted successfully' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

