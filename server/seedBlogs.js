const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { Blog } = require('./models/FeatureModels');
const User = require('./models/User');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};

const seedBlogs = async () => {
  await connectDB();

  try {
    // Get the admin user or create a dummy author
    let author = await User.findOne({ role: 'admin' });
    if (!author) {
      author = await User.findOne(); // just get any user
    }
    
    const authorId = author ? author._id : new mongoose.Types.ObjectId();

    await Blog.deleteMany({});
    console.log('Cleared existing blogs');

    const blogs = [
      {
        title: 'The Ultimate Guide to Planning a Royal Palace Wedding in Rajasthan',
        content: '<p>Planning a royal wedding is a dream for many. Here is our comprehensive guide to making it happen seamlessly in the majestic palaces of Rajasthan.</p><p>From booking the right venues like Umaid Bhawan Palace or Taj Lake Palace to managing logistics, every detail matters.</p>',
        excerpt: 'Discover everything you need to know about planning your dream royal wedding in Rajasthan with our expert insights and tips.',
        author: authorId,
        coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
        category: 'Trending',
        tags: ['Royal Wedding', 'Rajasthan', 'Planning'],
        views: 4500,
        isPublished: true,
      },
      {
        title: 'Top 10 Sabyasachi Bridal Lehengas of the Season',
        content: '<p>Every bride dreams of wearing a Sabyasachi lehenga on her wedding day. Here are the top 10 designs that are trending this season.</p>',
        excerpt: 'Explore the most beautiful and trending Sabyasachi bridal lehengas for your big day.',
        author: authorId,
        coverImage: 'https://images.unsplash.com/photo-1583939000155-703666d3a8e9?w=800&q=80',
        category: 'Fashion',
        tags: ['Bridal', 'Lehenga', 'Sabyasachi'],
        views: 3200,
        isPublished: true,
      },
      {
        title: 'How to Build a Realistic Wedding Budget (And Actually Stick to It)',
        content: '<p>Budgeting is the most crucial part of wedding planning. Let us break down the costs and show you how to manage your finances effectively.</p>',
        excerpt: 'Master your wedding finances with our complete guide to building and maintaining a realistic budget.',
        author: authorId,
        coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
        category: 'Planning',
        tags: ['Budget', 'Finance', 'Planning'],
        views: 2800,
        isPublished: true,
      },
      {
        title: 'Minimalist Mandap Decor Ideas for the Modern Couple',
        content: '<p>Move over heavy decorations. Minimalist mandaps are the new trend. Discover how less can be more for your wedding ceremony.</p>',
        excerpt: 'Get inspired by these stunning and elegant minimalist mandap designs for modern Indian weddings.',
        author: authorId,
        coverImage: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
        category: 'Decor',
        tags: ['Decor', 'Mandap', 'Minimalist'],
        views: 1950,
        isPublished: true,
      }
    ];

    await Blog.insertMany(blogs);
    console.log('Successfully seeded premium blogs!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding blogs:', error);
    process.exit(1);
  }
};

seedBlogs();
