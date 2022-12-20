import './style.css'

function App() {
  const appTitle = 'Today I Learned'

  return (
    <>
      <header className="header">
        <div className="logo">
          <img src="logo.png" height="68" width="68" alt="Today I Learned" />
          <h1>{appTitle}</h1>
        </div>
        <button className="btn btn-large btn-open">Share a fact</button>
      </header>

      <NewFactForm />

      <main className="main">
        <CategoryFilter />
        <FactList />
      </main>
    </>
  )
}

function NewFactForm() {
  return <form className="fact-form">NewFactForm</form>
}

function CategoryFilter() {
  return <aside>CategoryFilter</aside>
}

function FactList() {
  return <section>Facts List</section>
}

export default App
