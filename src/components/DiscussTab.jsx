import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase.js'

export default function DiscussTab({ books = [], selectedBookId, onBookSelect }) {
  const [comments, setComments] = useState([])
  const [userName, setUserName] = useState('')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All Genres')
  const [showCommentForm, setShowCommentForm] = useState(false)

  const selectedBook = useMemo(
    () => books.find((book) => book.id === selectedBookId) || null,
    [books, selectedBookId]
  )

  // Get unique genres
  const genres = useMemo(() => {
    const unique = new Set(books.map((book) => book.genre || 'Other'))
    return ['All Genres', ...Array.from(unique).sort()]
  }, [books])

  // Filter books by genre
  const filteredBooks = useMemo(() => {
    if (selectedGenre === 'All Genres') {
      return books
    }
    return books.filter((book) => book.genre === selectedGenre)
  }, [books, selectedGenre])

  useEffect(() => {
    if (!selectedBook?.id) return

    let active = true
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('book_id', selectedBook.id)
        .order('created_at', { ascending: false })
      if (!error && active) {
        setComments(data || [])
      }
    }

    fetchComments()

    const channel = supabase
      .channel('comments-stream')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, (payload) => {
        if (payload.new.book_id === selectedBook.id) {
          setComments((current) => [payload.new, ...current])
        }
      })
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [selectedBook?.id])

  const handleCommentSubmit = async (event) => {
    event.preventDefault()
    if (!selectedBook?.id) {
      setMessage('Pick a book first.')
      return
    }
    if (!content.trim()) {
      setMessage('Please write a comment before posting.')
      return
    }

    const { error } = await supabase.from('comments').insert({
      book_id: selectedBook.id,
      user_name: userName.trim() || 'Reader',
      content: content.trim()
    })

    if (error) {
      setMessage('Unable to post comment right now.')
    } else {
      setMessage('Comment posted.')
      setContent('')
      setUserName('')
      setShowCommentForm(false)
    }
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="discuss-tab">
      <div className="discuss-grid">
        {/* LEFT COLUMN */}
        <div className="discuss-left">
          <div className="genre-filter">
            <select
              value={selectedGenre}
              onChange={(event) => {
                setSelectedGenre(event.target.value)
              }}
              className="genre-dropdown"
            >
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div className="book-list">
            {filteredBooks.map((book, index) => (
              <button
                key={book.id}
                type="button"
                className={`book-row ${book.id === selectedBook?.id ? 'active' : ''}`}
                onClick={() => onBookSelect(book.id)}
              >
                <div className="book-row-title">{book.title}</div>
                <div className="book-row-author">{book.author}</div>
                <div className="book-row-genre">{book.genre}</div>
                {index < filteredBooks.length - 1 && <div className="book-row-divider" />}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="discuss-right">
          {!selectedBook ? (
            <div className="empty-state-discuss">
              <p>Select a book to read and join the discussion</p>
            </div>
          ) : (
            <>
              <div className="book-header">
                <h2>{selectedBook.title}</h2>
                <p className="book-header-author">by {selectedBook.author}</p>
                <div className="comment-count">{comments.length} letters</div>
              </div>

              <div className="comments-section">
                {comments.length ? (
                  comments.map((comment) => (
                    <div key={comment.id || `${comment.user_name}-${comment.created_at}`} className="comment-item">
                      <div className="comment-avatar">{getInitials(comment.user_name || 'Reader')}</div>
                      <div className="comment-body">
                        <div className="comment-header">
                          <strong>{comment.user_name || 'Reader'}</strong>
                          <span className="comment-date">{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="comment-text">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="comment-empty-box">
                    <p className="comment-empty">No letters yet.</p>
                    <p className="comment-empty-note">Start the conversation by sharing the first audience note on this book.</p>
                  </div>
                )}
              </div>

              <button type="button" className="write-letter-button" onClick={() => setShowCommentForm(!showCommentForm)}>
                Write a Letter ✍
              </button>

              {showCommentForm && (
                <form className="comment-form-inline" onSubmit={handleCommentSubmit}>
                  <input
                    type="text"
                    value={userName}
                    onChange={(event) => setUserName(event.target.value)}
                    placeholder="Your name"
                    className="form-name"
                  />
                  <textarea
                    rows="5"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Share your thoughts..."
                    className="form-textarea"
                  />
                  <div className="form-actions">
                    <button type="submit" className="form-publish">
                      Publish
                    </button>
                    <button type="button" className="form-cancel" onClick={() => setShowCommentForm(false)}>
                      Cancel
                    </button>
                  </div>
                  {message && <p className="comment-message">{message}</p>}
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
