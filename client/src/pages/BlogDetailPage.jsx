import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'framer-motion'
import { FiCalendar, FiClock, FiArrowLeft, FiShare2, FiHeart, FiBookmark, FiMessageCircle, FiFacebook, FiTwitter, FiInstagram, FiArrowRight } from 'react-icons/fi';
import api from '../utils/api'
import LoadingScreen from '../components/common/LoadingScreen'
import { optimizeImage } from '../utils/helpers'

const BlogDetailPage = () => {
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true)
        const { data } = await api.get(`/features/blogs/${slug}`)
        setBlog(data.data.blog)
        setRelated(data.data.related || [])
        if (data.data.blog?.title) {
          document.title = `${data.data.blog.title} | ShaadiSaathi Journal`
        }
      } catch (error) {
        console.error('Error fetching blog:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBlog()
    window.scrollTo(0, 0)
  }, [slug])

  if (loading) return <LoadingScreen />
  if (!blog) return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-[#FFF8F0]/30">
      <div className="text-6xl mb-6">📝</div>
      <h2 className="font-display text-4xl font-black text-gray-900 mb-4">Article Not Found</h2>
      <p className="text-gray-500 mb-8 font-medium">The article you're looking for doesn't exist or has been moved.</p>
      <Link to="/blog" className="btn-primary flex items-center gap-2">
        <FiArrowLeft /> Back to Journal
      </Link>
    </div>
  )

  const readingTime = blog?.content ? Math.ceil(blog.content.split(' ').length / 200) : 5

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 relative selection:bg-[#C2185B]/20 selection:text-[#C2185B]">
      {/* ── Reading Progress Bar ── */}
      <motion.div 
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C2185B] to-[#D4AF37] z-[60] origin-left"
      />

      {/* ── 🌟 Premium Hero Section ── */}
      <div className="relative h-[50vh] md:h-[75vh] min-h-[400px] md:min-h-[600px] w-full mt-4 md:mt-8 mx-auto max-w-[96%] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl">
        <motion.img 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 3, ease: "easeOut" }}
          src={optimizeImage(blog?.coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80', 1920)} 
          alt={blog?.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/50 to-transparent opacity-90" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link to="/blog" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:-translate-x-1 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <FiArrowLeft /> Back to Journal
              </Link>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  {blog?.category || 'Inspiration'}
                </span>
                <div className="flex items-center gap-6 text-white/80 text-[10px] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-2"><FiCalendar className="text-[#D4AF37] text-sm" /> {blog?.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
                  <span className="flex items-center gap-2"><FiClock className="text-pink-400 text-sm" /> {readingTime} min read</span>
                </div>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-10 tracking-tighter drop-shadow-2xl">
                {blog?.title}
              </h1>

              {/* Author Strip */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-2 pr-6 rounded-full inline-flex">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-[#D4AF37] overflow-hidden shadow-lg">
                  {blog?.author?.avatar ? (
                    <img src={blog.author.avatar} alt={blog.author.name} className="w-full h-full object-cover" />
                  ) : (
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80" alt="Author" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-0.5">Written By</p>
                  <p className="text-white font-bold text-sm tracking-wide">{blog?.author?.name || 'ShaadiSaathi Expert'}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── 📰 Article Layout ── */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-12 gap-16">
          
          {/* Main Article Content */}
          <div className="lg:col-span-8 lg:col-start-2 bg-white rounded-[3rem] p-6 md:p-16 shadow-premium border border-pink-50 relative">
            
            {/* Social Share Floating (Desktop) */}
            <div className="hidden xl:flex flex-col gap-4 absolute -left-20 top-32 sticky-sidebar">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 rotate-180" style={{ writingMode: 'vertical-rl' }}>Share</p>
              <button className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:-translate-y-1 transition-all"><FiFacebook size={18} /></button>
              <button className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:text-blue-400 hover:-translate-y-1 transition-all"><FiTwitter size={18} /></button>
              <button className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:text-pink-600 hover:-translate-y-1 transition-all"><FiInstagram size={18} /></button>
            </div>

            {blog?.excerpt && (
              <p className="text-xl md:text-2xl text-gray-600 font-medium italic mb-12 leading-[1.8] border-l-4 border-[#C2185B] pl-8 py-2 bg-pink-50/30 rounded-r-2xl">
                {blog.excerpt}
              </p>
            )}

            {/* Prose Content */}
            <div className="prose prose-lg md:prose-xl prose-headings:font-display prose-headings:font-black prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-[2] prose-a:text-[#C2185B] hover:prose-a:text-[#8E244D] prose-img:rounded-3xl prose-img:shadow-xl prose-img:w-full prose-blockquote:border-l-[#D4AF37] prose-blockquote:bg-gold-50/30 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:font-medium prose-blockquote:text-gray-700 max-w-none">
              <div 
                dangerouslySetInnerHTML={{ __html: blog?.content || '<p>Start reading the ultimate wedding guide...</p>' }}
              />
            </div>

            {/* Tags */}
            <div className="mt-16 pt-10 border-t border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Tags & Topics</p>
              <div className="flex flex-wrap gap-3">
                {Array.isArray(blog?.tags) && blog.tags.map(tag => (
                  <span key={tag} className="bg-gray-50 text-gray-600 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border border-gray-200 hover:bg-pink-50 hover:border-pink-200 hover:text-[#C2185B] transition-all cursor-pointer">
                    #{tag}
                  </span>
                ))}
                {(!blog?.tags || blog.tags.length === 0) && (
                  <span className="bg-gray-50 text-gray-600 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border border-gray-200">#WeddingPlanning</span>
                )}
              </div>
            </div>

            {/* Engagement Bar */}
            <div className="mt-10 p-6 bg-gradient-to-r from-gray-50 to-white rounded-3xl border border-gray-100 flex flex-wrap items-center justify-between gap-6 shadow-inner">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${isLiked ? 'bg-pink-50 text-[#C2185B] border border-pink-200 shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:shadow-sm'}`}
                >
                  <FiHeart className={isLiked ? 'fill-current' : ''} size={16} /> {isLiked ? 'Liked' : 'Like'}
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 font-black text-xs uppercase tracking-widest text-gray-500 bg-white hover:bg-gray-50 hover:shadow-sm transition-all">
                  <FiMessageCircle size={16} /> Comment
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSaved(!isSaved)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isSaved ? 'bg-gold-50 text-[#D4AF37] border-gold-200 border' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:shadow-sm'}`}
                >
                  <FiBookmark className={isSaved ? 'fill-current' : ''} size={18} />
                </button>
                <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:shadow-sm transition-all xl:hidden">
                  <FiShare2 size={18} />
                </button>
              </div>
            </div>

            {/* Author Profile Card */}
            <div className="mt-16 bg-[#FFF8F0] rounded-[2.5rem] p-8 md:p-10 border border-gold-100 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm">
              <img 
                src={blog?.author?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80'} 
                alt={blog?.author?.name} 
                className="w-28 h-28 rounded-full object-cover shadow-lg border-4 border-white"
              />
              <div className="text-center md:text-left flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-2">About The Author</p>
                <h4 className="font-display text-2xl font-black text-gray-900 mb-3">{blog?.author?.name || 'ShaadiSaathi Editorial Team'}</h4>
                <p className="text-gray-600 font-medium leading-relaxed mb-6">
                  {blog?.author?.bio || 'Expert wedding planners and writers dedicated to bringing you the most inspiring, practical, and beautiful wedding content from across India.'}
                </p>
                <button className="bg-white border border-gray-200 text-gray-900 font-black text-[10px] uppercase tracking-widest py-3 px-8 rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all shadow-sm">
                  View All Articles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 📚 Related Inspiration ── */}
      {(related.length > 0 || !blog) && (
        <section className="bg-gray-900 py-24 px-4 relative overflow-hidden mt-10 rounded-t-[4rem]">
          <div className="absolute top-0 right-0 w-72 h-72 md:w-[500px] md:h-[500px] bg-[#C2185B]/10 rounded-full blur-[150px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
              <div>
                <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] mb-4">Keep Reading</p>
                <h2 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight">More Inspiration</h2>
              </div>
              <Link to="/blog" className="text-white font-bold hover:text-[#D4AF37] transition-colors flex items-center gap-2 text-sm">
                View All Articles <FiArrowRight />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(related.length > 0 ? related : [
                { _id: '1', title: 'Top 10 Wedding Venues in Jaipur', coverImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', category: 'Venues', createdAt: new Date() },
                { _id: '2', title: 'How to Plan Your Wedding Budget', coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80', category: 'Planning', createdAt: new Date() },
                { _id: '3', title: 'Trending Bridal Lehenga Colors', coverImage: 'https://images.unsplash.com/photo-1596455607563-ad6193f76b17?w=800&q=80', category: 'Fashion', createdAt: new Date() }
              ]).map((post, idx) => (
                <Link 
                  key={post?._id || idx} 
                  to={`/blog/${post?.slug || 'sample'}`}
                  className="bg-gray-800/50 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-700/50 group hover:-translate-y-2 flex flex-col"
                >
                  <div className="h-60 overflow-hidden relative">
                    <img 
                      src={optimizeImage(post?.coverImage, 800)} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                      alt={post?.title} 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80" />
                    <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                      {post?.category || 'General'}
                    </span>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="font-display text-xl md:text-2xl font-black text-white mb-4 group-hover:text-[#D4AF37] transition-colors leading-snug line-clamp-2">
                      {post?.title}
                    </h3>
                    <div className="mt-auto flex items-center justify-between text-gray-400">
                      <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <FiCalendar /> {post?.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-white transition-colors">
                        <FiArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default BlogDetailPage
