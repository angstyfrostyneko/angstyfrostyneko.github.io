import init, {
    generate_database,
    get_todays_gpu,
    get_yesterdays_gpu,
    get_results,
    get_gpudle_count
} from "../gpudle/wasm/pkg/wasm.js";

class Game {
    textInputBox;
    selectionBox;
    resultsBox;

    dailyGPU;
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

    _selectionClick(event) {
        event.preventDefault();
        submitGuess(gpu.name);
        setTimeout(() => input.focus(), 0);
    }

    updateResults(query) {
        const results = get_results(query);

        this.selectionBox.textContent = ""

        results.forEach(element => {
            const entry = document.createElement("div")
            const entryContent = document.createTextNode(element.productName);
            entry.appendChild(entryContent)
            entry.addEventListener("click", (e) => this._selectionClick(e))
            this.selectionBox.appendChild(entry)
        });
    }

    configureInput() {
        this.textInputBox = document.getElementById("gpu-input");
        this.selectionBox = document.getElementById("selection-box");

        this.textInputBox.value = ""

        // Textbox contents change
        this.textInputBox.addEventListener("input", () => {
            // TODO: replace with wasm
            const query = this.textInputBox.value
            this.updateResults(query)
        });

        // Textbox gets selected
        this.textInputBox.addEventListener("focus", () => {
            // showSuggestions(input.value);
            // TODO: replace withw wasm
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

        nameText.textContent = this.yesterdaysGPU.productName;
        dateText.textContent = get_gpudle_count();
    }

    loadProgress() {

    }

    saveProgress() {

    }

    async initialize() {
        await init()
        generate_database();

        this.dailyGPU = get_todays_gpu();
        this.yesterdaysGPU = get_yesterdays_gpu();

        this.configureInput();
        this.updatePageStats();

        // debug zone
        console.log(this.dailyGPU.productName)
        // this._updateResults("6700")
    }
}

let app = new Game();
app.initialize();