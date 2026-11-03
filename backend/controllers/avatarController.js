const Avatar = require('../models/Avatar');
const { getStatus } = require('../config/db');
const { generateAvatars } = require('../services/aiService');
const { sendAvatarDossierEmail } = require('../services/emailService');
const { generateAvatarPdfBuffer } = require('../services/pdfService');

// In-memory store when MongoDB is offline (starts clean without demo records)
let memoryStore = [];

// Helper to compare if two sets of inputs are identical
function areInputsIdentical(a, b) {
  if (!a || !b) return false;
  const norm = str => (str || '').toString().trim().replace(/\r\n/g, '\n').replace(/\s+/g, ' ');
  return (
    norm(a.intro) === norm(b.intro) &&
    norm(a.icp) === norm(b.icp) &&
    norm(a.life) === norm(b.life) &&
    norm(a.yacht) === norm(b.yacht) &&
    norm(a.both) === norm(b.both)
  );
}

/**
 * Generate Avatar Dossier
 * POST /api/avatars/generate
 */
exports.generate = async (req, res) => {
  try {
    const { intro, icp, life, yacht, both } = req.body;

    if (!intro || !icp || !life || !yacht || !both) {
      return res.status(400).json({
        success: false,
        message: 'All 5 fields (Intro, ICP, Lifeboat, Yacht, and How you help both) are mandatory.'
      });
    }

    const cleanInputs = {
      intro: (intro || '').trim(),
      icp: (icp || '').trim(),
      life: (life || '').trim(),
      yacht: (yacht || '').trim(),
      both: (both || '').trim(),
    };

    const isRegenerate = Boolean(req.body?.regenerate || req.query?.regenerate);

    // Check if an avatar was already generated for these same inputs (same input = same result, unless regenerate requested)
    let existingRecord = null;
    if (!isRegenerate) {
      if (getStatus()) {
        const userFilter = req.user ? { user: req.user._id } : {};
        const candidates = await Avatar.find(userFilter).sort({ createdAt: -1 });
        existingRecord = candidates.find(c => areInputsIdentical(c.inputs, cleanInputs));
        if (!existingRecord && !req.user) {
          const allCandidates = await Avatar.find({}).sort({ createdAt: -1 }).limit(50);
          existingRecord = allCandidates.find(c => areInputsIdentical(c.inputs, cleanInputs));
        }
      } else {
        const userId = req.user ? req.user._id?.toString() : null;
        existingRecord = memoryStore.find(c => {
          const matchUser = !userId || (c.user && c.user.toString() === userId);
          return matchUser && areInputsIdentical(c.inputs, cleanInputs);
        });
        if (!existingRecord && !userId) {
          existingRecord = memoryStore.find(c => areInputsIdentical(c.inputs, cleanInputs));
        }
      }
    }

    if (existingRecord && existingRecord.output) {
      console.log(`[Avatar Generation] Matching inputs detected. Returning previously generated avatar (${existingRecord._id}).`);
      return res.status(200).json({
        success: true,
        message: 'Existing avatar for identical inputs retrieved',
        data: existingRecord.output,
        saved: existingRecord,
        cached: true,
      });
    }

    const output = await generateAvatars({ intro, icp, life, yacht, both });

    // Automatically save generated dossier to database
    const defaultTitle = `${output.lifeboat?.characterName?.split(' ')[1] || 'Lifeboat'} & ${output.yacht?.characterName?.split(' ')[1] || 'Yacht'}`;
    let savedRecord = null;

    if (getStatus()) {
      savedRecord = await Avatar.create({
        title: defaultTitle,
        user: req.user ? req.user._id : null,
        inputs: { intro, icp, life, yacht, both },
        output,
        isExample: false
      });
    } else {
      savedRecord = {
        _id: 'local-' + Date.now(),
        title: defaultTitle,
        user: req.user ? req.user._id : null,
        inputs: { intro, icp, life, yacht, both },
        output,
        isExample: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.unshift(savedRecord);
    }

    // Automatically email the dossier with attached PDF to the user (To) and Sir (BCC: sachin@wowos.in)
    const toEmail = req.user?.email || req.body.userEmail;
    const recipientName = req.user?.name || req.body.userName || 'Customer';
    let emailStatus = null;

    if (toEmail) {
      try {
        const pdfBuffer = await generateAvatarPdfBuffer({
          ...output,
          title: defaultTitle,
        });

        if (pdfBuffer) {
          const safeFilename = `${(output.lifeboat?.characterName || 'Customer_Avatar')
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase()}_dossier.pdf`;

          emailStatus = await sendAvatarDossierEmail({
            toEmail,
            recipientName,
            pdfBuffer,
            pdfFilename: safeFilename,
            lifeboatName: output.lifeboat?.characterName || 'Lifeboat Avatar',
            yachtName: output.yacht?.characterName || 'Yacht Avatar',
          });
        } else {
          console.log('[Avatar Generation] Server-side PDF generator deferred to client-rendered visual PDF.');
        }
      } catch (emailErr) {
        console.error('[Avatar Generation] Email delivery failed:', emailErr.message);
        emailStatus = { success: false, error: emailErr.message };
      }
    } else {
      console.log('[Avatar Generation] No user email found; skipping automatic email delivery.');
    }

    return res.status(200).json({
      success: true,
      message: 'Avatars generated, saved automatically, and emailed with PDF attached',
      data: output,
      saved: savedRecord,
      email: emailStatus
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
        ? { user: req.user._id }
        : { isExample: true };
      const avatars = await Avatar.find(query).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: avatars.length,
        source: 'mongodb',
        data: avatars
      });
    } else {
      const list = req.user
        ? memoryStore.filter(a => a.user && a.user.toString() === req.user._id.toString())
        : [];
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


/**
 * Send or Re-send avatar dossier email with PDF
 * POST /api/avatars/send-email
 */
exports.sendEmail = async (req, res) => {
  try {
    const { output, pdfBase64, toEmail: manualTo, recipientName: manualName, avatarId } = req.body;

    let dossierData = output;
    if (!dossierData && avatarId) {
      if (getStatus()) {
        const found = await Avatar.findById(avatarId);
        if (found) dossierData = found.output;
      } else {
        const found = memoryStore.find(item => item._id === avatarId);
        if (found) dossierData = found.output;
      }
    }

    if (!dossierData) {
      return res.status(400).json({
        success: false,
        message: 'No avatar data provided to email.',
      });
    }

    const toEmail = manualTo || req.user?.email;
    const recipientName = manualName || req.user?.name || 'Customer';

    if (!toEmail) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email is required.',
      });
    }

    let pdfBuffer = null;
    // Always prefer pristine vector PDF generated directly from dossier data
    if (dossierData) {
      try {
        pdfBuffer = await generateAvatarPdfBuffer(dossierData);
      } catch (err) {
        console.warn('[Avatar Email] Server PDF generator error, falling back:', err.message);
      }
    }

    // Fallback to client-provided base64 only if server-side generator failed or was unavailable
    if (!pdfBuffer && pdfBase64 && typeof pdfBase64 === 'string') {
      const cleanBase64 = pdfBase64.includes('base64,')
        ? pdfBase64.split('base64,')[1].replace(/\s+/g, '')
        : pdfBase64.replace(/^data:[^,]+,/, '').replace(/\s+/g, '');
      const decoded = Buffer.from(cleanBase64, 'base64');
      if (decoded && decoded.length > 50 && decoded.slice(0, 4).toString() === '%PDF') {
        pdfBuffer = decoded;
      }
    }

    const safeFilename = req.body.pdfFilename || `${(dossierData.lifeboat?.characterName || 'Customer_Avatar')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()}_dossier.pdf`;

    const emailResult = await sendAvatarDossierEmail({
      toEmail,
      recipientName,
      pdfBuffer,
      pdfFilename: safeFilename,
      lifeboatName: dossierData.lifeboat?.characterName || 'Lifeboat Avatar',
      yachtName: dossierData.yacht?.characterName || 'Yacht Avatar',
    });

    return res.status(200).json({
      success: emailResult.success,
      message: emailResult.success
        ? `Customer avatar email successfully sent`
        : `Email delivery failed: ${emailResult.error || emailResult.message}`,
      email: emailResult,
    });
  } catch (err) {
    console.error('Error sending avatar email:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send avatar email: ' + err.message,
    });
  }
};

/**
 * Download vector PDF directly
 * POST /api/avatars/download-pdf
 */
exports.downloadPdf = async (req, res) => {
  try {
    const { output } = req.body;
    if (!output) {
      return res.status(400).json({ success: false, message: 'No avatar data provided for PDF download.' });
    }
    const pdfBuffer = await generateAvatarPdfBuffer(output);
    if (!pdfBuffer) {
      return res.status(500).json({ success: false, message: 'Server PDF generation unavailable.' });
    }
    const safeFilename = `${(output.lifeboat?.characterName || 'Customer_Avatar')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()}_dossier.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('Error downloading avatar PDF:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate PDF: ' + err.message });
  }
};
