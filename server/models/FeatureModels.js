const mongoose = require('mongoose');

// ==================== LEAD MODEL ====================
const leadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceType: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  budget: { type: Number, required: true },
  city: { type: String, required: true },
  eventDate: { type: Date, required: true },
  description: String,
  status: {
    type: String,
    enum: ['open', 'closed', 'assigned', 'cancelled'],
    default: 'open'
  },
  quotations: [{
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    amount: Number,
    message: String,
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

leadSchema.index({ user: 1 });
leadSchema.index({ serviceType: 1 });
leadSchema.index({ city: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ eventDate: 1 });
leadSchema.index({ createdAt: -1 });

const Lead = mongoose.model('Lead', leadSchema);

// ==================== GUEST MODEL ====================
const guestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weddingPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'WeddingPlan' }, // Linked to wedding plan
  name: { type: String, required: true },
  email: String,
  phone: String,
  tag: { type: String, enum: ['family', 'friends', 'vip', 'other', 'bride_side', 'groom_side'], default: 'other' },
  guestCount: { type: Number, default: 1 },
  rsvpStatus: { type: String, enum: ['pending', 'attending', 'not_attending', 'maybe'], default: 'pending' },
  mealPreference: { type: String, enum: ['veg', 'non-veg', 'jain', 'other'], default: 'veg' },
  roomAllocated: String,
  invitationSent: { type: Boolean, default: false },
}, { timestamps: true });

guestSchema.index({ user: 1 });
guestSchema.index({ rsvpStatus: 1 });

const Guest = mongoose.model('Guest', guestSchema);

// ==================== CHECKLIST MODEL ====================
const checklistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weddingPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'WeddingPlan' }, // Linked to wedding plan
  tasks: [{
    title: { type: String, required: true },
    category: String,
    deadline: Date,
    isCompleted: { type: Boolean, default: false },
    notes: String,
  }],
}, { timestamps: true });

checklistSchema.index({ user: 1 });

const Checklist = mongoose.model('Checklist', checklistSchema);

// ==================== BLOG MODEL ====================
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  content: { type: String, required: true },
  excerpt: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  coverImage: String,
  image: String,
  category: String,
  tags: [String],
  views: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

blogSchema.index({ author: 1 });
blogSchema.index({ isPublished: 1 });
blogSchema.index({ createdAt: -1 });

blogSchema.pre('save', async function (next) {
  // Synchronize image and coverImage fields to prevent database null checks from failing
  if (this.coverImage && !this.image) {
    this.image = this.coverImage;
  } else if (this.image && !this.coverImage) {
    this.coverImage = this.image;
  }

  if (this.isModified('title')) {
    let slug = this.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    // Check for duplicate slugs
    const Blog = mongoose.model('Blog');
    const slugExists = await Blog.findOne({ slug, _id: { $ne: this._id } });

    if (slugExists) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    this.slug = slug;
  }
  next();
});

const Blog = mongoose.model('Blog', blogSchema);

// ==================== TESTIMONIAL MODEL ====================
const testimonialSchema = new mongoose.Schema({
  brideName: { type: String, required: true },
  groomName: { type: String, required: true },
  city: { type: String, required: true },
  review: { type: String, required: true },
  rating: { type: Number, default: 5 },
  image: { type: String },
  video: { type: String },
  weddingDate: { type: Date },
  servicesBooked: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

testimonialSchema.index({ isFeatured: 1 });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

// ==================== HOME STATS MODEL ====================
const homeStatsSchema = new mongoose.Schema({
  vendors: { type: String, default: '10' },
  bookings: { type: String, default: '10' },
  cities: { type: String, default: '1' },
  rating: { type: String, default: '4' },
}, { timestamps: true });

const HomeStats = mongoose.model('HomeStats', homeStatsSchema);

module.exports = { Lead, Guest, Checklist, Blog, Testimonial, HomeStats };
