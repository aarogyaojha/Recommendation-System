import React, { useState, useEffect, useRef } from "react";
import "../assets/styles.css"; // Tailwind CSS will be used for styles

const WatchParty = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const hasWelcomedRef = useRef(false); // Ref to track if the welcome message has been spoken

  const questions = [
    "What is your name?",
    "What is your favorite movie genre?",
    "Who is your favorite actor or actress?",
    "Do you prefer watching alone or with a group?",
  ];

  const acknowledgments = [
    "Ah! I get you totally.",
    "Oh, that's interesting!",
    "Got it, thank you for sharing!",
    "Okay, understood!",
  ];

  const sendResponsesToApi = async (responses) => {
    try {
      const response = await fetch("http://localhost:5000/api/save-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });

      if (!response.ok) {
        throw new Error("Failed to save responses.");
      }

      const data = await response.json();
      console.log(data.message); // Success message
    } catch (error) {
      console.error("Error sending responses:", error);
    }
  };

  const speak = (text, callback) => {
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = window.speechSynthesis.getVoices().find((voice) =>
      voice.name.includes("Male")
    );
    utterance.onend = () => {
      setIsSpeaking(false);
      if (callback) callback();
    };
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      setAnswers((prev) => [...prev, transcript]);

      setIsListening(false);

      const acknowledgment =
        acknowledgments[
          Math.min(currentQuestionIndex, acknowledgments.length - 1)
        ];

      // Speak acknowledgment and decide next action
      speak(acknowledgment, () => {
        if (currentQuestionIndex < questions.length - 1) {
          // Move to the next question
          setTimeout(() => {
            setCurrentQuestionIndex((prev) => prev + 1);
          }, 1000);
        } else {
          // Ensure the last answer is processed before sending to the API
          setTimeout(() => {
            const allResponses = questions.map((question, index) => ({
              question,
              answer: [...answers, transcript][index] || "No response",
            }));
            sendResponsesToApi(allResponses);
          }, 500); // Slight delay to ensure state update
        }
      });
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  useEffect(() => {
    // Ensure the welcome message is spoken only once
    if (!hasWelcomedRef.current) {
      hasWelcomedRef.current = true; // Mark the welcome message as spoken
      const welcomeScript =
        "Welcome to the Watch Party mode! Let's personalize your experience.";
      speak(welcomeScript, () => {
        setCurrentQuestionIndex(0);
      });
    }
  }, []);

  useEffect(() => {
    if (currentQuestionIndex >= 0 && currentQuestionIndex < questions.length) {
      speak(questions[currentQuestionIndex], () => {
        setTimeout(() => startListening(), 200);
      });
    }
  }, [currentQuestionIndex]);

  return (
    <div className="watch-party-container bg-black text-white p-8 min-h-screen">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-4">Watch Party Mode</h1>
      </div>
      <div className="questions-container mb-6 text-center">
        {currentQuestionIndex >= 0 && currentQuestionIndex < questions.length && (
          <p className="text-lg font-semibold">
            <span className="text-blue-400">Question {currentQuestionIndex + 1}:</span> {questions[currentQuestionIndex]}
          </p>
        )}
      </div>

      <div className="answer-container mb-6">
        <div className="flex justify-center items-center h-40 mt-[8rem]">
          {isSpeaking && <img src="speech.gif" alt="Speaking" className="h-90 w-90" />}
        </div>
        <div>
          <p className="text-lg mt-[9rem] ml-[73rem]">
            Listening: <span className="font-bold">{isListening ? "Yes" : "No"}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WatchParty;