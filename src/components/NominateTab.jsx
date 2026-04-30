import { useState } from 'react'

const GENRES = [
  'Science Fiction',
  'Historical Drama',
  'Literary Fantasy',
  'Literary Fiction',
  'Historical Fiction',
  'Thriller',
  'Speculative',
  'Mystery',
  'Romance'
]

const initialForm = {
  title: '',
  author: '',
  genre: 'Science Fiction',
  submitter: '',
  why: ''
}

export default function NominateTab({ onSubmit, isLoading }) {
  const [form, setForm] = useState(initialForm)
  const [message, setMessage] = useState('')

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.title.trim() || !form.author.trim() || !form.why.trim()) {
      setMessage('Title, author, and the reason why are required.')
      return
    }

    const success = await onSubmit(form)
    if (success) {
      setMessage('Thanks — your nomination is live on the ballot.')
      setForm(initialForm)
    } else {
      setMessage('Unable to submit right now. Please try again later.')
    }
  }

  return (
    <section className="nominate-tab">
      <div className="nominate-shell">
        <h2>Nominate a book for adaptation</h2>
        <p className="nominate-description">
          Share the title you think deserves a cinematic opening and help the community vote it up.
        </p>
        <form className="nominate-form" onSubmit={handleSubmit}>
          <label className="field-label">
            Title
            <input
              className="underline-input"
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Book title"
              required
            />
          </label>
          <label className="field-label">
            Author
            <input
              className="underline-input"
              value={form.author}
              onChange={(event) => updateField('author', event.target.value)}
              placeholder="Author name"
              required
            />
          </label>
          <label className="field-label">
            Genre
            <select
              className="underline-input"
              value={form.genre}
              onChange={(event) => updateField('genre', event.target.value)}
            >
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Your name (optional)
            <input
              className="underline-input"
              value={form.submitter}
              onChange={(event) => updateField('submitter', event.target.value)}
              placeholder="How should the community credit you?"
            />
          </label>
          <label className="field-label">
            Why adapt it?
            <textarea
              className="underline-input"
              value={form.why}
              onChange={(event) => updateField('why', event.target.value)}
              placeholder="What makes this book a movie worth voting for?"
              rows="5"
              required
            />
          </label>
          <button className="submit-nominate" type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Submit nomination'}
          </button>
          <p className="form-message">{message}</p>
        </form>
      </div>
    </section>
  )
}
