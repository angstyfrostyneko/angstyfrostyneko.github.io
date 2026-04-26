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
    resultsRow;
    alreadyGuessed = [];

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

    updateCell(correctness, content, index) {
        const cell = document.createElement("div");
        const icons = ["", " ⬆️", " ⬇️", ""];

        switch (index) {
            case 3: // TDP 
                if (content !== "Varies") content += "W"
                break;
            case 5: // VRAM
                if (content === "Varies" || content === "N/A") break;

                let value = parseFloat(content)
                if (value < 1) {
                    value *= 1000;
                    if (value < 1) {
                        value *= 1000
                        content = value + "KB"
                    }
                    else content = value + "MB"
                }
                else content += "GB"
                break;
            default:
                break;
        }

        cell.classList.add("guess-cell");
        cell.classList.add(correctness === 3 ? "correct" : "wrong");

        const textWrapper = document.createElement("span");
        textWrapper.classList.add("cell-text");
        textWrapper.textContent = content + icons[correctness];

        cell.appendChild(textWrapper);
        return cell;
    }

    submitGuess(id) {
        const answer = check_answer(id);
        this.alreadyGuessed.push(id)
        // console.log(answer);

        const row = document.createElement("div");
        row.classList.add("guess-row");

        const nameCell = document.createElement("div");
        nameCell.classList.add("guess-cell", "name-cell", "revealed");

        const textWrapper = document.createElement("span");
        textWrapper.classList.add("cell-text");
        textWrapper.textContent = answer[0][1];
        nameCell.appendChild(textWrapper)

        row.prepend(nameCell);

        for (let i = 1; i < answer.length; i++) {
            const cell = this.updateCell(answer[i][0], answer[i][1], i);
            setTimeout(() => {
                cell.classList.add("revealed");
            }, i * 500)

            row.appendChild(cell);
            // console.log(cell);
        }

        this.resultsRow.prepend(row);
    }

    updateResults(query) {
        const results = get_results(query, this.alreadyGuessed);

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
        this.resultsRow = document.getElementById("results-row")

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
        // console.log(this.yesterdaysGPU)
        // this._updateResults("6700")
    }
}

let app = new Game();
app.initialize();