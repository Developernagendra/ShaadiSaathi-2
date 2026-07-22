import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiMoreVertical, FiPaperclip, FiSend, FiImage, FiClock, FiMessageSquare } from 'react-icons/fi';
import { formatTime } from '../../utils/helpers'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function VendorMessagesPage() {
  const [contacts, setContacts] = useState([])
  const [activeContact, setActiveContact] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact._id)
    }
  }, [activeContact])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchChats = async () => {
    try {
      const res = await api.get('/chat')
      setContacts(res.data.chats || [])
      setLoading(false)
    } catch (err) {
      toast.error('Failed to load chats')
      setLoading(false)
    }
  }

  const fetchMessages = async (chatId) => {
    setLoadingMessages(true)
    try {
      const res = await api.get(`/chat/${chatId}/messages`)
      setMessages(res.data.messages || [])
    } catch (err) {
      toast.error('Failed to load messages')
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!messageText.trim() || !activeContact) return
    
    const text = messageText
    setMessageText('')
    
    try {
      const res = await api.post(`/chat/${activeContact._id}/messages`, { content: text })
      setMessages(prev => [...prev, res.data.message])
      
      // Update latest message in contacts list
      setContacts(prev => prev.map(c => 
        c._id === activeContact._id 
          ? { ...c, lastMessage: { content: text, sentAt: new Date() } }
          : c
      ))
    } catch (err) {
      toast.error('Failed to send message')
      setMessageText(text) // Revert on failure
    }
  }

  const getOtherParticipant = (chat) => {
    // Return the participant who is not the vendor
    return chat.participants.find(p => p.role !== 'vendor' && p.role !== 'admin') || chat.participants[0]
  }

  const getUnreadCount = (chat) => {
    return chat.messages ? chat.messages.filter(m => !m.isRead && m.sender?._id !== activeContact?.vendor).length : 0
  }

  return (
    <div className="pb-24 animate-fade-in relative max-w-7xl mx-auto px-4 md:px-8 pt-8 h-[calc(100vh-80px)] flex flex-col">
      <div className="absolute inset-0 floral-pattern opacity-[0.02] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative z-10 flex-shrink-0">
        <div>
          <div className="divider-luxe !justify-start mb-3 !gap-3">
            <div className="divider-line !bg-[#D4AF37]/30 !w-8" />
            <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] italic">Communication</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Messages Center</h1>
        </div>
      </div>

      <div className="flex-1 bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 border border-white flex overflow-hidden relative z-10 h-full">

        {/* Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-r border-white/50 flex flex-col bg-white/50 backdrop-blur-md">
          <div className="p-6 border-b border-gray-100/50">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-[#D4AF37]">
                <FiSearch size={18} />
              </span>
              <input type="text" placeholder="Search conversations..." className="w-full pl-14 pr-5 py-4 bg-white/80 backdrop-blur-md border border-white rounded-2xl text-xs font-bold outline-none focus:border-[#C2185B] focus:shadow-[0_0_15px_rgba(194,24,91,0.05)] transition-all shadow-sm" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex justify-center p-8"><div className="w-8 h-8 border-2 border-pink-100 border-t-[#c41e6b] rounded-full animate-spin" /></div>
            ) : contacts.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs font-medium uppercase tracking-widest">No conversations yet</div>
            ) : (
              contacts.map((c) => {
                const other = getOtherParticipant(c)
                const unread = getUnreadCount(c)
                const isOnline = false // we can integrate socketio later
                
                return (
                  <div
                    key={c._id}
                    onClick={() => setActiveContact(c)}
                    className={`p-5 border-b border-gray-100/30 cursor-pointer transition-all flex items-center gap-4 relative group ${activeContact?._id === c._id ? 'bg-white/90 shadow-sm z-10' : 'hover:bg-white/60'}`}
                  >
                    {activeContact?._id === c._id && <div className="absolute left-0 inset-y-0 w-1.5 bg-gradient-to-b from-[#C2185B] to-[#8E244D]" />}
                    
                    <div className="relative">
                      {other?.avatar ? (
                        <img src={other.avatar} alt="avatar" className={`w-14 h-14 rounded-[1.2rem] object-cover shadow-sm transition-transform duration-300 ${activeContact?._id === c._id ? 'scale-105 border-2 border-[#C2185B]' : 'group-hover:scale-105'}`} />
                      ) : (
                        <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center font-display font-black text-xl shadow-sm transition-transform duration-300 ${activeContact?._id === c._id ? 'bg-gradient-to-br from-[#C2185B] to-[#8E244D] text-white scale-105' : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 group-hover:scale-105'}`}>
                          {other?.name ? other.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      {isOnline && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />}
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className={`font-bold text-sm truncate transition-colors ${activeContact?._id === c._id ? 'text-[#C2185B]' : 'text-gray-900'}`}>{other?.name || 'User'}</h4>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{c.lastMessage?.sentAt ? new Date(c.lastMessage.sentAt).toLocaleDateString() : 'New'}</span>
                      </div>
                      <p className={`text-[11px] truncate ${unread > 0 ? 'font-black text-gray-800' : 'font-medium text-gray-500'}`}>{c.lastMessage?.content || 'Start a conversation'}</p>
                    </div>
                    
                    {unread > 0 && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black flex items-center justify-center text-[10px] font-black shadow-md flex-shrink-0">
                        {unread}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        {activeContact ? (
          <div className="flex-1 flex flex-col bg-transparent relative">
            <div className="absolute inset-0 bg-[#FDFBF7]/40 pointer-events-none" />

            {/* Chat Header */}
            <div className="p-6 lg:px-10 border-b border-white/50 flex items-center justify-between bg-white/60 backdrop-blur-md shadow-sm z-10">
              <div className="flex items-center gap-5">
                {getOtherParticipant(activeContact)?.avatar ? (
                  <img src={getOtherParticipant(activeContact).avatar} alt="avatar" className="w-14 h-14 rounded-[1.2rem] object-cover shadow-[0_5px_15px_rgba(194,24,91,0.2)]" />
                ) : (
                  <div className="w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-[#C2185B] to-[#8E244D] text-white flex items-center justify-center font-display font-black text-xl shadow-[0_5px_15px_rgba(194,24,91,0.2)]">
                    {getOtherParticipant(activeContact)?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <h3 className="font-display text-2xl font-black text-gray-900 tracking-tight leading-none mb-1.5">{getOtherParticipant(activeContact)?.name || 'User'}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" /> Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="w-12 h-12 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-[#C2185B] hover:border-[#C2185B]/30 flex items-center justify-center transition-all shadow-sm">
                  <FiMoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-10 z-10 space-y-6 custom-scrollbar">
              {loadingMessages ? (
                <div className="flex justify-center p-8"><div className="w-8 h-8 border-2 border-pink-100 border-t-[#c41e6b] rounded-full animate-spin" /></div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-10 font-medium italic">Say hi to {getOtherParticipant(activeContact)?.name}!</div>
              ) : (
                messages.map((msg) => {
                  const isMe = typeof msg.sender === 'object' ? msg.sender.role === 'vendor' || msg.sender.role === 'admin' : false
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      key={msg._id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[75%] rounded-[2rem] p-5 text-[13px] font-medium leading-relaxed shadow-sm ${isMe ? 'bg-gradient-to-br from-[#C2185B] to-[#8E244D] text-white rounded-tr-sm shadow-[0_10px_20px_rgba(194,24,91,0.15)]' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm hover:shadow-md transition-shadow'}`}>
                        {msg.content}
                      </div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2 px-2 flex items-center gap-1.5">
                        <FiClock size={10} /> {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </motion.div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-6 lg:px-10 border-t border-white/50 bg-white/60 backdrop-blur-md z-10">
              <form onSubmit={handleSend} className="flex items-center gap-4">
                <button type="button" className="w-14 h-14 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-[#D4AF37] flex items-center justify-center transition-all shadow-sm flex-shrink-0 active:scale-95">
                  <FiPaperclip size={20} />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full bg-white border border-white focus:border-[#C2185B] focus:shadow-[0_0_20px_rgba(194,24,91,0.08)] rounded-[1.5rem] py-5 pl-6 pr-14 text-sm font-semibold text-gray-900 outline-none transition-all shadow-sm"
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors p-2">
                    <FiImage size={20} />
                  </button>
                </div>
                <button type="submit" disabled={!messageText.trim() || loadingMessages} className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] hover:from-[#F4D03F] hover:to-[#D4AF37] text-black flex items-center justify-center shadow-[0_10px_20px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50 flex-shrink-0 active:scale-95 group">
                  <FiSend size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#fcfcfc] text-gray-400">
            <FiMessageSquare size={48} className="mb-4 opacity-20" />
            <p className="font-medium italic">Select a conversation to start messaging</p>
          </div>
        )}

      </div>
    </div>
  )
}
