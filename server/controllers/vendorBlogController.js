const { Blog } = require('../models/FeatureModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Get all blogs for a vendor
// @route   GET /api/vendor/blogs
// @access  Private (Vendor)
exports.getVendorBlogs = catchAsync(async (req, res, next) => {
  const blogs = await Blog.find({ author: req.user._id })
    .sort({ createdAt: -1 });

  res.status(200).json({ status: 'success', blogs });
});

// @desc    Create/Update blog (Vendor)
// @route   POST /api/vendor/blogs
// @access  Private (Vendor)
exports.saveVendorBlog = catchAsync(async (req, res, next) => {
  const { id, title, content, excerpt, coverImage, category, tags, isPublished } = req.body;

  if (!title || !content) {
    return next(new AppError('Title and Content are required.', 400));
  }

  let blog;
  if (id) {
    blog = await Blog.findOne({ _id: id, author: req.user._id });
    if (!blog) return next(new AppError('Blog not found or unauthorized', 404));
    
    blog.title = title;
    blog.content = content;
    blog.excerpt = excerpt || blog.excerpt;
    blog.coverImage = coverImage || blog.coverImage;
    blog.category = category || blog.category;
    blog.tags = tags || blog.tags;
    blog.isPublished = isPublished !== undefined ? isPublished : blog.isPublished;
    
    await blog.save();
  } else {
    blog = await Blog.create({
      title,
      content,
      excerpt,
      coverImage,
      category,
      tags,
      isPublished,
      author: req.user._id
    });
  }

  res.status(200).json({ status: 'success', blog });
});

// @desc    Delete blog (Vendor)
// @route   DELETE /api/vendor/blogs/:id
// @access  Private (Vendor)
exports.deleteVendorBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findOneAndDelete({ _id: req.params.id, author: req.user._id });
  if (!blog) return next(new AppError('Blog not found or unauthorized', 404));
  
  res.status(200).json({ status: 'success', message: 'Blog deleted' });
});
