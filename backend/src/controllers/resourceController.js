import ResourceSheet from '../models/ResourceSheet.js';
import Resource from '../models/Resource.js';
import { validateObjectId } from './shared/validation.js';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';

// ─── Response Normalizers (consistent _id → id mapping) ──────────────────────

const formatSheetResponse = (sheet) => {
  if (!sheet) return null;
  const doc = sheet.toObject ? sheet.toObject() : sheet;
  return {
    id: (doc._id || sheet._id).toString(),
    name: doc.name,
    description: doc.description,
    subject: doc.subject,
    chapter: doc.chapter,
    isPublic: doc.isPublic,
    user: doc.user ? doc.user.toString() : null,
    resourceCount: doc.resourceCount,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const formatResourceResponse = (resource) => {
  if (!resource) return null;
  const doc = resource.toObject ? resource.toObject() : resource;
  return {
    id: (doc._id || resource._id).toString(),
    title: doc.title,
    type: doc.type,
    url: doc.url,
    description: doc.description,
    notes: doc.notes,
    tags: doc.tags,
    difficulty: doc.difficulty,
    estimatedTime: doc.estimatedTime,
    subject: doc.subject,
    chapter: doc.chapter,
    isFavorite: doc.isFavorite,
    isCompleted: doc.isCompleted,
    resourceSheet: doc.resourceSheet ? doc.resourceSheet.toString() : null,
    user: doc.user ? doc.user.toString() : null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

// HTML entity escaper for XSS-safe HTML export
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Mongoose-aware error handler for resource CRUD operations
const handleResourceError = (error, res, defaultMessage) => {
  if (res.headersSent) {
    console.error(`${defaultMessage} (headers already sent):`, error.message);
    return;
  }
  console.error(defaultMessage + ':', error);

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Invalid value for ${error.path}.` });
  }
  if (error.code === 11000) {
    return res.status(409).json({ success: false, message: 'A resource with this data already exists.' });
  }
  res.status(500).json({ success: false, message: defaultMessage });
};

// ─── Resource Sheets ──────────────────────────────────────────────────────────

// Create new Resource Sheet (collection)
export const createSheet = async (req, res) => {
  try {
    const { name, description, isPublic, subject, chapter } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Collection name is required.' });
    }

    const sheet = new ResourceSheet({
      name,
      description: description || '',
      subject: subject || '',
      chapter: chapter || '',
      isPublic: !!isPublic,
      user: req.user.id,
    });

    await sheet.save();
    res.status(201).json(formatSheetResponse(sheet));
  } catch (error) {
    handleResourceError(error, res, 'Failed to create resource sheet.');
  }
};

// Get all sheets for the logged-in user
export const getSheets = async (req, res) => {
  try {
    const sheets = await ResourceSheet.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    // Enrich sheets with count of resources
    const enrichedSheets = await Promise.all(sheets.map(async (sheet) => {
      const count = await Resource.countDocuments({ resourceSheet: sheet._id });
      return {
        ...formatSheetResponse(sheet),
        resourceCount: count
      };
    }));

    res.status(200).json(enrichedSheets);
  } catch (error) {
    console.error('Get sheets error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve resource sheets.' });
  }
};

// Get sheet details (private requires owner auth, public is open read-only)
export const getSheet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid collection identifier format.' });
    }

    const sheet = await ResourceSheet.findById(id);

    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Resource sheet not found.' });
    }

    // Auth check
    const isOwner = req.user && req.user.id === sheet.user.toString();
    if (!sheet.isPublic && !isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied. This collection is private.' });
    }

    // Retrieve resources inside sheet
    const resources = await Resource.find({ resourceSheet: id }).sort({ createdAt: -1 });

    res.status(200).json({
      ...formatSheetResponse(sheet),
      resources: resources.map(formatResourceResponse),
      isOwner,
    });
  } catch (error) {
    console.error('Get sheet error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve collection details.' });
  }
};

// Update sheet details (owner only)
export const updateSheet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid collection identifier format.' });
    }

    const { name, description, isPublic, subject, chapter } = req.body;

    const sheet = await ResourceSheet.findById(id);
    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Resource sheet not found.' });
    }

    if (sheet.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this collection.' });
    }

    if (name !== undefined) sheet.name = name;
    if (description !== undefined) sheet.description = description;
    if (isPublic !== undefined) sheet.isPublic = !!isPublic;
    if (subject !== undefined) sheet.subject = subject;
    if (chapter !== undefined) sheet.chapter = chapter;

    await sheet.save();
    res.status(200).json(formatSheetResponse(sheet));
  } catch (error) {
    handleResourceError(error, res, 'Failed to update resource sheet.');
  }
};

// Delete sheet and all resources inside it (owner only)
export const deleteSheet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid collection identifier format.' });
    }

    const sheet = await ResourceSheet.findById(id);

    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Resource sheet not found.' });
    }

    if (sheet.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this collection.' });
    }

    // Cascade delete resources in sheet
    await Resource.deleteMany({ resourceSheet: id });
    await ResourceSheet.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Collection and its resources deleted successfully.' });
  } catch (error) {
    console.error('Delete sheet error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete collection.' });
  }
};

// Duplicate sheet (owner only)
export const duplicateSheet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid collection identifier format.' });
    }

    const originalSheet = await ResourceSheet.findById(id);
    
    if (!originalSheet) {
      return res.status(404).json({ success: false, message: 'Resource sheet not found.' });
    }

    if (originalSheet.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to duplicate this collection.' });
    }

    // Create copy of sheet
    const duplicatedSheet = new ResourceSheet({
      name: `${originalSheet.name} (Copy)`,
      description: originalSheet.description,
      subject: originalSheet.subject,
      chapter: originalSheet.chapter,
      isPublic: originalSheet.isPublic,
      user: req.user.id,
    });

    await duplicatedSheet.save();

    // Copy resources inside
    const originalResources = await Resource.find({ resourceSheet: id });
    const duplicatedResources = originalResources.map(r => new Resource({
      title: r.title,
      type: r.type,
      url: r.url,
      description: r.description,
      notes: r.notes,
      tags: r.tags,
      difficulty: r.difficulty,
      estimatedTime: r.estimatedTime,
      subject: r.subject,
      chapter: r.chapter,
      isFavorite: r.isFavorite,
      isCompleted: r.isCompleted,
      resourceSheet: duplicatedSheet._id,
      user: req.user.id,
    }));

    if (duplicatedResources.length > 0) {
      await Resource.insertMany(duplicatedResources);
    }

    res.status(201).json(formatSheetResponse(duplicatedSheet));
  } catch (error) {
    console.error('Duplicate sheet error:', error);
    res.status(500).json({ success: false, message: 'Failed to duplicate resource sheet.' });
  }
};

const normalizeResourceType = (type) => {
  if (!type) return 'Other';
  const t = String(type).trim();
  if (['Blog', 'Article', 'Article/Blog', 'Blog Post'].includes(t)) return 'Blog Article';
  if (['Video', 'YouTube', 'YouTube Video', 'Video Lecture'].includes(t)) return 'YouTube Video';
  if (['GitHub', 'Repo', 'GitHub Repository'].includes(t)) return 'GitHub Repository';
  if (['PDF', 'Textbook/PDF', 'PDF Sheet', 'PDF Sheet / Exam Set'].includes(t)) return 'PDF';
  if (['Course', 'Course / Tutorial', 'Tutorial'].includes(t)) return 'Course';
  return t;
};

// ─── Resources Management ───────────────────────────────────────────────────────

// Add resource to sheet (owner only)
export const addResource = async (req, res) => {
  try {
    const { id: sheetId } = req.params;

    if (!validateObjectId(sheetId)) {
      return res.status(400).json({ success: false, message: 'Invalid collection identifier format.' });
    }

    const { title, type, url, description, notes, tags, difficulty, estimatedTime, subject, chapter } = req.body;

    const sheet = await ResourceSheet.findById(sheetId);
    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Resource sheet not found.' });
    }

    if (sheet.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to add resources to this collection.' });
    }

    if (!title || !type || !url || !description) {
      return res.status(400).json({ success: false, message: 'Title, Type, URL, and Description are required fields.' });
    }

    // URL validation
    const cleanUrl = url.trim();
    if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(cleanUrl)) {
      return res.status(400).json({ success: false, message: 'Invalid HTTP/HTTPS URL format.' });
    }

    const resource = new Resource({
      title,
      type: normalizeResourceType(type),
      url: cleanUrl,
      description,
      notes: notes || '',
      tags: Array.isArray(tags) ? tags : [],
      difficulty: difficulty || 'Beginner',
      estimatedTime: estimatedTime || '',
      subject: subject || '',
      chapter: chapter || '',
      isFavorite: false,
      isCompleted: false,
      resourceSheet: sheetId,
      user: req.user.id,
    });

    await resource.save();
    res.status(201).json(formatResourceResponse(resource));
  } catch (error) {
    handleResourceError(error, res, 'Failed to add resource.');
  }
};

// Update resource (owner only)
export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid resource identifier format.' });
    }

    const { title, type, url, description, notes, tags, difficulty, estimatedTime, subject, chapter, isFavorite, isCompleted } = req.body;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    if (resource.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this resource.' });
    }

    if (url) {
      const cleanUrl = url.trim();
      if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(cleanUrl)) {
        return res.status(400).json({ success: false, message: 'Invalid HTTP/HTTPS URL format.' });
      }
      resource.url = cleanUrl;
    }

    if (title !== undefined) resource.title = title;
    if (type !== undefined) resource.type = normalizeResourceType(type);
    if (description !== undefined) resource.description = description;
    if (notes !== undefined) resource.notes = notes;
    if (tags !== undefined) resource.tags = Array.isArray(tags) ? tags : [];
    if (difficulty !== undefined) resource.difficulty = difficulty;
    if (estimatedTime !== undefined) resource.estimatedTime = estimatedTime;
    if (subject !== undefined) resource.subject = subject;
    if (chapter !== undefined) resource.chapter = chapter;
    if (isFavorite !== undefined) resource.isFavorite = !!isFavorite;
    if (isCompleted !== undefined) resource.isCompleted = !!isCompleted;

    await resource.save();
    res.status(200).json(formatResourceResponse(resource));
  } catch (error) {
    handleResourceError(error, res, 'Failed to update resource.');
  }
};

// Delete resource (owner only)
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid resource identifier format.' });
    }

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    if (resource.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this resource.' });
    }

    await Resource.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Resource removed successfully.' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete resource.' });
  }
};

// ─── Export & Sharing ──────────────────────────────────────────────────────────

// Stream QR Code for the public collection link
export const getSheetQrCode = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid identifier format.' });
    }
    
    // Support either sheet ID or specific resource share ID (falls back to URL query parameter)
    const isResource = req.query.type === 'resource';
    
    let shareUrl;
    const frontendUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:8080';

    if (isResource) {
      const resource = await Resource.findById(id);
      if (!resource) {
        return res.status(404).json({ success: false, message: 'Resource not found.' });
      }
      shareUrl = resource.url;
    } else {
      const sheet = await ResourceSheet.findById(id);
      if (!sheet) {
        return res.status(404).json({ success: false, message: 'Resource sheet not found.' });
      }
      if (!sheet.isPublic && (!req.user || req.user.id !== sheet.user.toString())) {
        return res.status(403).json({ success: false, message: 'Access denied. This sheet is private.' });
      }
      shareUrl = `${frontendUrl}/?share_sheet=${sheet._id}`;
    }

    const qrBuffer = await QRCode.toBuffer(shareUrl, {
      type: 'png',
      margin: 1,
      width: 300,
    });

    res.setHeader('Content-Type', 'image/png');
    res.send(qrBuffer);
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate QR code.' });
  }
};

// Export Resource Sheet to PDF
export const exportSheetPdf = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid collection identifier format.' });
    }

    const sheet = await ResourceSheet.findById(id);

    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Resource sheet not found.' });
    }

    // Auth check
    if (!sheet.isPublic && (!req.user || req.user.id !== sheet.user.toString())) {
      return res.status(403).json({ success: false, message: 'Access denied. This sheet is private.' });
    }

    const resources = await Resource.find({ resourceSheet: id }).sort({ createdAt: -1 });

    // Enable page buffering for page numbers footer
    const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });

    res.setHeader('Content-Type', 'application/pdf');
    const safeName = sheet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}_study_sheet.pdf"`);

    doc.pipe(res);

    // Title Section
    doc.fillColor('#6366f1').fontSize(24).font('Helvetica-Bold').text(sheet.name, { align: 'left' });
    doc.moveDown(0.2);

    // Description Section
    if (sheet.description) {
      doc.fillColor('#475569').fontSize(11).font('Helvetica-Oblique').text(sheet.description);
      doc.moveDown(0.5);
    }

    // Context metadata: Subject and Chapter
    const createdDate = new Date(sheet.createdAt).toLocaleDateString();
    let metadataStr = `Created: ${createdDate}`;
    if (sheet.subject) metadataStr += ` | Subject: ${sheet.subject}`;
    if (sheet.chapter) metadataStr += ` | Chapter: ${sheet.chapter}`;
    metadataStr += ` | Total Resources: ${resources.length}`;

    doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text(metadataStr);
    doc.moveDown(1.5);

    // Embed QR Code linking to shared collection
    const frontendUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:8080';
    const shareUrl = `${frontendUrl}/?share_sheet=${sheet._id}`;

    let qrBuffer;
    try {
      qrBuffer = await QRCode.toBuffer(shareUrl, {
        margin: 1,
        width: 100,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.error('Error generating QR buffer for PDF:', err);
    }

    if (qrBuffer) {
      const pageWidth = doc.page.width;
      doc.image(qrBuffer, pageWidth - 140, 40, { width: 90 });
      doc.fontSize(7).fillColor('#64748b').text('Scan to View Online', pageWidth - 140, 135, { width: 90, align: 'center' });
    }

    // Separator line
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(40, 150).lineTo(doc.page.width - 40, 150).stroke();
    doc.moveDown(2);

    // Table Header setup
    let currentY = 170;
    const colWidths = {
      type: 80,
      title: 110,
      description: 180,
      link: 145
    };

    const colPositions = {
      type: 40,
      title: 40 + colWidths.type,
      description: 40 + colWidths.type + colWidths.title,
      link: 40 + colWidths.type + colWidths.title + colWidths.description
    };

    // Draw header background
    doc.rect(40, currentY - 5, doc.page.width - 80, 20).fill('#e2e8f0');
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9);
    doc.text('Type', colPositions.type + 5, currentY);
    doc.text('Title', colPositions.title + 5, currentY);
    doc.text('Description', colPositions.description + 5, currentY);
    doc.text('Link', colPositions.link + 5, currentY);

    currentY += 20;

    // Table Rows
    doc.font('Helvetica').fontSize(8);

    for (const r of resources) {
      // Check page overflow
      if (currentY > doc.page.height - 80) {
        doc.addPage();
        currentY = 40;

        // Redraw headers on new page
        doc.rect(40, currentY - 5, doc.page.width - 80, 20).fill('#e2e8f0');
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9);
        doc.text('Type', colPositions.type + 5, currentY);
        doc.text('Title', colPositions.title + 5, currentY);
        doc.text('Description', colPositions.description + 5, currentY);
        doc.text('Link', colPositions.link + 5, currentY);

        currentY += 20;
        doc.font('Helvetica').fontSize(8);
      }

      // Draw Row Border
      doc.strokeColor('#f1f5f9').lineWidth(0.5).moveTo(40, currentY - 2).lineTo(doc.page.width - 40, currentY - 2).stroke();

      const typeText = r.type;
      const titleText = r.title;
      // Append Subject/Chapter inside table cell if present
      let descText = r.description;
      if (r.subject || r.chapter) {
        descText += `\n[${[r.subject, r.chapter].filter(Boolean).join(' - ')}]`;
      }
      const linkText = 'Open Resource';

      // Measure row height
      const typeHeight = doc.heightOfString(typeText, { width: colWidths.type - 10 });
      const titleHeight = doc.heightOfString(titleText, { width: colWidths.title - 10 });
      const descHeight = doc.heightOfString(descText, { width: colWidths.description - 10 });
      const rowHeight = Math.max(typeHeight, titleHeight, descHeight, 20);

      // Render cells
      doc.fillColor('#475569');
      doc.text(typeText, colPositions.type + 5, currentY, { width: colWidths.type - 10 });
      
      doc.fillColor('#0f172a').font('Helvetica-Bold');
      doc.text(titleText, colPositions.title + 5, currentY, { width: colWidths.title - 10 });
      
      doc.font('Helvetica').fillColor('#334155');
      doc.text(descText, colPositions.description + 5, currentY, { width: colWidths.description - 10 });

      // Clickable URL Text
      doc.fillColor('#6366f1').underline(colPositions.link + 5, currentY, doc.widthOfString(linkText), 8);
      doc.text(linkText, colPositions.link + 5, currentY, {
        width: colWidths.link - 10,
        link: r.url
      });

      currentY += rowHeight + 8;
    }

    // Final table bottom line
    doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(40, currentY - 2).lineTo(doc.page.width - 40, currentY - 2).stroke();

    // Render footer page numbers
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fillColor('#94a3b8').fontSize(8).text(`Page ${i + 1} of ${range.count}`, 40, doc.page.height - 30, { align: 'center' });
    }

    doc.end();
  } catch (error) {
    console.error('PDF export error:', error);
    // If headers are already sent (streaming in progress), we cannot send JSON error
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to generate study sheet PDF.' });
    }
  }
};

