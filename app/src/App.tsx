import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import QuizPage from "./QuizPage";
import './App.css'

function Home() {
  
  const navigate = useNavigate();
  const [topic, setTopic] = useState('')
  const [field, setField] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

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

      const res = await fetch('http://127.0.0.1:5000/api/quiz', {
        
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, topic })
      
      })
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { id, quiz } = await res.json()
      

      if (quiz && quiz.length > 0 && quiz[0].q.includes("Failed to generate quiz")) {

        alert('Failed to generate quiz. Please check your OpenAI API key and try again.')
        return

      }
      
      navigate(`/quiz/${id}`, { state: { quiz } })
      
    } catch (err) {

      console.error(err)
      
      alert('Failed to generate quiz. Please try again.')
    
    } finally {

      setIsLoading(false)

    }
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
        </div>
      </section>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz/:id" element={<QuizPage />} />
      </Routes>
    </BrowserRouter>
  );
}
