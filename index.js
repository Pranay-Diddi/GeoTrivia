import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from 'dotenv';
dotenv.config();

const dbPassword = process.env.DB_PASSWORD;

const app = express();
const port = 3000;

// Database connection setup
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: dbPassword,
  port: 7000,  // Make sure this is your PostgreSQL port
});
let quiz = [];
(async () => {
  try {
    await db.connect();
    console.log("Connected to the database.");

    // Fetch quiz data
    const result = await db.query("SELECT * FROM world");
    quiz = result.rows;

    // Close the connection after fetching the data
    await db.end();
    console.log("Quiz data fetched and database connection closed.");
  } catch (err) {
    console.error("Error fetching data from the database:", err.stack);
  }
})();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'));


let totalCorrect = 0;
let currentQuestion = {};

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  res.render("index.ejs", { question: currentQuestion });
});

// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;

  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    isCorrect = true;
  }

  nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

// Function to pick the next question
async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
}

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
