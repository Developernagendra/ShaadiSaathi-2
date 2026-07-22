import { useEffect, useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchMyChats, fetchChatMessages, sendMessage,
  setCurrentChat, receiveMessage, setTyping, clearTyping, fetchAllChatsAdmin, markMessagesRead
} from '../../store/slices/chatSlice'
import { getSocket } from '../../utils/socket'
import { getInitials, timeAgo } from '../../utils/helpers'
import { FiSend, FiMessageCircle, FiCheck } from 'react-icons/fi';

export default function ChatPage() {
  const dispatch = useDispatch()
  const { chats, currentChat, messages, loading, typingUsers } = useSelector(s => s.chat)
  const { user } = useSelector(s => s.auth)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // We need a ref for currentChat to use inside the socket listener without adding it to the dependency array
  const currentChatRef = useRef(currentChat)
  useEffect(() => { currentChatRef.current = currentChat }, [currentChat])

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchAllChatsAdmin())
    } else {
      dispatch(fetchMyChats())
    }
  }, [dispatch, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Set up socket listeners once on mount
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handleNewMessage = ({ chatId, message }) => {
      dispatch(receiveMessage({ chatId, message }))
      // If we are actively viewing this chat, instantly mark it as read on the backend
      if (currentChatRef.current?._id === chatId) {
        socket.emit('mark_read', { chatId, userId: user?._id })
      }
    }
    const handleTyping = ({ userId }) => dispatch(setTyping(userId))
    const handleStopTyping = ({ userId }) => dispatch(clearTyping(userId))
    const handleMessagesRead = ({ chatId, readBy }) => dispatch(markMessagesRead({ chatId, readBy }))

    socket.on('new_message', handleNewMessage)
    socket.on('user_typing', handleTyping)
    socket.on('user_stop_typing', handleStopTyping)
    socket.on('messages_read', handleMessagesRead)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('user_typing', handleTyping)
      socket.off('user_stop_typing', handleStopTyping)
      socket.off('messages_read', handleMessagesRead)
    }
  }, [dispatch, user?._id])

  const openChat = useCallback((chat) => {
    dispatch(setCurrentChat(chat))
    dispatch(fetchChatMessages(chat._id))
    const socket = getSocket()
    if (socket) socket.emit('join_chat', chat._id)
  }, [dispatch])

  const handleSend = async () => {
    if (!input.trim() || !currentChat) return
    const content = input.trim()
    setInput('')
    dispatch(sendMessage({ chatId: currentChat._id, content }))
  }

  const handleTyping = () => {
    const socket = getSocket()
    if (!socket || !currentChat) return
    socket.emit('typing', { chatId: currentChat._id, userId: user?._id })
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { chatId: currentChat._id, userId: user?._id })
    }, 2000)
  }

  const getOtherParticipant = (chat) => {
    return chat.participants?.find(p => p._id !== user?._id) || chat.participants?.[0]
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto w-full px-0 sm:px-4 py-0 sm:py-6 flex sm:gap-5" style={{ height: 'calc(100vh - 4rem)' }}>

        {/* Chat List Sidebar */}
        <aside className={`w-full sm:w-80 flex-shrink-0 bg-white sm:rounded-2xl shadow-sm border-r sm:border border-gray-100 overflow-hidden flex flex-col ${currentChat ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-display font-bold text-xl text-gray-800">Messages</h2>
            <p className="text-sm text-gray-400">{chats.length} conversation{chats.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 overflow-y-auto chat-scroll">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <FiMessageCircle size={40} className="text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm">No conversations yet</p>
                <p className="text-gray-300 text-xs mt-1">Chat with vendors to start</p>
              </div>
            ) : (
              chats.map(chat => {
                const other = getOtherParticipant(chat)
                const isActive = currentChat?._id === chat._id
                return (
                  <button
                    key={chat._id}
                    onClick={() => openChat(chat)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0 ${isActive ? 'bg-primary-50' : ''}`}
                  >
                    <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700 flex-shrink-0 overflow-hidden">
                      {other?.avatar?.url
                        ? <img src={other.avatar.url} alt={other.name} className="w-full h-full object-cover" />
                        : getInitials(other?.name || chat.vendor?.businessName || 'V')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${isActive ? 'text-primary-700' : 'text-gray-800'}`}>
                        {chat.vendor?.businessName || other?.name || 'Chat'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                    {chat.lastMessage?.sentAt && (
                      <span className="text-xs text-gray-300 flex-shrink-0">{timeAgo(chat.lastMessage.sentAt)}</span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <div className={`flex-1 bg-white sm:rounded-2xl shadow-sm sm:border border-gray-100 overflow-hidden flex flex-col min-w-0 ${!currentChat ? 'hidden sm:flex' : 'flex'}`}>
          {!currentChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                <FiMessageCircle size={36} className="text-primary-300" />
              </div>
              <h3 className="font-display text-xl font-semibold text-gray-700 mb-2">Select a Conversation</h3>
              <p className="text-gray-400 text-sm max-w-xs">Choose a chat from the left to start messaging with vendors</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                <button 
                  onClick={() => dispatch(setCurrentChat(null))} 
                  className="sm:hidden w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-600 mr-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700 overflow-hidden">
                  {currentChat.vendor?.images?.[0]?.url
                    ? <img src={currentChat.vendor?.images?.[0]?.url} className="w-full h-full object-cover" alt="" />
                    : getInitials(currentChat.vendor?.businessName || 'V')}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{currentChat.vendor?.businessName || 'Vendor'}</p>
                  <p className="text-xs text-green-500 font-medium">● Online</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto chat-scroll p-4 space-y-3">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-400 text-sm">No messages yet. Say hello! 👋</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isOwn = msg.sender === user?._id || msg.sender?._id === user?._id
                    return (
                      <div key={msg._id || i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isOwn
                            ? 'bg-primary-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}>
                          <p>{msg.content}</p>
                          <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${isOwn ? 'text-pink-200' : 'text-gray-400'}`}>
                            <span>{msg.createdAt ? timeAgo(msg.createdAt) : 'now'}</span>
                            {isOwn && (
                              <span className="flex -space-x-1">
                                <FiCheck size={14} className={msg.isRead ? 'text-blue-200' : 'opacity-60'} />
                                {msg.isRead && <FiCheck size={14} className="text-blue-200" />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <div className="flex gap-1">
                      {[0, 150, 300].map(delay => (
                        <div
                          key={delay}
                          className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                    <span>typing...</span>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-100 flex-shrink-0">
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={e => { setInput(e.target.value); handleTyping() }}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="w-12 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <FiSend size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
