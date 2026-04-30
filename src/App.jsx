import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase.js'
import VoteTab from './components/VoteTab.jsx'
import NominateTab from './components/NominateTab.jsx'
import VisionTab from './components/VisionTab.jsx'
import DiscussTab from './components/DiscussTab.jsx'
import AboutTab from './components/AboutTab.jsx'
import './App.css'
import './components/VoteTab.css'
import './components/NominateTab.css'
import './components/VisionTab.css'
import './components/DiscussTab.css'
import './components/AboutTab.css'

const TAB_LABELS = [
  { key: 'ballot', label: 'THE BALLOT' },
  { key: 'nominate', label: 'NOMINATE' },
  { key: 'vision', label: 'THIS MONTH' },
  { key: 'letters', label: 'LETTERS' },
  { key: 'about', label: 'ABOUT' }
]

const SEED_BOOKS = [
  {
    title: 'Norwegian Wood',
    author: 'Haruki Murakami',
    genre: 'Literary Fiction',
    accent: '#8B6B4A',
    votes: 5240,
    why: 'Murakami\'s most beloved novel. Loss, memory, desire. Every scene already feels like a film frame.',
    logline: 'A young man navigating grief, love and identity in 1960s Tokyo finds himself torn between the girl who connects him to his dead friend and the one who represents everything alive.',
    tone: 'Melancholy and sensuous. Memory as fog. Youth as something already lost even as you live it.',
    world: 'Tokyo in autumn. Vinyl records. Dormitory corridors at night. A sanatorium in the mountains. The smell of rain.',
    feeling: 'Like listening to a song that makes you ache for something you cannot name.',
    chars: ['Toru Watanabe', 'Naoko'],
    submitter: 'Page to Screen'
  },
  {
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    genre: 'Science Fiction',
    accent: '#6A9FD8',
    votes: 4821,
    why: 'Survival + first contact + amnesia. The Rocky scenes alone would make cinema history.',
    logline: 'An amnesiac astronaut alone at the edge of the universe discovers the only thing standing between Earth extinction and survival is a friendship that should be impossible.',
    tone: 'Clinical isolation giving way to unexpected warmth. Gravity meets Cast Away but funnier.',
    world: 'Cold blues and whites. A single figure against infinite dark. Stars as both terror and comfort.',
    feeling: 'You will cry not from sadness but from the shock of discovering that loneliness and wonder can exist in the same breath.',
    chars: ['Ryland Grace', 'Rocky'],
    submitter: 'Page to Screen'
  },
  {
    title: 'The Seven Husbands of Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    genre: 'Historical Drama',
    accent: '#C4A0A0',
    votes: 3820,
    why: 'Old Hollywood glamour, queer love story, mystery structure. Prestige picture in its bones.',
    logline: 'A reclusive Hollywood legend finally tells her story — a decades-spanning saga of ambition, identity, and a love she spent her whole life hiding.',
    tone: 'Old Hollywood glamour concealing raw devastating truth. Gorgeous and heartbreaking.',
    world: 'Golden studio lots. Candlelit dressing rooms. Sequins and shadows.',
    feeling: 'The rare story that makes you feel the full weight of a life.',
    chars: ['Evelyn Hugo', 'Monique Grant'],
    submitter: 'Page to Screen'
  },
  {
    title: 'Piranesi',
    author: 'Susanna Clarke',
    genre: 'Literary Fantasy',
    accent: '#A89BC2',
    votes: 3100,
    why: 'Visually unlike anything. Guillermo del Toro was born to make this.',
    logline: 'A man lives inside a house with infinite halls and tidal statues until the walls reveal that nothing about his world is what he believes.',
    tone: 'Eerie serenity masking something terrifying. Dreamy and devastating.',
    world: 'Marble halls stretching forever. Tidal light. Statues that seem to breathe.',
    feeling: 'Like remembering a dream you never had.',
    chars: ['Piranesi', 'The Other'],
    submitter: 'Page to Screen'
  },
  {
    title: 'The Midnight Library',
    author: 'Matt Haig',
    genre: 'Literary Fiction',
    accent: '#6FB8A0',
    votes: 2400,
    why: 'Every parallel life is a different visual world. A production designers dream.',
    logline: 'Between life and death exists a library where every book is a life you could have lived and one woman must choose which version of herself is worth returning to.',
    tone: 'Melancholy that transforms into quiet joy. Tender and human.',
    world: 'Infinite green shelves. Books that glow. Silence that feels alive.',
    feeling: 'Makes you want to call someone you love the moment it ends.',
    chars: ['Nora Seed', 'Mrs Elm'],
    submitter: 'Page to Screen'
  },
  {
    title: 'All the Light We Cannot See',
    author: 'Anthony Doerr',
    genre: 'Historical Fiction',
    accent: '#C4A882',
    votes: 1900,
    why: 'Two parallel stories converging. The radio scenes are already cinematic.',
    logline: 'A blind French girl and a German orphan are pulled toward each other as a war tears the world apart around them.',
    tone: 'Devastating tenderness. War as backdrop not subject.',
    world: 'Cobblestone streets. Radio waves. Firelight. The sea. Smoke on the horizon.',
    feeling: 'Grief and beauty wound so tightly you cannot separate them.',
    chars: ['Marie-Laure', 'Werner'],
    submitter: 'Page to Screen'
  },
  {
    title: 'The Women',
    author: 'Kristin Hannah',
    genre: 'Historical Fiction',
    accent: '#C4956A',
    votes: 2150,
    why: 'Vietnam through a female soldiers eyes. Raw, devastating, completely uncharted on screen.',
    logline: 'A young woman follows her brother to Vietnam as an Army nurse and returns home to a country that refuses to acknowledge she was ever there.',
    tone: 'Unflinching bravery meeting quiet devastation. The personal cost of war told through the people history forgot.',
    world: 'Jungle heat and field hospitals. Protest signs and airport terminals. A homecoming with no welcome.',
    feeling: 'The kind of film that makes you furious and heartbroken at the same time.',
    chars: ['Frankie McGrath', 'Barb Johnson'],
    submitter: 'Page to Screen'
  }
]

