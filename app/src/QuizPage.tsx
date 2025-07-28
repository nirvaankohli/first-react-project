import { useEffect, useState } from "react";

type Question = {

  q: string;

  choices: string[];

  answer: number;

};

export default function QuizPage() {

  const [quiz, setQuiz] = useState<Question[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const fetchQuiz = async () => {

      try {
        
        const res = await fetch("http://127.0.0.1:5000/api/quiz");
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        setQuiz(data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load quiz");
      }
    };
    fetchQuiz();
  }, []);

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
                    <input type="radio" name={`q${idx}`} value={cidx} />
                    <span>{choice}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 