import { useState, useEffect } from 'react'

const getCharacterSnippet = (book, char) => {
  if (!book || !char) return ''

  const snippets = {
    'Norwegian Wood': {
      'Toru Watanabe': 'A quietly restless student navigating grief, memory, and the pull of Tokyo nights.',
      'Naoko': 'An elusive presence whose fragility and intensity shape every longing.'
    },
    'Project Hail Mary': {
      'Ryland Grace': 'A scientist awake on a damaged spacecraft with only science and humor to save humanity.',
      'Rocky': 'An alien friend from the stars whose loyalty and curiosity change the rules of survival.'
    },
    'Piranesi': {
      'Piranesi': 'A gentle soul who believes the endless halls are both home and mystery.',
      'The Other': 'A figure bound to the strange house, haunting and instructing with quiet urgency.'
    },
    'The Midnight Library': {
      'Nora Seed': 'A woman standing at the edge of possibility, searching for the life that feels true.',
      'Mrs Elm': 'A calm librarian who holds the door between regret and second chances.'
    },
    'All the Light We Cannot See': {
      'Marie-Laure': 'A blind girl whose courage and curiosity light a dark wartime world.',
      'Werner': 'A boy drawn between science and conscience under a war-torn sky.'
    },
    'The Women': {
      'Frankie McGrath': 'A spirited sailor fighting to prove herself in the chaos of Vietnam.',
      'Barb Johnson': 'A fierce nurse whose blunt kindness keeps her crew alive.'
    },
    'The Seven Husbands of Evelyn Hugo': {
      'Evelyn Hugo': 'A legendary star with secrets buried beneath her glamour and ambition.',
      'Monique Grant': 'A determined journalist pulling at the threads of Hollywood’s most guarded life.'
    }
  }

  return snippets[book.title]?.[char] || `A key figure in ${book.title}, seen here through a cinematic lens.`
}

