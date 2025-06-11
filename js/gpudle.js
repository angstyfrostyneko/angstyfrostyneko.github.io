// gpuList is loaded from gpulist.js

let guessed = [];
let currentSelectionIndex = -1;

const input = document.getElementById("gpu-input");
const suggestionBox = document.getElementById("suggestions");

const today = new Date().toISOString().slice(0, 10);

function getDailyGpu(length, date) {
    const seed = hashString(date);
    const index = seed % length;
    return gpuList[index];
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

const answer = getDailyGpu(gpuList.length, today);

// Restore saved guesses
const savedDate = localStorage.getItem("gpudle-date");
const savedGuesses = JSON.parse(localStorage.getItem("gpudle-guesses") || "[]");

if (savedDate === today) {
    savedGuesses.forEach(name => submitGuess(name, true));
} else {
    localStorage.removeItem("gpudle-guesses");
}

input.addEventListener("input", () => {
    showSuggestions(input.value);
});

input.addEventListener("focus", () => {
    showSuggestions(input.value);
});

input.addEventListener("blur", () => {
    setTimeout(() => suggestionBox.innerHTML = "", 150);
});

input.addEventListener("keydown", (e) => {
    const items = suggestionBox.querySelectorAll("li");

    if (e.key === "ArrowDown") {
        currentSelectionIndex = (currentSelectionIndex + 1) % items.length;
        updateHighlight(items);
        e.preventDefault();
    } else if (e.key === "ArrowUp") {
        currentSelectionIndex = (currentSelectionIndex - 1 + items.length) % items.length;
        updateHighlight(items);
        e.preventDefault();
    } else if (e.key === "Enter") {
        const selected = suggestionBox.querySelector(".highlighted");
        if (selected) {
            submitGuess(selected.textContent);
        } else if (items.length > 0) {
            submitGuess(items[0].textContent);
        }
        e.preventDefault();
    } else {
        currentSelectionIndex = -1;
    }
});

function showSuggestions(query) {
    suggestionBox.innerHTML = "";
    currentSelectionIndex = -1;

    if (query === "") return;

    const filtered = gpuList.filter(gpu =>
        gpu.name.toLowerCase().includes(query.toLowerCase()) &&
        !guessed.includes(gpu.name)
    );

    filtered.forEach((gpu) => {
        const li = document.createElement("li");
        li.textContent = gpu.name;
        li.addEventListener("mousedown", (e) => {
            e.preventDefault();
            submitGuess(gpu.name);
            setTimeout(() => input.focus(), 0);
        });
        suggestionBox.appendChild(li);
    });
}

function updateHighlight(items) {
    items.forEach((li, index) => {
        if (index === currentSelectionIndex) {
            li.classList.add("highlighted");
        } else {
            li.classList.remove("highlighted");
        }
    });
}

function submitGuess(gpuName, skipAnimation = false) {
    if (guessed.includes(gpuName)) return;

    input.value = "";
    suggestionBox.innerHTML = "";
    guessed.push(gpuName);

    localStorage.setItem("gpudle-date", today);
    localStorage.setItem("gpudle-guesses", JSON.stringify(guessed));

    const guess = gpuList.find(gpu => gpu.name === gpuName);
    if (!guess) return;

    const fields = ["brand", "class", "generation", "tdp", "vram", "pciegen", "pcielanes", "year"];
    const guessData = fields.map(f => guess[f]);
    const answerData = fields.map(f => answer[f]);
    const correctness = guessData.map((val, i) => val === answerData[i]);

    addGuessRow(guessData, correctness, gpuName, skipAnimation);
}

function addGuessRow(data, correctness, name, skipAnimation = false) {
    const guesses = document.getElementById("guesses");
    const row = document.createElement("div");
    row.classList.add("guess-row");

    // Add name cell first
    const nameCell = document.createElement("div");
    nameCell.classList.add("guess-cell", "name-cell");
    nameCell.textContent = name;
    row.appendChild(nameCell);

    for (let i = 0; i < data.length; i++) {
        const cell = document.createElement("div");
        cell.classList.add("guess-cell");
        cell.classList.add(correctness[i] ? "correct" : "wrong");

        if (i === data.length - 1 && !correctness[i]) {
            const guessedYear = parseInt(data[i]);
            const correctYear = parseInt(answer.year);
            if (guessedYear < correctYear) {
                cell.textContent = `${data[i]} ⬆️`;
            } else if (guessedYear > correctYear) {
                cell.textContent = `${data[i]} ⬇️`;
            } else {
                cell.textContent = data[i];
            }
        } else {
            cell.textContent = data[i];
        }

        row.appendChild(cell);
    }
    guesses.prepend(row);

    const cells = row.querySelectorAll(".guess-cell");
    if (skipAnimation) {
        cells.forEach(cell => cell.classList.add("revealed"));
    } else {
        cells.forEach((cell, i) => {
            setTimeout(() => {
                cell.classList.add("revealed");
            }, i * 500);
        });
    }
}

const todayDate = new Date(today + "T00:00:00Z");
const startDate = new Date("2025-06-10T00:00:00Z");
const dayNumber = Math.floor((todayDate - startDate) / (1000 * 60 * 60 * 24));

const yesterdayDate = new Date(todayDate);
yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);
const yesterdayGpu = getDailyGpu(gpuList.length, yesterdayStr);

const stats = document.getElementById("stats");
stats.innerHTML = `Yesterday's GPU was the <strong>${yesterdayGpu.name}</strong><br>GPUdle number #<strong>${dayNumber}</strong>`;