// Export Resource Sheet to HTML
export const exportSheetHtml = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid collection identifier format.' });
    }

    const sheet = await ResourceSheet.findById(id);

    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Resource sheet not found.' });
    }

    if (!sheet.isPublic && (!req.user || req.user.id !== sheet.user.toString())) {
      return res.status(403).json({ success: false, message: 'Access denied. This sheet is private.' });
    }

    const resources = await Resource.find({ resourceSheet: id }).sort({ createdAt: -1 });

    const frontendUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:8080';
    const shareUrl = `${frontendUrl}/?share_sheet=${sheet._id}`;
    const qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`;

    const rowsHtml = resources.map(r => `
      <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition">
        <td class="px-4 py-3 font-semibold text-slate-300 text-xs">${escapeHtml(r.type)}</td>
        <td class="px-4 py-3 text-white text-xs font-bold">${escapeHtml(r.title)}</td>
        <td class="px-4 py-3 text-slate-400 text-xs">${escapeHtml(r.description)}</td>
        <td class="px-4 py-3 text-slate-400 text-xs">${escapeHtml(r.subject) || '-'}</td>
        <td class="px-4 py-3 text-slate-400 text-xs">${escapeHtml(r.chapter) || '-'}</td>
        <td class="px-4 py-3 text-slate-400 text-xs">${escapeHtml(r.difficulty)}</td>
        <td class="px-4 py-3 text-right">
          <a href="${escapeHtml(r.url)}" target="_blank" class="text-indigo-400 hover:underline font-bold text-xs">Open Source &rarr;</a>
        </td>
      </tr>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MockVerse Study Sheet: ${escapeHtml(sheet.name)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #0b0f19; color: #f1f5f9; }
    .glass-card { background: rgba(13, 19, 35, 0.85); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.06); }
  </style>