export default function VisionTab({ book, onGenerateScreenplay, onDownloadPdf, loading }) {
  const [currentChar, setCurrentChar] = useState(book?.chars?.[0] || '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareMessage, setShareMessage] = useState('')
  const [copyLabel, setCopyLabel] = useState('Copy Message')
  const [copyLinkLabel, setCopyLinkLabel] = useState('Copy Link')

  const getShareTemplate = () => {
    if (!book) return ''
    return `I just voted for "${book.title}" by ${book.author} on Page to Screen — a platform where readers decide what gets adapted next. The AI wrote the opening scene. Check it out: pagetoscreen.vercel.app`
  }

  const openShareModal = () => {
    if (!book) return
    setShareMessage(getShareTemplate())
    setCopyLabel('Copy Message')
    setCopyLinkLabel('Copy Link')
    setShowShareModal(true)
  }

  const handleShareCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage)
      setCopyLabel('Copied ✓')
      setTimeout(() => setCopyLabel('Copy Message'), 2000)
    } catch (error) {
      console.warn('Copy failed', error)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('pagetoscreen.vercel.app')
      setCopyLinkLabel('Link Copied ✓')
      setTimeout(() => setCopyLinkLabel('Copy Link'), 2000)
    } catch (error) {
      console.warn('Copy failed', error)
    }
  }

  const closeShareModal = () => {
    setShowShareModal(false)
  }

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      closeShareModal()
    }
  }

  useEffect(() => {
    setCurrentChar(book?.chars?.[0] || '')
    setShareMessage(getShareTemplate())
    setCopyLabel('Copy Message')
    setCopyLinkLabel('Copy Link')
  }, [book])

  const handleGenerate = async () => {
    if (!book) return
    setIsGenerating(true)
    await onGenerateScreenplay(book)
    setIsGenerating(false)
  }

  if (!book) {
    return <div className="vision-tab empty-state">Choose a book to view this month&apos;s vision.</div>
  }

  return (
    <div className="vision-tab">
      <section className="poster-section">
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '0',
          paddingBottom: '0'
        }}>
          <button
            onClick={openShareModal}
            style={{
              background: '#1C1814',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '7px 18px',
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => { e.target.style.background = '#7A9E7E' }}
            onMouseLeave={(e) => { e.target.style.background = '#1C1814' }}
          >
            Share
          </button>
        </div>
        <div style={{
          background: book.accent
            ? `linear-gradient(135deg, ${book.accent} 0%, ${book.accent}CC 35%, #0A0A0F 100%)`
            : `linear-gradient(135deg, #7A9E7E33 0%, #0A0A0F 100%)`,
          padding: '3rem 2rem',
          textAlign: 'center',
          borderBottom: '0.5px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{
            fontSize: '9px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
            marginBottom: '1rem'
          }}>
            {book.genre}
          </div>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '3rem',
            fontWeight: 300,
            color: 'white',
            lineHeight: 1.05,
            marginBottom: '0.5rem'
          }}>
            {currentChar || book.title}
          </div>
          {currentChar && (
            <div style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.55)',
              letterSpacing: '0.12em',
              marginBottom: '0.75rem'
            }}>
              {book.title}
            </div>
          )}
          <div style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.1em'
          }}>
            {book.author}
          </div>
          <div style={{
            marginTop: '1.5rem',
            display: 'flex',
            gap: '8px',
            justifyContent: 'center'
          }}>
            {book.chars && book.chars.map((char, i) => (
              <button key={i}
                onClick={() => setCurrentChar(char)}
                style={{
                  background: currentChar === char 
                    ? '#1C1814' : '#7A9E7E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  letterSpacing: '0.08em'
                }}
              >
                {char}
              </button>
            ))}
          </div>
          <div style={{
            marginTop: '1rem',
            color: 'rgba(255,255,255,0.72)',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            maxWidth: '680px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            {getCharacterSnippet(book, currentChar)}
          </div>
        </div>

        {showShareModal && (
          <div className="share-modal-overlay" onClick={handleOverlayClick}>
            <div className="share-modal" onClick={(event) => event.stopPropagation()}>
              <button className="share-modal-close" onClick={closeShareModal}>×</button>
              <h3 className="share-modal-title">Share this book</h3>
              <p className="share-modal-subtitle">Edit the message before sharing</p>
              <textarea
                className="share-modal-textarea"
                value={shareMessage}
                onChange={(event) => setShareMessage(event.target.value)}
              />
              <div className="share-modal-actions">
                <button className="share-copy-button" type="button" onClick={handleShareCopy}>
                  {copyLabel}
                </button>
                <button className="share-link-button" type="button" onClick={handleCopyLink}>
                  {copyLinkLabel}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="vision-copy">
          <p className="vision-logline">“{book.logline}”</p>
          <div className="vision-features">
            <div className="feature-box">Tone: {book.tone}</div>
            <div className="feature-box">World: {book.world}</div>
          </div>
          <p className="vision-feeling">{book.feeling}</p>
          <div className="vision-stats">Community votes: {book.votes || 0}</div>
        </div>
      </section>

      <section className="screenplay-panel">
        <div className="screenplay-header">
          <div>
            <h2>{book.title}</h2>
            <p>Produced by Page to Screen</p>
          </div>
          <div className="screenplay-actions">
            <button className="generate-button" onClick={handleGenerate} disabled={loading || isGenerating}>
              {loading || isGenerating ? 'Generating...' : 'Generate screenplay'}
            </button>
          </div>
        </div>
        <div className="screenplay-copy">
          {book.screenplay ? (
            <>
              <pre>{book.screenplay}</pre>
              <div style={{
                borderTop: '0.5px solid rgba(255,255,255,0.08)',
                marginTop: '1.5rem',
                paddingTop: '1rem',
                textAlign: 'center'
              }}>
                <p style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontStyle: 'italic',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.35)',
                  lineHeight: 1.7,
                  maxWidth: '480px',
                  margin: '0 auto'
                }}>
                  This is an AI-generated proof of concept.
                  Every great film deserves a human
                  screenwriter who can bring their full
                  craft to it. Page to Screen connects
                  stories to the industry — the art
                  belongs to the writers.
                </p>
              </div>
              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <button className="download-button" onClick={() => onDownloadPdf(book)}>
                  Download PDF
                </button>
              </div>
            </>
          ) : (
            <p className="screenplay-empty">
              No screenplay has been generated yet. Use the button above to create the opening scene.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
