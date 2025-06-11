// gpuList is loaded from gpulist.js

let guessed = [];
let currentSelectionIndex = -1;

const input = document.getElementById("gpu-input");
const suggestionBox = document.getElementById("suggestions");

function getDailyGpu(gpuList) {
    const today = new Date().toISOString().slice(0, 10);
    const seed = hashString(today);
    const index = seed % gpuList.length;
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

const answer = getDailyGpu(gpuList);

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

function submitGuess(gpuName) {
    input.value = "";
    suggestionBox.innerHTML = "";

    if (guessed.includes(gpuName)) return;
    guessed.push(gpuName);

    const guess = gpuList.find(gpu => gpu.name === gpuName);
    if (!guess) return;

    const fields = ["brand", "generation", "tdp", "vram", "pcie", "year"];
    const guessData = fields.map(f => guess[f]);
    const answerData = fields.map(f => answer[f]);
    const correctness = guessData.map((val, i) => val === answerData[i]);

    addGuessRow(guessData, correctness, gpuName);

    // if (correctness.every(Boolean)) {
    //     alert("Correct GPU guessed!");
    // }
}

function addGuessRow(data, correctness, name) {
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
    cells.forEach((cell, i) => {
        setTimeout(() => {
            cell.classList.add("revealed");
        }, i * 500);
    });
}
