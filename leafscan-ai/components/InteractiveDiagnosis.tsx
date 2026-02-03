'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, RefreshCw, Trophy, AlertTriangle, Loader2 } from 'lucide-react'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Mock Data Pool (In production, this would come from a database)
const SCENARIOS = [
    {
        id: '1',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Alternaria_solani_01.jpg/640px-Alternaria_solani_01.jpg',
        correctDiagnosis: 'Early Blight',
        context: 'Found on lower leaves of tomato plant. High humidity last week.',
        options: ['Late Blight', 'Early Blight', 'Septoria Leaf Spot', 'Magnesium Deficiency']
    },
    {
        id: '2',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Phytophthora_infestans_potato_leaf.jpg/640px-Phytophthora_infestans_potato_leaf.jpg',
        correctDiagnosis: 'Late Blight',
        context: 'Rapidly spreading dark lesions on leaves. Cool, wet weather.',
        options: ['Late Blight', 'Gray Mold', 'Bacterial Spot', 'Sunscald']
    }
]

export default function InteractiveDiagnosis() {
    const [activeScenario, setActiveScenario] = useState(0)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [feedback, setFeedback] = useState<{ correct: boolean, explanation: string } | null>(null)
    const [score, setScore] = useState(0)
    const [loading, setLoading] = useState(false)

    const handleGuess = async (option: string) => {
        if (loading || feedback) return
        setSelectedOption(option)
        setLoading(true)

        const isCorrect = option === SCENARIOS[activeScenario].correctDiagnosis

        // Simulate AI Tutor Feedback
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                body: JSON.stringify({
                    message: `Explain why ${option} is ${isCorrect ? 'correct' : 'incorrect'} for a tomato plant showing symptoms of ${SCENARIOS[activeScenario].correctDiagnosis}. Context: ${SCENARIOS[activeScenario].context}. Keep it brief and educational.`
                })
            })
            const data = await res.json()

            setFeedback({
                correct: isCorrect,
                explanation: data.text || (isCorrect ? "Correct! This matches the visual symptoms." : "Incorrect. Look closely at the lesion patterns.")
            })

            if (isCorrect) setScore(s => s + 1)
        } catch (e) {
            setFeedback({
                correct: isCorrect,
                explanation: isCorrect ? "Correct! Good eye." : "Incorrect. Try again next time."
            })
        } finally {
            setLoading(false)
        }
    }

    const nextScenario = () => {
        setSelectedOption(null)
        setFeedback(null)
        if (activeScenario < SCENARIOS.length - 1) {
            setActiveScenario(s => s + 1)
        } else {
            // End of quiz
            setActiveScenario(-1)
        }
    }

    const resetQuiz = () => {
        setActiveScenario(0)
        setScore(0)
        setSelectedOption(null)
        setFeedback(null)
    }

    if (activeScenario === -1) {
        return (
            <div className="bg-white rounded-3xl p-8 text-center shadow-xl border border-apeel-green/10">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-3xl font-serif font-bold text-apeel-green mb-2">Training Complete!</h2>
                <p className="text-gray-500 mb-6">You scored {score} out of {SCENARIOS.length}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={resetQuiz} className="btn-primary bg-apeel-green text-white px-6 py-3 rounded-full flex items-center gap-2 font-bold">
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </button>
                </div>
            </div>
        )
    }

    const scenario = SCENARIOS[activeScenario]

    return (
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-apeel-green/10 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2">
                {/* Image Side */}
                <div className="relative bg-gray-100 min-h-[300px] md:min-h-[400px]">
                    <img
                        src={scenario.image}
                        alt="Diagnosis Scenario"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Case {activeScenario + 1} of {SCENARIOS.length}
                    </div>
                </div>

                {/* Interaction Side */}
                <div className="p-8 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Diagnosis Challenge</h3>
                        <p className="text-sm text-gray-600 mb-6 italic border-l-2 border-apeel-green/30 pl-3">
                            &quot;{scenario.context}&quot;
                        </p>

                        <div className="space-y-3">
                            {scenario.options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleGuess(option)}
                                    disabled={loading || !!feedback}
                                    className={`w-full p-4 rounded-xl text-left font-bold transition-all flex justify-between items-center bg-gray-50 hover:bg-gray-100 text-gray-700 border-2 border-transparent ${selectedOption === option ? (feedback?.correct ? 'bg-green-100 !border-green-500 !text-green-800' : 'bg-red-50 !border-red-400 !text-red-800') : ''
                                        }`}
                                >
                                    {option}
                                    {selectedOption === option && loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {selectedOption === option && feedback?.correct && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                                    {selectedOption === option && !loading && !feedback?.correct && feedback && <XCircle className="w-5 h-5 text-red-500" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence>
                        {feedback && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-6 p-4 rounded-xl border ${feedback.correct ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}
                            >
                                <div className="flex items-start gap-3">
                                    {feedback.correct ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
                                    <div>
                                        <p className={`text-sm font-bold mb-1 ${feedback.correct ? 'text-green-800' : 'text-amber-800'}`}>
                                            {feedback.correct ? 'Excellent Diagnosis!' : 'Not quite right.'}
                                        </p>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            {feedback.explanation}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={nextScenario}
                                    className="mt-4 w-full bg-apeel-black text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                                >
                                    Continue <ArrowRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
