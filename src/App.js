import { useEffect, useState } from 'react'
import supabase from './supabase'

import './style.css'

const CATEGORIES = [
  { name: 'technology', color: '#3b82f6' },
  { name: 'science', color: '#16a34a' },
  { name: 'finance', color: '#ef4444' },
  { name: 'society', color: '#eab308' },
  { name: 'entertainment', color: '#db2777' },
  { name: 'health', color: '#14b8a6' },
  { name: 'history', color: '#f97316' },
  { name: 'news', color: '#8b5cf6' }
]

function App() {
  const [showForm, setShowForm] = useState(false)
  const [facts, setFacts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [messageLoader, setMessageLoader] = useState('')
  const [currentCategory, setCurrentCategory] = useState('all')

  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true)

        let query = supabase.from('facts').select('*')

        if (currentCategory !== 'all') query = query.eq('category', currentCategory)

        const { data: facts, error } = await query
          .order('votesInteresting', { ascending: false })
          .limit(1000)

        if (!error) {
          setFacts(facts)
          setIsLoading(false)
          setMessageLoader('Loading')
        } else {
          setMessageLoader('There was a problem getting data')
          setIsLoading(true)
        }
      }
      getFacts()
    },
    [currentCategory]
  )

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />
      {showForm ? <NewFactForm setFacts={setFacts} setShowForm={setShowForm} /> : null}

      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <Loader messageLoader={messageLoader} />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  )
}

function Loader({ messageLoader }) {
  return (
    <>
      {messageLoader !== 'Loading' ? (
        <p className="message message-barLoader">
          {messageLoader}
          <p></p>
        </p>
      ) : (
        <p className="message message-dotLoader">{messageLoader}</p>
      )}
    </>
  )
}

function Header({ showForm, setShowForm }) {
  const appTitle = 'Today I Learned'

  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="Today I Learned" />
        <h1>{appTitle}</h1>
      </div>
      <button className="btn btn-large btn-open" onClick={() => setShowForm(show => !show)}>
        {showForm ? 'Close' : 'Share a fact'}
      </button>
    </header>
  )
}

function isValidHttpUrl(string) {
  let url
  try {
    url = new URL(string)
  } catch (_) {
    return false
  }
  return url.protocol === 'http:' || url.protocol === 'https:'
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState('')
  const [source, setSource] = useState('')
  const [category, setCategory] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isTooLong, setIsTooLong] = useState(false)
  const maxLength = 200
  const textLength = text.length

  async function handleSubmit(e) {
    e.preventDefault()

    if (text && text.length <= maxLength && isValidHttpUrl(source) && category) {
      setIsUploading(true)
      const { data: newFact, error } = await supabase
        .from('facts')
        .insert([{ text, source, category }])
        .select()
      setIsUploading(false)

      if (!error) setFacts(facts => [newFact[0], ...facts])

      setText('')
      setSource('')
      setCategory('')

      setShowForm(false)
    }
  }

  useEffect(
    function () {
      if (maxLength - textLength < 0) {
        setIsTooLong(true)
      } else {
        setIsTooLong(false)
      }
    },
    [textLength]
  )

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={isUploading}
      />
      {maxLength - textLength >= 0 ? (
        <span>{maxLength - textLength}</span>
      ) : (
        <span className="long">Too long</span>
      )}
      <input
        type="text"
        placeholder="Trustworthy source..."
        value={source}
        onChange={e => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select value={category} onChange={e => setCategory(e.target.value)} disabled={isUploading}>
        <option value="" disabled selected>
          Choose category:
        </option>
        {CATEGORIES.map(cat => (
          <option value={cat.name}>{cat.name}</option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading || isTooLong}>
        Post
      </button>
    </form>
  )
}

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button className="btn btn-all-categories" onClick={() => setCurrentCategory('all')}>
            All
          </button>
        </li>
        {CATEGORIES.map(cat => (
          <li className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => {
                setCurrentCategory(cat.name)
              }}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0)
    return (
      <p className="message" style={{ fontSize: '28px' }}>
        No facts for this category yet! Create the first one 🫰
      </p>
    )

  return (
    <section>
      <ul className="facts-list">
        {facts.map(fact => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
      <p style={{ opacity: '50%' }}>
        There are {facts.length} facts in the database. Add your own!
      </p>
    </section>
  )
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false)
  const isDisputed = fact.votesInteresting + fact.votesMindblowing < fact.votesFalse

  async function handlerVote(voteName) {
    setIsUpdating(true)
    const { data: updatedFact, error } = await supabase
      .from('facts')
      .update({ [voteName]: fact[voteName] + 1 })
      .eq('id', fact.id)
      .select()
    setIsUpdating(false)

    if (!error) setFacts(facts => facts.map(f => (f.id === fact.id ? updatedFact[0] : f)))
  }

  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[⛔️ DISPUTED]</span> : null}
        {fact.text}
        <a className="source" href={fact.source} target={'_blank'} rel="noreferrer">
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{ backgroundColor: CATEGORIES.find(cat => cat.name === fact.category).color }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button onClick={() => handlerVote('votesInteresting')} disabled={isUpdating}>
          👍 <strong>{fact.votesInteresting}</strong>
        </button>
        <button onClick={() => handlerVote('votesMindblowing')} disabled={isUpdating}>
          🤯 <strong>{fact.votesMindblowing}</strong>
        </button>
        <button onClick={() => handlerVote('votesFalse')} disabled={isUpdating}>
          ⛔️ <strong>{fact.votesFalse}</strong>
        </button>
      </div>
    </li>
  )
}

export default App
