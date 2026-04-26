import init, {
    generate_database,
    check_answer,
    get_yesterdays_gpu,
    get_results,
    get_gpudle_count
} from "../gpudle/wasm/pkg/wasm.js";

class Game {
    textInputBox;
    selectionBox;
    resultsBox;

    yesterdaysGPU;

    _keydownAction(event) {
        if (event.key === "ArrowDown") {
            // TODO: go down one on the flexbox
        }
        else if (event.key === "ArrowUp") {
            // TODO: go up one on the flexbox
        }
        else if (event.key === "Enter") {
            // TODO: select current one on the flexbox
        }
    }

    _selectionClick(event, id) {
        event.preventDefault();
        this.submitGuess(id);
        this.textInputBox.value = ""
        setTimeout(() => this.selectionBox.textContent = "", 150);
    }

    submitGuess(id) {
        // 0 for no emoji, 1 for too low, 2 for too high, 3 for correct
        const answer = check_answer(id)
        console.log(answer)

    }

    updateResults(query) {
        const results = get_results(query);

        this.selectionBox.textContent = ""

        results.forEach(element => {
            const entry = document.createElement("div")
            const entryContent = document.createTextNode(element.name);
            entry.appendChild(entryContent)
            entry.addEventListener("click", (e) => this._selectionClick(e, element.id))
            this.selectionBox.appendChild(entry)
        });
    }

    configureInput() {
        this.textInputBox = document.getElementById("gpu-input");
        this.selectionBox = document.getElementById("selection-box");

        this.textInputBox.disabled = false
        this.textInputBox.value = ""

        // Textbox contents change
        this.textInputBox.addEventListener("input", () => {
            const query = this.textInputBox.value
            this.updateResults(query)
        });

        // Textbox gets selected
        this.textInputBox.addEventListener("focus", () => {
            // showSuggestions(input.value);
        });

        // Textbox gets unselected
        this.textInputBox.addEventListener("blur", () => {
            setTimeout(() => this.selectionBox.textContent = "", 150);
        });

        this.textInputBox.addEventListener("keydown", (e) => this._keydownAction(e));
    }

    updatePageStats() {
        const nameText = document.getElementById("stats-gpu-name");
        const dateText = document.getElementById("stats-day-number");

        nameText.textContent = this.yesterdaysGPU.name;
        dateText.textContent = get_gpudle_count();
    }

    loadProgress() {

    }

    saveProgress() {

    }

    async initialize() {
        await init()
        await generate_database();

        this.yesterdaysGPU = get_yesterdays_gpu();

        this.configureInput();
        this.updatePageStats();

        // debug zone
        console.log(this.yesterdaysGPU)
        // this._updateResults("6700")
    }
}

let app = new Game();
app.initialize();