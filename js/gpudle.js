import init, {
    generate_database,
    get_todays_gpu,
    get_yesterdays_gpu,
    get_results,
    get_gpudle_count
} from "../gpudle/wasm/pkg/wasm.js";


class Game {
    // TODO: keep the text input box for typing into
    // but make the selection a flexbox appear on top
    selectionBox;
    resultsBox;

    dailyGPU;
    yesterdaysGPU;

    _keydownAction(event) {
        if (event.key === "ArrowDown") {
            // TODO: go down one on the flexbox
        }
        else if (event.key === "ArrowUp") {
            // TODO: go up one
        }
        else if (event.key === "Enter") {
            // TODO: select current one
        }
    }

    _updateResults(searchStr) {
        const results = get_results;
        // TODO: update flexbox
    }

    configureInput() {
        this.selectionBox = document.getElementById("gpu-input");

        // Textbox contents change
        this.selectionBox.addEventListener("input", () => {
            // showSuggestions(input.value);
            // TODO: replace with wasm
        });

        // Textbox gets selected
        this.selectionBox.addEventListener("focus", () => {
            // showSuggestions(input.value);
            // TODO: replace withw wasm
        });

        // Textbox gets unselected
        this.selectionBox.addEventListener("blur", () => {
            setTimeout(() => suggestionBox.innerHTML = "", 150);
        });

        this.selectionBox.addEventListener("keydown", (e) => this._keydownAction(e));
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
    }
}

let app = new Game();
app.initialize();