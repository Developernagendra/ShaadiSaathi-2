import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiCalendar, FiSearch, FiClock, FiArrowRight, FiHeart } from 'react-icons/fi';
import api from '../utils/api'
import { optimizeImage } from '../utils/helpers'

const SkeletonBlog = () => (
  <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm animate-pulse">
    <div className="h-72 bg-gray-100" />
    <div className="p-8 flex-1 flex flex-col">
      <div className="flex justify-between mb-4">
        <div className="h-3 bg-gray-200 w-1/3 rounded-full" />
        <div className="h-3 bg-gray-200 w-1/4 rounded-full" />
      </div>
      <div className="h-8 bg-gray-200 w-full rounded-xl mb-4" />
      <div className="h-8 bg-gray-200 w-3/4 rounded-xl mb-6" />
      <div className="space-y-2 mt-auto">
        <div className="h-3 bg-gray-100 w-full rounded-full" />
        <div className="h-3 bg-gray-100 w-5/6 rounded-full" />
      </div>
    </div>
  </div>
)

const BlogPage = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All Inspiration')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const categories = ['All Inspiration', 'Planning', 'Fashion', 'Venues', 'Photography', 'Decor', 'Real Weddings']

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true)
        const { data } = await api.get('/features/blogs')
        setBlogs(data.data.blogs || [])
        document.title = 'Wedding Inspiration | ShaadiSaathi'
      } catch (error) {
        console.error('Error fetching blogs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBlogs()
  }, [])

  const filteredBlogs = useMemo(() => {
    if (!Array.isArray(blogs)) return []
    return blogs.filter(blog => {
      if (!blog) return false
      const matchesSearch = (blog.title || '').toLowerCase().includes(search.toLowerCase()) || 
                           (blog.content || '').toLowerCase().includes(search.toLowerCase())
      const matchesCategory = activeCategory === 'All Inspiration' || blog.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [blogs, search, activeCategory])

  const featuredPost = filteredBlogs.length > 0 ? filteredBlogs[0] : null
  const otherPosts = filteredBlogs.length > 1 ? filteredBlogs.slice(1) : []

  const getAuthorName = (author) => {
    if (!author) return 'Editorial'
    if (author.name) return author.name
    if (typeof author === 'string') return author
    return 'Editorial'
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]/30 font-sans pb-24">
      
      {/* ── ✨ HERO HEADER SECTION ── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#8E244D]">
        <div className="absolute inset-0 floral-pattern opacity-[0.03] pointer-events-none" />
        <div className="absolute top-0 right-0 w-72 md:w-[500px] h-[500px] bg-[#C2185B]/30 rounded-full blur-[150px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 w-72 md:w-[600px] h-[600px] bg-[#D4AF37]/20 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/20 mb-8 shadow-xl">
             <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em]">💍 Wedding Inspiration</span>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter drop-shadow-2xl">
            Latest From <br className="md:hidden" />
            <span className="text-[#C2185B] italic bg-clip-text text-transparent bg-gradient-to-r from-[#C2185B] to-[#D4AF37]">Our Blog</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white/80 text-lg md:text-2xl font-medium italic max-w-3xl mx-auto leading-relaxed mb-16">
            Discover breathtaking wedding ideas, the latest bridal trends, expert planning tips, and real love stories to inspire your perfect day.
          </motion.p>
          
          {/* 🔍 SEARCH & FILTER UI */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="max-w-3xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none">
              <FiSearch className="text-[#D4AF37]" size={22} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trending topics (e.g. 'Royal Decor', 'Bridal Lehengas')..."
              className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 text-white placeholder-white/50 rounded-[2.5rem] py-6 pl-20 pr-8 focus:outline-none focus:border-[#D4AF37] focus:bg-white/20 transition-all font-medium text-lg shadow-[0_10px_40px_rgba(0,0,0,0.2)]"
            />
          </motion.div>

          {/* Trending Tags */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 flex flex-wrap justify-center items-center gap-3">
             <span className="text-white/60 text-[10px] font-black uppercase tracking-widest mr-2">Trending:</span>
             {['Pastel Mandaps', 'Destination Weddings', 'Sabyasachi Brides', 'Budget Hacks'].map(tag => (
               <button key={tag} onClick={() => setSearch(tag)} className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-1.5 rounded-full text-white/80 text-[10px] font-bold tracking-wider transition-colors">
                 #{tag}
               </button>
             ))}
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        
        {/* ── ✨ FEATURED BLOG UI ── */}
        {!loading && featuredPost && !search && activeCategory === 'All Inspiration' && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-24"
          >
            <Link to={`/blog/${featuredPost.slug}`} className="block relative group">
              <div className="relative h-[550px] md:h-[700px] rounded-[3.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-4 border-white">
                <img 
                  src={optimizeImage(featuredPost?.coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80', 1200)} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
                  alt={featuredPost.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 lg:p-20 flex flex-col justify-end h-full">
                  <div className="max-w-4xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <span className="bg-[#D4AF37] text-gray-900 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-2">
                        <FiHeart className="fill-gray-900" /> Featured Article
                      </span>
                      <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                        {featuredPost?.category}
                      </span>
                    </div>
                    
                    <h2 className="font-display text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tighter drop-shadow-2xl">
                      {featuredPost?.title}
                    </h2>
                    
                    <p className="text-white/80 text-lg font-medium italic max-w-3xl mb-10 line-clamp-2">
                      {featuredPost?.excerpt || (featuredPost?.content || '').replace(/<[^>]*>?/gm, '').slice(0, 150) + '...'}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-6 md:gap-10 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                      <div className="flex items-center gap-4">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getAuthorName(featuredPost.author))}&background=C2185B&color=fff`} className="w-10 h-10 rounded-full border-2 border-white/30" alt="Author" />
                        <div>
                          <p className="text-[#D4AF37] mb-1">Written By</p>
                          <p className="tracking-widest">{getAuthorName(featuredPost?.author)}</p>
                        </div>
                      </div>
                      <div className="h-10 w-px bg-white/20 hidden md:block" />
                      <div>
                        <p className="text-[#D4AF37] mb-1">Published</p>
                        <p className="flex items-center gap-2 tracking-widest"><FiCalendar size={14}/> {featuredPost?.createdAt ? new Date(featuredPost.createdAt).toLocaleDateString() : 'Recent'}</p>
                      </div>
                      <div className="h-10 w-px bg-white/20 hidden md:block" />
                      <div>
                        <p className="text-[#D4AF37] mb-1">Reading Time</p>
                        <p className="flex items-center gap-2 tracking-widest"><FiClock size={14}/> {featuredPost?.content ? Math.ceil(featuredPost.content.split(' ').length / 200) : 5} Min Read</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* ── Category Filters ── */}
        <div className="flex justify-center mb-16 px-4">
          <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide no-scrollbar w-full md:w-auto">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => { setActiveCategory(cat); setPage(1); }}
                className={`whitespace-nowrap px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  activeCategory === cat 
                    ? 'bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white shadow-[0_10px_20px_rgba(194,24,91,0.3)] scale-105' 
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-[#C2185B]/40 hover:text-[#C2185B] hover:bg-[#FFF8F0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── 📰 BLOG CARD UI (GRID) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            Array(6).fill(0).map((_, i) => <SkeletonBlog key={i} />)
          ) : (
            <AnimatePresence mode='popLayout'>
              {filteredBlogs.length > 0 ? (
                (search || activeCategory !== 'All Inspiration' ? filteredBlogs : otherPosts).map((post, idx) => (
                  <motion.div
                    key={post._id || idx}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                  >
                    <Link to={`/blog/${post?.slug}`} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(194,24,91,0.12)] border border-pink-50 flex flex-col h-full hover:-translate-y-2 transition-all duration-500 relative">
                      
                      {/* Image Container */}
                      <div className="h-72 overflow-hidden relative bg-gray-100">
                        <img 
                          src={optimizeImage(post?.coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', 600)} 
                          className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out" 
                          alt={post?.title} 
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Category Badge */}
                        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md text-[#C2185B] px-5 py-2 rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.2em] shadow-lg border border-white/50">
                          {post?.category || 'Inspiration'}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-8 flex-1 flex flex-col bg-white">
                        <div className="flex items-center justify-between mb-5">
                          <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                            <FiCalendar className="text-[#D4AF37]"/> {post?.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent'}
                          </p>
                          <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                            <FiClock className="text-[#C2185B]"/> {post?.content ? Math.ceil(post.content.split(' ').length / 200) : 4} min read
                          </p>
                        </div>
                        
                        <h3 className="font-display text-2xl font-black text-gray-900 mb-4 group-hover:text-[#C2185B] transition-colors leading-snug">
                          {post?.title}
                        </h3>
                        
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium flex-1 line-clamp-3">
                          {post?.excerpt || (post?.content || '').replace(/<[^>]*>?/gm, '').slice(0, 150) + '...'}
                        </p>
                        
                        <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-auto">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-[#C2185B] text-xs font-black">
                              {getAuthorName(post?.author).slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-gray-900 text-[10px] font-black uppercase tracking-widest">{getAuthorName(post?.author)}</span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-[#C2185B] text-gray-400 group-hover:text-white flex items-center justify-center transition-colors">
                             <FiArrowRight />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-200 shadow-sm max-w-3xl mx-auto">
                  <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiSearch className="text-3xl text-[#C2185B]" />
                  </div>
                  <h3 className="font-display text-3xl font-black text-gray-900 mb-4 tracking-tight">No Inspiration Found</h3>
                  <p className="text-gray-500 font-medium text-lg italic max-w-md mx-auto">We couldn't find any articles matching your search or filters.</p>
                  <button 
                    onClick={() => { setSearch(''); setActiveCategory('All Inspiration'); }}
                    className="mt-8 bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    Clear Search & Filters
                  </button>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* ── 💬 ENGAGEMENT ELEMENTS (Load More) ── */}
        {!loading && filteredBlogs.length > 6 && hasMore && (
          <div className="mt-24 text-center">
            <button className="bg-white border-2 border-pink-100 text-[#C2185B] font-black text-[10px] uppercase tracking-[0.3em] px-12 py-5 rounded-full hover:border-[#C2185B] hover:bg-[#FFF8F0] transition-all shadow-md hover:shadow-xl active:scale-95 group flex items-center gap-3 mx-auto">
              Explore More Inspiration <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default BlogPage
