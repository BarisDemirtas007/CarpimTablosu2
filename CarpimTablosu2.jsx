import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import correctSoundFile from "@/assets/sounds/correct.mp3";
import wrongSoundFile from "@/assets/sounds/wrong.mp3";
import Image from "next/image";

const MULT_TABLES = [2, 3];

const generateQuestion = (table) => {
  const num = Math.floor(Math.random() * 10);
  return { table, num, answer: table * num };
};

const getBadge = (score) => {
  if (score >= 150) return "🏅 Altın Rozet";
  if (score >= 100) return "🥈 Gümüş Rozet";
  if (score >= 50) return "🥉 Bronz Rozet";
  return null;
};

export default function CarpimTablosu() {
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const [question, setQuestion] = useState(generateQuestion(MULT_TABLES[0]));
  const [input, setInput] = useState("");
  const [score, setScore] = useState(() => Number(localStorage.getItem("score")) || 0);
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem("progress");
    return saved ? JSON.parse(saved) : { 2: 0, 3: 0 };
  });
  const [feedback, setFeedback] = useState(null);
  const [imageFeedback, setImageFeedback] = useState(null);
  const [readAloud, setReadAloud] = useState(false);

  const playSound = (isCorrect) => {
    const audio = new Audio(isCorrect ? correctSoundFile : wrongSoundFile);
    audio.play();
  };

  const speakQuestion = () => {
    if (!readAloud) return;
    const utterance = new SpeechSynthesisUtterance(`${question.table} çarpı ${question.num} kaç eder?`);
    utterance.lang = "tr-TR";
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    speakQuestion();
  }, [question, readAloud]);

  useEffect(() => {
    localStorage.setItem("score", score);
    localStorage.setItem("progress", JSON.stringify(progress));
  }, [score, progress]);

  const handleAnswer = () => {
    const correct = parseInt(input) === question.answer;
    playSound(correct);

    if (correct) {
      const newScore = score + 10;
      setScore(newScore);
      const newProgress = {
        ...progress,
        [question.table]: progress[question.table] + 1,
      };
      setProgress(newProgress);
      setFeedback("Doğru! 🎉");
      setImageFeedback("/images/happy.png");
      if (newProgress[question.table] >= 10 && currentTableIndex < MULT_TABLES.length - 1) {
        setCurrentTableIndex(currentTableIndex + 1);
        setQuestion(generateQuestion(MULT_TABLES[currentTableIndex + 1]));
      } else {
        setQuestion(generateQuestion(question.table));
      }
    } else {
      setFeedback("Yanlış! Tekrar dene. ❌");
      setImageFeedback("/images/sad.png");
    }
    setInput("");
  };

  const badge = getBadge(score);

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <Card className="bg-yellow-100 text-center shadow-xl rounded-xl">
        <CardContent>
          <h2 className="text-2xl font-bold mb-2">Çarpım Tablosu: {question.table}</h2>
          <p className="text-lg">{question.table} × {question.num} = ?</p>
          <input
            className="mt-3 p-2 border rounded w-full max-w-[120px] text-center text-lg"
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="mt-3 flex flex-col sm:flex-row justify-center gap-2">
            <Button onClick={handleAnswer}>Cevapla</Button>
            <Button variant="outline" onClick={() => setReadAloud(!readAloud)}>
              {readAloud ? "🔇 Sesi Kapat" : "🔊 Sesi Aç"}
            </Button>
          </div>
          {feedback && <p className="mt-2 text-lg">{feedback}</p>}
          {imageFeedback && (
            <div className="mt-3 flex justify-center">
              <Image src={imageFeedback} alt="feedback" width={80} height={80} />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <h3 className="text-xl font-semibold">İstatistikler</h3>
        {MULT_TABLES.map((t) => (
          <div key={t} className="mt-2">
            <p>{t}'ler: {progress[t]} / 10</p>
            <Progress value={(progress[t] / 10) * 100} />
          </div>
        ))}
        <p className="mt-4 font-bold">Puan: {score}</p>
        {badge && <p className="text-lg mt-2">🎖️ Kazanılan Rozet: <strong>{badge}</strong></p>}
      </div>

      <div className="mt-8 p-4 bg-white rounded-xl shadow">
        <h3 className="text-lg font-bold mb-2">👨‍👩‍👧 Ebeveyn Paneli</h3>
        <ul className="text-left text-sm">
          <li>📊 2'ler tamamlanma: {progress[2]}/10</li>
          <li>📊 3'ler tamamlanma: {progress[3]}/10</li>
          <li>⭐ Toplam Puan: {score}</li>
          <li>🎖️ Rozet: {badge || "Henüz kazanılmadı"}</li>
        </ul>
      </div>

      <div className="mt-6 text-sm text-center text-gray-500">
        ⏰ Her gün 10 soru çözmeyi unutma! Yeni rozetler seni bekliyor!
      </div>
    </div>
  );
}