function sortBooks(list) {
  return [...list].sort((left, right) => (right.votes || 0) - (left.votes || 0))
}

function seedBooks() {
  return SEED_BOOKS.map((book, index) => ({
    ...book,
    id: book.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 45) || `seed-${index}`,
    created_at: new Date().toISOString()
  }))
}


async function fetchBookMetadata({ title, author, genre, why }) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) {
    return {
      logline: `A powerful adaptation of ${title} by ${author} that turns longing and danger into a cinematic mission.`,
      tone: 'Bold and intimate with a cinematic thrust.',
      world: 'A vivid film world populated by light and shadow.',
      feeling: 'A stirring invitation to the film audience.',
      chars: [title, author]
    }
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a film development expert. Given a book title, author, genre and why it should be adapted, return ONLY a JSON object with these exact keys: logline, tone, world, feeling, chars. chars is an array of 2 character names. No markdown, no explanation, just JSON.'
        },
        {
          role: 'user',
          content: `Book: ${title} by ${author}\nGenre: ${genre}\nWhy adapt: ${why}`
        }
      ]
    })
  })

  const data = await response.json()
  const text = data.choices[0].message.content
  const parsed = JSON.parse(text)
  if (!parsed) {
    return {
      logline: `A powerful adaptation of ${title} by ${author} that turns longing and danger into a cinematic mission.`,
      tone: 'Bold and intimate with a cinematic thrust.',
      world: 'A vivid film world populated by light and shadow.',
      feeling: 'A stirring invitation to the film audience.',
      chars: [title, author]
    }
  }

  return {
    logline: parsed.logline || `A cinematic adaptation of ${title} by ${author}.`,
    tone: parsed.tone || 'A confident cinematic tone.',
    world: parsed.world || 'A richly imagined visual world.',
    feeling: parsed.feeling || 'A feeling that pulls the audience in.',
    chars: Array.isArray(parsed.chars)
      ? parsed.chars
      : typeof parsed.chars === 'string'
      ? parsed.chars.split(',').map((item) => item.trim()).filter(Boolean)
      : [title, author]
  }
}

