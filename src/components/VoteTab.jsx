import { useState } from 'react'

export default function VoteTab({ books = [], votedIds = [], onToggleVote, onSeeVision }) {
  const leader = books[0]
  const [commentText, setCommentText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [voteMessage, setVoteMessage] = useState('')
  const [showVotePulse, setShowVotePulse] = useState(false)

  const handleCommentSubmit = (event) => {
    event.preventDefault()
    setCommentText('')
  }

  const topBooks = [...books].sort((a, b) => (b.votes || 0) - (a.votes || 0))
  const visibleBooks = searchTerm.trim()
    ? topBooks.filter((book) =>
        book.title.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.trim().toLowerCase())
      )
    : topBooks.slice(0, 5)

  const rankLabel = searchTerm.trim() ? 'Search results' : 'Top this month'

  const handleToggle = (bookId) => {
    const already = votedIds.includes(bookId)
    onToggleVote(bookId)
    setVoteMessage(already ? 'Vote removed.' : 'Vote saved. Thanks for deciding.' )
    setShowVotePulse(true)
    setTimeout(() => setShowVotePulse(false), 400)
    setTimeout(() => setVoteMessage(''), 2200)
  }

  return (
    <div className="vote-tab">
      <div className="vote-grid">
        <section className="featured-card">
          {leader ? (
            <>
              <div className="leader-label">THIS MONTH'S LEADER</div>
              <div className="leader-art" style={{ background: leader.accent || '#8B9E8B' }}>
                <div className="leader-logo">
                  <span className="leader-logo-mark">📖</span>
                  <div className="leader-logo-copy">
                    <span>Book of the month</span>
                    <strong>{leader.title}</strong>
                  </div>
                </div>
              </div>
              <div className="leader-meta">
                <div className="genre-pill">{leader.genre}</div>
                <h2>{leader.title}</h2>
                <p className="leader-author">by {leader.author}</p>
                <blockquote>{leader.why}</blockquote>
                <div className="leader-footer">
                  <div className={showVotePulse ? 'votes-display pulse' : 'votes-display'}>{leader.votes || 0} votes</div>
                  <div className="leader-actions">
                    <button
                      className="vote-button"
                      onClick={() => handleToggle(leader.id)}
                    >
                      {votedIds.includes(leader.id) ? 'Remove vote' : 'Vote'}
                    </button>
                    <button className="vision-button" onClick={() => onSeeVision(leader.id)}>
                      See the vision →
                    </button>
                  </div>
                </div>
                {voteMessage && <div className="vote-toast">{voteMessage}</div>}
                <div className="leader-comments">
                  <div className="leader-comments-label">Audience notes</div>
                  <div className="comment">
                    <p className="comment-text">“The opening line already feels like a frame, and you can see the world in a single breath.”</p>
                    <span className="comment-author">— A reader in the room</span>
                  </div>
                  <div className="comment">
                    <p className="comment-text">“This is the kind of story that lives in the margins and then blows up on screen.”</p>
                    <span className="comment-author">— A story lover</span>
                  </div>
                </div>
                <form className="leader-add-comment" onSubmit={handleCommentSubmit}>
                  <div className="leader-comments-label">Add comment</div>
                  <textarea
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Share your take on this month's leader..."
                    rows="3"
                  />
                  <button type="submit" className="comment-submit-button">
                    Post comment
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="empty-state">No books are available in the ballot yet.</div>
          )}
        </section>

        <aside className="rank-sidebar">
          <div className="rank-intro">
            <span className="rank-heading">{rankLabel}</span>
            <p>Live community vote totals. Click to pick the featured vision.</p>
          </div>
          <input
            className="rank-search"
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <ol className="rank-list">
            {visibleBooks.map((book, index) => (
              <li key={book.id} className="rank-item">
                <button className="rank-row" onClick={() => onSeeVision(book.id)}>
                  <span className="rank-position">{String(index + 1).padStart(2, '0')}</span>
                  <div className="rank-copy">
                    <strong>{book.title}</strong>
                    <span>{book.author}</span>
                  </div>
                  <span className="rank-genre">{book.genre}</span>
                </button>
                <button
                  className={
                    votedIds.includes(book.id) ? 'rank-vote active' : 'rank-vote'
                  }
                  onClick={() => onToggleVote(book.id)}
                >
                  ↑ {book.votes || 0}
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  )
}
