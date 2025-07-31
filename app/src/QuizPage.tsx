import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { apiService } from './api';

type Question = {
  q: string;
  choices: string[];
  answer: number;
};

type Correction = {

  question: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  choices: string[];
  
};

type QuizResult = {
  score: number;
  total: number;
  percentage: number;
  corrections: Correction[];
};

export default function QuizPage() {
  const { state } = useLocation();
  const { id } = useParams();
  const [quiz, setQuiz] = useState<Question[] | null>(state?.quiz || null);
  const [showGrade, setShowGrade] = useState<boolean>(state?.showGrade || false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quiz) return;
    
    const fetchQuiz = async () => {
      try {
        const data = await apiService.fetchQuiz(id!);
        setQuiz(data);
        setAnswers(new Array(data.length).fill(-1)); 
      } catch (err: any) {
        console.error(err);
        setError("Failed to load quiz");
      }
    };
    fetchQuiz();
  }, [id, quiz]);

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.some(answer => answer === -1)) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await apiService.submitAnswers(id!, answers);
      
      if (showGrade) {
        setResult(data);
      }
      
      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError("Failed to submit answers");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = quiz && answers.every(answer => answer !== -1);

  if (error) return (
    <div className="quiz-page">
      <div className="quiz-container">
        <div className="error-message">{error}</div>
      </div>
    </div>
  );

  if (!quiz)
    return (
      <div className="quiz-page">
        <div className="quiz-container">
          <div className="quiz-header">
            <h1>Loading Quiz...</h1>
            <p>Generating your personalized quiz</p>
          </div>
          <div className="quiz-content">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="loading-card loading-skeleton" />
            ))}
          </div>
        </div>
      </div>
    );

  if (isSubmitted && !showGrade) {
    return (
      <div className="quiz-page">
        <div className="quiz-container">
          <div className="quiz-header">
            <h1>Quiz Submitted ✔️</h1>
            <p>Thank you for completing the quiz!</p>
          </div>
          <div className="quiz-content">
            <div className="submission-success">
              <p>Your answers have been recorded successfully.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted && showGrade && result) {
    return (
      <div className="quiz-page">
        <div className="quiz-container">
          <div className="quiz-header">
            <h1>Quiz Results</h1>
            <p>Your score: {result.score}/{result.total} ({result.percentage.toFixed(1)}%)</p>
          </div>
          <div className="quiz-content">
            <div className="results-summary">
              <div className="score-display">
                <h2>Final Score</h2>
                <div className="score-circle">
                  <span className="score-number">{result.percentage.toFixed(0)}%</span>
                </div>
                <p>{result.score} out of {result.total} correct</p>
              </div>
            </div>
            
            <div className="corrections-section">
              <h3>Question Review</h3>
              {result.corrections.map((correction, idx) => (
                <div key={idx} className={`correction-card ${correction.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="correction-header">
                    <span className="question-number">{idx + 1}</span>
                    <span className={`status-badge ${correction.isCorrect ? 'correct' : 'incorrect'}`}>
                      {correction.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  <div className="question-text">{correction.question}</div>
                  <div className="answer-review">
                    <div className="answer-item">
                      <span className="label">Your answer:</span>
                      <span className={`answer ${correction.isCorrect ? 'correct' : 'incorrect'}`}>
                        {correction.choices[correction.userAnswer]}
                      </span>
                    </div>
                    {!correction.isCorrect && (
                      <div className="answer-item">
                        <span className="label">Correct answer:</span>
                        <span className="answer correct">
                          {correction.choices[correction.correctAnswer]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <div className="quiz-header">
          <h1>Your Quiz</h1>
          <p>Test your knowledge with these questions</p>
        </div>
        <div className="quiz-content">
          {quiz.map((q, idx) => (
            <div key={idx} className="question-card">
              <div className="question-number">{idx + 1}</div>
              <div className="question-text">{q.q}</div>
              <div className="choices-list">
                {q.choices.map((choice, cidx) => (
                  <label key={cidx} className="choice-item">
                    <input 
                      type="radio" 
                      name={`q${idx}`} 
                      value={cidx}
                      checked={answers[idx] === cidx}
                      onChange={() => handleAnswerChange(idx, cidx)}
                    />
                    <span>{choice}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          
          <div className="submit-section">
            <button 
              className="submit-quiz-button"
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
            {!canSubmit && (
              <p className="submit-hint">Please answer all questions to submit</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 