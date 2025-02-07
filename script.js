class Game {
    constructor() {
        this.recipes = [];
        this.roundCards = [];
        this.currentRound = 1;
        this.playerCount = 2;
        this.totalRounds = 3;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Gestione caricamento manuale
        document.getElementById('csvFileInput').addEventListener('change', (event) => this.handleFileUpload(event, "recipes"));
        document.getElementById('roundCsvFileInput').addEventListener('change', (event) => this.handleFileUpload(event, "roundCards"));

        // Pulsanti per caricare CSV ufficiali
        document.getElementById('loadDefaultRecipes').addEventListener('click', () => this.loadCSVFile("4Dadi in Padella - RECIPES CARDS - OK.csv", "recipes"));
        document.getElementById('loadDefaultRoundCards').addEventListener('click', () => this.loadCSVFile("4 Dadi Round Cards - OK.csv", "roundCards"));

        // Avvio del gioco
        document.getElementById('startGameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('kitchenBell').addEventListener('click', () => this.handleBellRing());
    }
    
    handleFileUpload(event, type) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    this[type] = this.parseCSV(e.target.result);
                    this.checkFilesLoaded();
                    this.showNotification(`${type === "recipes" ? "Ricette" : "Carte Round"} caricate con successo!`);
                } catch (error) {
                    this.showNotification("Errore nel caricamento: " + error.message);
                }
            };
            reader.readAsText(file);
        }
    }


    loadCSVFile(filePath, type) {
        fetch(filePath)
            .then(response => response.text())
            .then(csvText => {
                this[type] = this.parseCSV(csvText);
                this.checkFilesLoaded();
                this.showNotification(`${type === "recipes" ? "Ricette ufficiali" : "Carte Round ufficiali"} caricate!`);
            })
            .catch(error => console.error("Errore nel caricamento CSV:", error));
    }


    parseCSV(csvText) {
        const lines = csvText.split("\n").slice(1); // Salta l'intestazione
        return lines.map(line => {
            const values = line.split(",");
            if (values.length < 3) return null; // Evita righe incomplete
            return {
                name: values[0].trim(),
                difficulty: values[1].trim(),
                category: values[2].trim(),
                points: values.length > 3 ? parseInt(values[3]) : 0,
                combination: values.length > 4 ? values[4].trim() : ""
            };
        }).filter(Boolean);
    }

    checkFilesLoaded() {
        if (this.recipes.length && this.roundCards.length) {
            document.getElementById("startGameBtn").disabled = false;
        }
    }

    startGame() {
        this.playerCount = parseInt(document.getElementById("playerCount").value);
        this.totalRounds = parseInt(document.getElementById("roundCount").value);
        document.getElementById("welcomeScreen").style.display = "none";
        document.getElementById("gameScreen").style.display = "block";
        this.renderGame();
    }

    renderGame() {
        document.getElementById('roundNumber').textContent = `${this.currentRound}/${this.totalRounds}`;
        this.renderRoundCard();
    }

    renderRoundCard() {
        const roundCardContainer = document.getElementById('roundCardContainer');
        const card = this.roundCards[Math.floor(Math.random() * this.roundCards.length)];
        roundCardContainer.innerHTML = `<div class="round-card">${card.name} - ${card.combination}</div>`;
    }

    handleBellRing() {
        const bell = document.getElementById('kitchenBell');
        bell.classList.add('ringing');
        document.getElementById('bellSound').play();
        setTimeout(() => bell.classList.remove('ringing'), 500);
    }

    showNotification(message) {
        const notification = document.getElementById("notification");
        notification.textContent = message;
        notification.style.display = "block";
        setTimeout(() => {
            notification.style.display = "none";
        }, 3000);
    }
}

const game = new Game();
