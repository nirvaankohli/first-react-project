import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [topic, setTopic] = useState('')
  const [field, setField] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [debugMsg, setDebugMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/message')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!field.trim()) {
      alert('Please enter a field of study')
      return
    }
    if (!topic.trim()) {
      alert('Please enter a topic')
      return
    }
    setIsLoading(true)

    try {
      const res = await fetch('http://127.0.0.1:5000/api/random');
      if (!res.ok) throw new Error(`bad status ${res.status}`);
      const { msg } = await res.json();
      console.log("backend says:", msg);
      setDebugMsg(msg);
    } catch (err) {
      console.error(err);
      setDebugMsg("⚠️ API call failed – check console/logs");
    } finally {
      setIsLoading(false)
    }

    console.log('Generating quiz for:', field, topic)
  }

  return (

    <div className="app">

      <section className="top-section">

        <div className="top-container">

          <div className="branding">

            <div className="brand-icon">TO BE DESIGNED</div>
            
            <div className="brand-text">
              <div className="brand-name">QuizAI(Trash Name IK)</div>
              <div className="brand-subtitle">For Students & Educators</div>
            </div>
          </div>

          <div className="hero-content">
            <h1 className="main-headline">
              Free AI-powered quiz generator to instantly create study materials
            </h1>
            
            <button className="cta-button">
              <span className="cta-icon">🚀</span>
              <span>Get Started Free</span>
            </button>
            <p>{message}</p>

          </div>

          <div className="abstract-shapes">

            <div className="standout shape-1 shape-blur"></div>
            <div className="standout shape-2 shape-blur"></div>
            <div className="standout shape-3 shape-blur"></div>

          </div>

          <div className="quiz-preview-window">

            <div className="window-header">

              <div className="window-title">Quiz Generator</div>

              <div className="window-controls">

                <div className="mac"></div>

                <div className="mac"></div>

                <div className="mac"></div>

              </div>

            </div>

            <div className="window-content">
              
              <div className="quiz-categories">
                <div className="category">
                  <h3>Computer Science</h3>
                  <div className="quiz-items">
                    <div className="quiz-item">Python Fundamentals</div>
                    <div className="quiz-item">Data Structures</div>
                    <div className="quiz-item">Algorithms</div>
                  </div>
                </div>
                <div className="category">
                  <h3>History</h3>
                  <div className="quiz-items">
                    <div className="quiz-item">World War II</div>
                    <div className="quiz-item">Ancient Rome</div>
                    <div className="quiz-item">Civil Rights</div>
                  </div>

                </div>

                <div className="category">
                  <h3>Science</h3>
                  <div className="quiz-items">
                    <div className="quiz-item">Chemistry</div>
                    <div className="quiz-item">Physics</div>
                    <div className="quiz-item">Biology</div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="form-section">
        <div className="form-container">
          <h2>Create Your Quiz</h2>
          <p>Enter your field of study and topic to generate a personalized study quiz</p>
          
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="field">Field of Study</label>
              <input

                type="text"
                id="field"
                value={field}
                onChange={(e) => setField(e.target.value)}
                placeholder="e.g., Computer Science, History, Biology..."
                className="input"
                required

              />
            </div>

            <div className="form-group">
              
              <label htmlFor="topic">Topic</label>
              
              <input

                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Python Fundamentals, World War II, Chemistry..."
                className="input"
                required

              />
            </div>

            <button 
            
              type="submit" 
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Generating Quiz...' : 'Generate Study Quiz'}
            </button>
          </form>

          {debugMsg && (
            <div className="debug-message">
              <h3>Debug Response:</h3>
              <pre className="debug-content">
                {debugMsg}
              </pre>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default App
