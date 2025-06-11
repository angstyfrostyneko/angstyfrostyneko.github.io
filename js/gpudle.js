const gpuList = [
    "NVIDIA RTX 3080", "NVIDIA RTX 3060", "AMD RX 6800 XT",
    "NVIDIA GTX 1080", "AMD RX 5700", "Intel Arc A770"
];

let guessed = [];

const input = document.getElementById("gpu-input");
const suggestionBox = document.getElementById("suggestions");

input.addEventListener("input", () => {
    const query = input.value.toLowerCase();
    suggestionBox.innerHTML = "";

    if (query === "") return;

    const filtered = gpuList
        .filter(gpu => gpu.toLowerCase().includes(query) && !guessed.includes(gpu));

    filtered.forEach(gpu => {
        const li = document.createElement("li");
        li.textContent = gpu;
        li.addEventListener("click", () => {
            submitGuess(gpu);
        });
        suggestionBox.appendChild(li);
    });
});

function handleInputKey(e) {
    const suggestions = suggestionBox.querySelectorAll("li");
    if (e.key === "Enter" && suggestions.length > 0) {
        submitGuess(suggestions[0].textContent);
    }
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
