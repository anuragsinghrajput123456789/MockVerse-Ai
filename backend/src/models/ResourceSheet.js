import mongoose from 'mongoose';

const resourceSheetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Collection name is required'],
    trim: true,
    maxlength: [100, 'Collection name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  subject: {
    type: String,
    default: '',
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters'],
  },
  chapter: {
    type: String,
    default: '',
    trim: true,
    maxlength: [100, 'Chapter cannot exceed 100 characters'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for user sheet querying and public sheet lookups
resourceSheetSchema.index({ user: 1, createdAt: -1 });
resourceSheetSchema.index({ _id: 1, isPublic: 1 });

const ResourceSheet = mongoose.model('ResourceSheet', resourceSheetSchema);
export default ResourceSheet;
