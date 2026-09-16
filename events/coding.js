const questions = [
    {
        question: "💻 Which Termux command shows your current directory?",
        answers: ["pwd"],
        xp: 15,
        difficulty: "EASY"
    },
    {
        question: "💻 Which command lists files and folders?",
        answers: ["ls"],
        xp: 15,
        difficulty: "EASY"
    },
    {
        question: "💻 Which command creates a new directory?",
        answers: ["mkdir"],
        xp: 15,
        difficulty: "EASY"
    },
    {
        question: "💻 Which command creates an empty file?",
        answers: ["touch"],
        xp: 15,
        difficulty: "EASY"
    },
    {
        question: "💻 Which command displays text in the terminal?",
        answers: ["echo"],
        xp: 15,
        difficulty: "EASY"
    },
    {
        question: "💻 Which command displays the contents of a text file?",
        answers: ["cat"],
        xp: 15,
        difficulty: "EASY"
    },
    {
        question: "💻 Which command changes your current directory?",
        answers: ["cd"],
        xp: 15,
        difficulty: "EASY"
    },
    {
        question: "💻 Which command shows the installed Node.js version?",
        answers: ["node -v", "node --version"],
        xp: 30,
        difficulty: "MEDIUM"
    },
    {
        question: "💻 Which command shows the installed npm version?",
        answers: ["npm -v", "npm --version"],
        xp: 30,
        difficulty: "MEDIUM"
    },
    {
        question: "💻 Which Git command shows the current repository status?",
        answers: ["git status"],
        xp: 30,
        difficulty: "MEDIUM"
    }
];

function normalizeAnswer(answer) {
    return answer
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function getRandomQuestion() {
    return questions[
        Math.floor(Math.random() * questions.length)
    ];
}

function isCorrectAnswer(answer, question) {
    const normalized = normalizeAnswer(answer);

    return question.answers.some(
        correct => normalizeAnswer(correct) === normalized
    );
}

module.exports = {
    questions,
    getRandomQuestion,
    isCorrectAnswer
};
