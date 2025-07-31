import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import QuizPage from "./QuizPage";
import logo from './assets/logo.png';
import './App.css'
import { apiService } from './api';

function Home() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('')
  const [field, setField] = useState('')
  const [numQuestions, setNumQuestions] = useState(5)
  const [showGrade, setShowGrade] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    apiService.getMessage()
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
      const { id, quiz } = await apiService.createQuiz({ 
        field, 
        topic, 
        numQuestions, 
        showGrade 
      })

      if (quiz && quiz.length > 0 && quiz[0].q.includes("Failed to generate quiz")) {
        alert('Failed to generate quiz. Please check your OpenAI API key and try again.')
        return
      }
      
      navigate(`/quiz/${id}`, { state: { quiz, showGrade } })
      
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
            <div className="brand-icon">
              <img src={logo} alt="QuraAI Logo" className="logo-image" />
            </div>
            
            <div className="brand-text">
              <div className="brand-name">QuraAI</div>
              <div className="brand-subtitle">For Students & Educators</div>
            </div>
          </div>

          <div className="hero-content">
            <h1 className="main-headline">
              Free AI-powered quiz generator to instantly create study materials
            </h1>
            
            <button className="cta-button">
              <span className="cta-icon">🚀</span>
              <span>Get Started For Free</span>
            </button>
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
                    <a href="/quiz/8b524373-0832-4721-9edd-ad5e3fc1ca4d" className="quiz-item">Python Fundamentals</a>
                    <a href="/quiz/16387131-e348-49b7-a427-825c7e8baf1b" className="quiz-item">Data Structures</a>
                    <a href="/quiz/64eca6f2-b943-4246-b8fc-0d65fd1ecb3f" className="quiz-item">Algorithms</a>
                  </div>
                </div>
                <div className="category">
                  <h3>History</h3>
                  <div className="quiz-items">
                    <a href="/quiz/efc41ded-9b58-49f9-b7b8-b09c6ca117dd" className="quiz-item">World War II</a>
                    <a href="/quiz/d963572b-f6f9-4114-bd48-58a5249b4226" className="quiz-item">Ancient Rome</a>
                    <a href="/quiz/59189e7a-1387-4cd6-94fd-c64529973ca1" className="quiz-item">Civil Rights</a>
                  </div>
                </div>
                <div className="category">
                  <h3>Science</h3>
                  <div className="quiz-items">
                    <a href="/quiz/c5f81706-c41c-4381-94e4-ae8167f626d1" className="quiz-item">Chemistry</a>
                    <a href="/quiz/5049dbb8-bcd5-4e42-8765-9d7806379439" className="quiz-item">Physics</a>
                    <a href="/quiz/f66d7646-1781-42cc-96c8-2a6496a58c71" className="quiz-item">Biology</a>
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

            <div className="form-group">
              <label htmlFor="numQuestions">Number of Questions: {numQuestions}</label>
              
              <div className="range-container">
                <input
                  type="range"
                  id="numQuestions"
                  min="1"
                  max="30"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="range-input"
                />

                <div className="range-labels">
                  <span>1</span>
                  <span>15</span>
                  <span>30</span>
                </div>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showGrade}
                  onChange={(e) => setShowGrade(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Show grade after submission</span>
              </label>
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