</head>
<body class="min-h-screen p-6 md:p-12 relative overflow-x-hidden">
  <div class="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
  <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[120px] pointer-events-none"></div>

  <div class="max-w-5xl mx-auto space-y-8 relative z-10">
    <!-- Header Section -->
    <div class="glass-card p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div class="space-y-3">
        <div class="flex items-center space-x-3">
          <div class="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase rounded-full">
            Study Collection Sheet
          </div>
        </div>
        <h1 class="text-3xl font-extrabold text-white tracking-tight font-['Sora']">${escapeHtml(sheet.name)}</h1>
        ${sheet.description ? `<p class="text-slate-400 text-sm max-w-2xl">${escapeHtml(sheet.description)}</p>` : ''}
        
        <div class="flex flex-wrap gap-4 pt-2 text-xs text-slate-400">
          ${sheet.subject ? `<span><strong>Subject:</strong> ${escapeHtml(sheet.subject)}</span>` : ''}
          ${sheet.chapter ? `<span><strong>Chapter:</strong> ${escapeHtml(sheet.chapter)}</span>` : ''}
          <span><strong>Resources count:</strong> ${resources.length}</span>
          <span><strong>Generated:</strong> ${new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <!-- QR code linking to collection -->
      <div class="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl shrink-0">
        <img src="${qrCodeSrc}" alt="QR Link" class="w-28 h-28" />
        <span class="text-[8px] text-slate-500 font-bold uppercase">Scan Online</span>
      </div>
    </div>

    <!-- Table Section -->
    <div class="glass-card rounded-3xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-white/5 border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th class="px-4 py-4">Type</th>
              <th class="px-4 py-4">Title</th>
              <th class="px-4 py-4">Description</th>
              <th class="px-4 py-4">Subject</th>
              <th class="px-4 py-4">Chapter</th>
              <th class="px-4 py-4">Difficulty</th>
              <th class="px-4 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="7" class="text-center py-8 text-slate-500 text-xs">No resources found in this collection.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="text-center text-xs text-slate-500 pt-6">
      Created via <a href="${frontendUrl}" class="text-indigo-400 hover:underline font-semibold">MockVerse AI</a> study manager.
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${sheet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_study_sheet.html"`);
    res.send(htmlContent);
  } catch (error) {
    console.error('HTML export error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate study sheet HTML.' });
  }
};