async function fetchScreenplayText(book) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) {
    return `FADE IN:\n\nINT. UNKNOWN LOCATION - DAY\n\nA cinematic opening inspired by ${book.title} by ${book.author}.\n\nThis screenplay exists in outline because the API key is not configured.`
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content: 'You are a professional Hollywood screenplay writer. Write compelling properly formatted screenplay openings. Use FADE IN, scene headings (INT./EXT. LOCATION - DAY/NIGHT), action lines in present tense, character names CENTERED IN CAPS above dialogue. 500-600 words. End on a strong hook.'
        },
        {
          role: 'user',
          content: `Write the opening scene of a screenplay adaptation of "${book.title}" by ${book.author}. Genre: ${book.genre}. Logline: ${book.logline}. Tone: ${book.tone}. Make it cinematic from line one.`
        }
      ]
    })
  })

  const data = await response.json()
  const text = data.choices[0].message.content
  return text.trim()
}

function getFallbackBooks() {
  return seedBooks()
}

function App() {
  const [books, setBooks] = useState([])
  const [votedIds, setVotedIds] = useState([])
  const [sessionId, setSessionId] = useState('')
  const [activeTab, setActiveTab] = useState('ballot')
  const [selectedBookId, setSelectedBookId] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [screenplayLoading, setScreenplayLoading] = useState(false)
  const [appLoading, setAppLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('pts_session') || Math.random().toString(36).slice(2)
    localStorage.setItem('pts_session', saved)
    setSessionId(saved)
  }, [])

  useEffect(() => {
    if (!sessionId) {
      return
    }

    let active = true

    const loadBooks = async () => {
      setStatusMessage('Loading the ballot...')
      if (supabase) {
        try {
          const { data, error } = await supabase.from('books').select('*').order('votes', { ascending: false })
          let loadedBooks = []
          if (error) {
            throw error
          }

          if (!data?.length) {
            const seedPayload = SEED_BOOKS.map((book) => ({
              ...book,
              votes: book.votes || 1,
              accent: book.accent || '#8B9E8B',
              submitter: book.submitter || 'Page to Screen'
            }))
            const { data: inserted } = await supabase.from('books').insert(seedPayload).select('*')
            loadedBooks = inserted || []
          } else {
            loadedBooks = data
          }

          if (!loadedBooks?.length) {
            setBooks(getFallbackBooks())
            setStatusMessage('Using seed ballot while the platform warms up.')
          } else if (active) {
            setBooks(sortBooks(loadedBooks))
            setStatusMessage('')
          }
        } catch (error) {
          console.warn(error)
          if (active) {
            setBooks(getFallbackBooks())
            setStatusMessage('Offline mode enabled: the seed ballot is visible.')
            setAppLoading(false)
          }
        }

        try {
          const { data: votesData } = await supabase.from('votes').select('book_id').eq('session_id', sessionId)
          if (active && votesData) {
            setVotedIds(votesData.map((vote) => vote.book_id))
          }
        } catch (error) {
          console.warn('Vote listing failed', error)
        }
      } else {
        setBooks(getFallbackBooks())
        setStatusMessage('Offline mode enabled: the seed ballot is visible.')
      }
      if (active) {
        setAppLoading(false)
      }
    }

    loadBooks()

    let channel = null
    if (supabase) {
      channel = supabase
        .channel('books-stream')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'books' }, (payload) => {
          setBooks((current) => {
            if (current.some((book) => book.id === payload.new.id)) {
              return current
            }
            return sortBooks([...current, payload.new])
          })
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'books' }, (payload) => {
          setBooks((current) => sortBooks(current.map((book) => (book.id === payload.new.id ? { ...book, ...payload.new } : book))))
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'books' }, (payload) => {
          setBooks((current) => current.filter((book) => book.id !== payload.old.id))
        })
        .subscribe()
    }

    return () => {
      active = false
      if (supabase && channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [sessionId])

  useEffect(() => {
    if (!selectedBookId && books.length) {
      setSelectedBookId(books[0].id)
    }
  }, [books, selectedBookId])

  useEffect(() => {
    // Reset status message when switching tabs
    setStatusMessage('')
  }, [activeTab])

  const selectedBook = useMemo(() => {
    return books.find((book) => book.id === selectedBookId) || books[0] || getFallbackBooks()[0]
  }, [books, selectedBookId])

  const handleVoteToggle = async (bookId) => {
    const alreadyVoted = votedIds.includes(bookId)
    const nextBooks = books.map((book) => {
      if (book.id !== bookId) return book
      return {
        ...book,
        votes: (book.votes || 0) + (alreadyVoted ? -1 : 1)
      }
    })
    setBooks(sortBooks(nextBooks))
    setVotedIds((current) => (alreadyVoted ? current.filter((id) => id !== bookId) : [...current, bookId]))

    if (supabase) {
      try {
        if (alreadyVoted) {
          await supabase.from('votes').delete().eq('book_id', bookId).eq('session_id', sessionId)
        } else {
          await supabase.from('votes').insert({ book_id: bookId, session_id: sessionId })
        }
      } catch (error) {
        console.warn('Vote table update failed', error)
      }

      const matchingBook = nextBooks.find((book) => book.id === bookId)
      if (matchingBook) {
        try {
          await supabase.from('books').update({ votes: matchingBook.votes }).eq('id', bookId)
        } catch (error) {
          console.warn('Book vote count update failed', error)
        }
      }
    }
  }

  const handleSubmitNomination = async (submission) => {
    setIsSubmitting(true)
    setStatusMessage('Nominating your book...')
    try {
      const meta = await fetchBookMetadata(submission)
      const payload = {
        id: `nom-${Math.random().toString(36).slice(2, 10)}`,
        title: submission.title,
        author: submission.author,
        genre: submission.genre,
        why: submission.why,
        submitter: submission.submitter || 'Page to Screen',
        votes: 1,
        accent: '#8B9E8B',
        ...meta
      }
      let data = payload
      if (supabase) {
        const response = await supabase.from('books').insert(payload).select('*').single()
        if (response.error) {
          throw response.error
        }
        data = response.data
      }
      setBooks((current) => sortBooks([data, ...current]))
      setVotedIds((current) => [...new Set([data.id, ...current])])
      setStatusMessage('Your nomination is live. Redirecting to the ballot...')
      setTimeout(() => {
        setActiveTab('ballot')
        setStatusMessage('')
      }, 2000)
      return true
    } catch (error) {
      console.error(error)
      setStatusMessage('We could not send the nomination right now. Try again later.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateScreenplay = async (book) => {
    if (!book) return null
    if (book.screenplay) {
      return book.screenplay
    }

    setScreenplayLoading(true)
    setStatusMessage('Generating screenplay...')
    try {
      const screenplay = await fetchScreenplayText(book)
      if (supabase) {
        const { error } = await supabase.from('books').update({ screenplay }).eq('id', book.id)
        if (error) {
          console.warn('Saving screenplay failed', error)
        }
      }
      setBooks((current) => current.map((item) => (item.id === book.id ? { ...item, screenplay } : item)))
      setStatusMessage('Screenplay ready. Download it or keep exploring.')
      // Auto-hide the success message after 3 seconds
      setTimeout(() => setStatusMessage(''), 3000)
      return screenplay
    } catch (error) {
      console.error(error)
      setStatusMessage('The screenplay service is unavailable. Please try again later.')
      return null
    } finally {
      setScreenplayLoading(false)
    }
  }

  const handleDownloadPdf = (book) => {
    if (!book) return
    const pdfSource = window.jspdf?.jsPDF || window.jsPDF
    if (!pdfSource) {
      setStatusMessage('Unable to access jsPDF. Make sure the script is loaded.')
      return
    }

    const doc = new pdfSource({ unit: 'pt', format: 'letter' })
    const margin = 40
    doc.setFillColor('#04040A')
    doc.rect(0, 0, 612, 792, 'F')
    doc.setFontSize(24)
    doc.setTextColor('#EEF2EE')
    doc.setFont('times', 'bold')
    doc.text(book.title, margin, 90)
    doc.setFontSize(12)
    doc.setFont('times', 'normal')
    doc.text(`by ${book.author}`, margin, 120)
    doc.setFontSize(10)
    doc.text(book.logline || '', margin, 155, { maxWidth: 532 })
    doc.setTextColor('#8A8A8A')
    doc.text('Produced by Page to Screen', margin, 185)

    doc.addPage()
    doc.setFont('courier', 'normal')
    doc.setFontSize(10)
    const lines = doc.splitTextToSize(book.screenplay || 'No screenplay available yet.', 532)
    let y = 60
    let page = 1

    function stampFooter(pageNumber) {
      doc.setFontSize(8)
      doc.setTextColor('#5F5F5F')
      doc.text(`Page ${pageNumber} · Page to Screen`, margin, 772)
      doc.text('Produced by Page to Screen', 572, 772, { align: 'right' })
    }

    lines.forEach((line) => {
      if (y > 730) {
        stampFooter(page)
        doc.addPage()
        page += 1
        y = 60
        doc.setFont('courier', 'normal')
        doc.setFontSize(10)
      }
      doc.text(line, margin, y)
      y += 12
    })

    stampFooter(page)
    doc.save(`${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_screenplay.pdf`)
  }

  if (appLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#F2EDE4',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem'
      }}>
        <div style={{
          fontFamily: 'Papyrus, fantasy',
          fontSize: '2rem',
          color: '#1C1814'
        }}>
          Page to Screen
        </div>
        <div style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontStyle: 'italic',
          fontSize: '14px',
          color: '#8A8880'
        }}>
          Loading the ballot...
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#7A9E7E',
            animation: 'pulse 1.2s ease-in-out infinite'
          }}/>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#7A9E7E',
            animation: 'pulse 1.2s ease-in-out 0.2s infinite'
          }}/>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#7A9E7E',
            animation: 'pulse 1.2s ease-in-out 0.4s infinite'
          }}/>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <main className="page-frame">
        <header className="site-header">
          <div className="header-date">April 2026</div>
          <div className="brand-title">
            Page <span>to</span> Screen
          </div>
          <button className="pill-button" onClick={() => setActiveTab('nominate')}>
            Submit a book
          </button>
        </header>

        <nav className="tab-row" aria-label="Primary tabs">
          {TAB_LABELS.map((tab) => (
            <button
              key={tab.key}
              className={tab.key === activeTab ? 'tab-button active' : 'tab-button'}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="status-bar">{activeTab === 'vision' ? statusMessage : ''}</div>

        <section className="tab-content">
          {activeTab === 'ballot' && (
            <VoteTab
              books={books}
              votedIds={votedIds}
              onToggleVote={handleVoteToggle}
              onSeeVision={(id) => {
                setSelectedBookId(id)
                setActiveTab('vision')
              }}
            />
          )}
          {activeTab === 'nominate' && (
            <NominateTab onSubmit={handleSubmitNomination} isLoading={isSubmitting} />
          )}
          {activeTab === 'vision' && (
            <VisionTab
              book={selectedBook}
              onGenerateScreenplay={handleGenerateScreenplay}
              onDownloadPdf={handleDownloadPdf}
              loading={screenplayLoading}
            />
          )}
          {activeTab === 'letters' && (
            <DiscussTab
              books={books}
              selectedBookId={selectedBook?.id}
              onBookSelect={setSelectedBookId}
            />
          )}
          {activeTab === 'about' && <AboutTab />}
        </section>

        <footer className="app-footer">
          <div className="footer-left">
            <span className="footer-brand">Page to Screen</span>
            <p className="footer-disclaimer">This ballot is community-curated and should be seen as inspiration, not industry advice.</p>
          </div>
          <div className="footer-center">
            <p>A platform for filmmakers and audience across the globe to discover new stories.</p>
          </div>
          <div className="footer-right">
            <span>Built by Mandira · April 2026</span>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
