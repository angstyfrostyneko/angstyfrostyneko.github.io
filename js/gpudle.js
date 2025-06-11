const gpuList = [
    "NVIDIA RTX 3080", "NVIDIA RTX 3060", "AMD RX 6800 XT",
    "NVIDIA GTX 1080", "AMD RX 5700", "Intel Arc A770"
];

let guessed = [];
let currentSelectionIndex = -1;

const input = document.getElementById("gpu-input");
const suggestionBox = document.getElementById("suggestions");

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
        gpu.toLowerCase().includes(query.toLowerCase()) &&
        !guessed.includes(gpu)
    );

    filtered.forEach((gpu, index) => {
        const li = document.createElement("li");
        li.textContent = gpu;
        li.addEventListener("mousedown", (e) => {
            e.preventDefault();
            submitGuess(gpu);
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

    const exampleGuess = ["NVIDIA", "3000", "220W", "8GB", "x16", "2020"];
    const correctness = [true, false, true, false, true, false];
    addGuessRow(exampleGuess, correctness);
}

function addGuessRow(data, correctness) {
    const guesses = document.getElementById("guesses");
    const row = document.createElement("div");
    row.classList.add("guess-row");

    for (let i = 0; i < data.length; i++) {
        const cell = document.createElement("div");
        cell.classList.add("guess-cell");
        cell.classList.add(correctness[i] ? "correct" : "wrong");
        cell.textContent = data[i];
        row.appendChild(cell);
    }

    guesses.appendChild(row);
}
