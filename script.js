class Game {
    constructor() {
        this.recipes =;
        this.players =;
        this.market =;
        this.currentRound = 1;
        this.deck =;
        this.playerCount = 2;
        this.totalRounds = 3;
        this.activePlayer = 0;
        this.bellSound = document.getElementById('bellSound');
        this.roundCards =;
        this.currentRoundCard = null;
        this.recipesLoaded = false;
        this.roundCardsLoaded = false;
        this.setupEventListeners();
    }

    calculateBonuses(player) {
        const categoryCounts = {
            'Appetizer': 0,
            'Street Food': 0,
            'Primo': 0,
            'Secondo': 0,
            'Dessert': 0,
            'Holiday Recipe': 0
        };
        player.completedRecipes.forEach(recipe => {
            categoryCounts[recipe.category]++;
        });
        let bonusPoints = 0;
        let bonusDetails = '';
        const addBonus = (count, points, emoji) => {
            const bonus = Math.floor(count / 3) * points;
            if (bonus > 0) {
                bonusPoints += bonus;
                bonusDetails += ` +<span class="math-inline">\{emoji\}</span>{bonus}`;
            }
        };
        addBonus(categoryCounts['Appetizer'], 5, '🥟');
        addBonus(categoryCounts['Street Food'], 5, '🌮');
        addBonus(categoryCounts['Primo'], 7, '🍝');
        addBonus(categoryCounts['Secondo'], 7, '🍖');
        addBonus(categoryCounts['Dessert'], 10, '🍰');
        addBonus(categoryCounts['Holiday Recipe'], 10, '🎄');
        return { bonusPoints, bonusDetails };
    }

    setupEventListeners() {
        const csvInput = document.getElementById('csvFileInput');
        const startBtn = document.getElementById('startGameBtn');
        const roundCsvInput = document.getElementById('roundCsvFileInput');

        csvInput.addEventListener('change', (event) => {
            const file = event.target.files;
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        this.recipes = this.parseCSV(e.target.result);
                        if (this.recipes.length > 0) {
                            this.recipesLoaded = true;
                            this.showNotification('Ricette caricate con successo!');
                            this.checkFilesLoaded();
                        } else {
                            throw new Error('Nessuna ricetta trovata nel file CSV');
                        }
                    } catch (error) {
                        this.showNotification('Errore nel caricamento del file: ' + error.message);
                        this.recipesLoaded = false;
                        this.checkFilesLoaded();
                    }
                };
                reader.readAsText(file);
            }
        });

        roundCsvInput.addEventListener('change', (event) => {
            const file = event.target.files;
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        this.roundCards = this.parseRoundCSV(e.target.result);
                        if (this.roundCards.length > 0) {
                            this.roundCardsLoaded = true;
                            this.showNotification('Carte round caricate con successo!');
                            this.checkFilesLoaded();
                        } else {
                            throw new Error('Nessuna carta trovata nel file CSV');
                        }
                    } catch (error) {
                        this.showNotification('Errore nel caricamento del file: ' + error.message);
                        this.roundCardsLoaded = false;
                        this.checkFilesLoaded();
                    }
                };
                reader.readAsText(file);
            }
        });

        document.getElementById('csvSource').addEventListener('change', (event) => {
            const csvSource = event.target.value;
            const localCsvUpload = document.getElementById('localCsvUpload');
            if (csvSource === 'local') {
                localCsvUpload.style.display = 'block';
                this.recipesLoaded = false;
                this.roundCardsLoaded = false;
                this.checkFilesLoaded();
            } else if (csvSource === 'github') {
                localCsvUpload.style.display = 'none';
                this.loadGitHubCSV();
            }
        });

        startBtn.addEventListener('click', () => this.startGame());
        document.getElementById('kitchenBell').addEventListener('click', () => this.handleBellRing());
    }

    loadGitHubCSV() {
        const githubRepo = "https://raw.githubusercontent.com/GitMax76/4Dadi/main/";

        fetch(githubRepo + 'recipes.csv')
          .then(response => response.text())
          .then(csvText => {
                try {
                    this.recipes = this.parseCSV(csvText);
                    if (this.recipes.length > 0) {
                        this.recipesLoaded = true;
                        this.showNotification('Ricette ufficiali caricate con successo!');
                        this.checkFilesLoaded();
                    } else {
                        throw new Error('Nessuna ricetta trovata nel file CSV ufficiale');
                    }
                } catch (error) {
                    this.showNotification('Errore nel caricamento del file CSV ufficiale: ' + error.message);
                    this.recipesLoaded = false;
                    this.checkFilesLoaded();
                }
            });

        fetch(githubRepo + 'rounds.csv')
          .then(response => response.text())
          .then(csvText => {
                try {
                    this.roundCards = this.parseRoundCSV(csvText);
                    if (this.roundCards.length > 0) {
                        this.roundCardsLoaded = true;
                        this.showNotification('Carte round ufficiali caricate con successo!');
                        this.checkFilesLoaded();
                    } else {
                        throw new Error('Nessuna carta trovata nel file CSV ufficiale');
                    }
                } catch (error) {
                    this.showNotification('Errore nel caricamento del file CSV ufficiale: ' + error.message);
                    this.roundCardsLoaded = false;
                    this.checkFilesLoaded();
                }
            });
    }

    checkFilesLoaded() {
        const startBtn = document.getElementById('startGameBtn');
        if (this.recipesLoaded && this.roundCardsLoaded) {
            startBtn.disabled = false;
            startBtn.style.backgroundColor = '#4CAF50';
        } else {
            startBtn.disabled = true;
            startBtn.style.backgroundColor = '#cccccc';
        }
    }

    showNotification(message, timeout = 3000, callback = null) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
            if (callback) callback();
        }, timeout);
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const recipes =;
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const [name, difficulty, category, points, combination] = line.split(',');
                if (!name ||!difficulty ||!category ||!points ||!combination) {
                    throw new Error('Formato CSV non valido alla riga ' + i);
                }
                recipes.push({
                    name: name.trim(),
                    difficulty: difficulty.trim(),
                    category: category.trim(),
                    points: parseInt(points),
                    combination: combination.trim()
                });
            }
        }
        return recipes;
    }

    parseRoundCSV(csvText) {
        const lines = csvText.split('\n');
        const roundCards =;
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const [Nome, Icona, Descrizione] = line.split(',');
                if (!Nome ||!Icona ||!Descrizione) {
                    throw new Error('Formato CSV non valido alla riga ' + i);
                }
                roundCards.push({
                    Nome: Nome.trim(),
                    Icona: Icona.trim(),
                    Descrizione: Descrizione.trim()
                });
            }
        }
        return roundCards;
    }

    startGame() {
        this.playerCount = parseInt(document.getElementById('playerCount').value);
        this.totalRounds = parseInt(document.getElementById('roundCount').value);
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        this.deck = [...this.recipes];
        this.shuffleDeck();
        this.initializePlayers();
        this.setupMarket();
        this.drawRoundCard();
        this.renderGame();
        document.getElementById('roundNumber').textContent = `<span class="math-inline">\{this\.currentRound\}/</span>{this.totalRounds}`;
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    initializePlayers() {
        this.players =;
        for (let i = 0; i < this.playerCount; i++) {
            this.players.push({
                id: i,
                name: `Giocatore ${i + 1}`,
                score: 0,
                completedRecipes:,
                dice: {
                    red: 1,
                    white: 1,
                    yellow: 1,
                    green: 1
                }
            });
        }
    }

    setupMarket() {
        const cardsNeeded = this.playerCount * 2 + 1;
        if (this.deck.length < cardsNeeded) {
            this.deck = this.deck.concat(this.market);
            this.shuffleDeck();
        }
        this.market = this.deck.splice(0, cardsNeeded);
    }

    drawRoundCard() {
        if (this.roundCards.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.roundCards.length);
            this.currentRoundCard = this.roundCards[randomIndex];
        }
    }

    renderGame() {
        this.renderMarket();
        this.renderPlayerAreas();
        this.renderRoundCard();
        document.getElementById('roundNumber').textContent = `<span class="math-inline">\{this\.currentRound\}/</span>{this.totalRounds}`;
    }

    renderMarket() {
        const marketArea = document.getElementById('marketArea');
        marketArea.innerHTML = '';
        const cardsToShow = this.market.slice(0, this.playerCount * 2 + 1);
        cardsToShow.forEach((recipe, index) => {
            const card = this.createRecipeCard(recipe);
            card.dataset.marketIndex = index;
            const playerSelector = document.createElement('select');
            this.players.forEach(player => {
                const option = document.createElement('option');
                option.value = player.id;
                option.text = player.name;
                playerSelector.appendChild(option);
            });
            const confirmButton = document.createElement('button');
            confirmButton.textContent = 'Conferma';
            confirmButton.addEventListener('click', () => {
                const selectedPlayerId = parseInt(playerSelector.value);
                const selectedPlayer = this.players[selectedPlayerId];
                selectedPlayer.completedRecipes.push(recipe);
                selectedPlayer.score += recipe.points;
                this.market.splice(index, 1);
                this.endRound();
                this.renderGame();
                playerSelector.style.display = 'none';
                confirmButton.style.display = 'none';
            });
            card.addEventListener('click', () => {
                playerSelector.style.display = 'block';
                confirmButton.style.display = 'block';
            });
            card.appendChild(playerSelector);
            card.appendChild(confirmButton);
            marketArea.appendChild(card);
        });
    }

    renderRoundCard() {
        const roundCardContainer = document.getElementById('roundCardContainer');
        if (this.currentRoundCard) {
            roundCardContainer.innerHTML = `
                <div class="round-card">
                    <div class="round-card-icon"><span class="math-inline">\{this\.currentRoundCard\.Icona\}</div\>
<div class\="round\-card\-name"\></span>{this.currentRoundCard.Nome}</div>
                    <div class="round-card-description">${this.currentRoundCard.Descrizione}</div>
                </div>
            `;
        }
    }

    renderPlayerAreas() {
        const playerAreas = document.getElementById('playerAreas');
        playerAreas.innerHTML = '';
        this.players.forEach(player => {
            const playerArea = document.createElement('div');
            playerArea.className = 'player-area';
            const { bonusPoints, bonusDetails } = this.calculateBonuses(player);
            const categories = ['Appetizer', 'Street Food', 'Primo', 'Secondo', 'Dessert', 'Holiday Recipe'];
            let completedRecipesHTML = '';
            categories.forEach(category => {
                const categoryRecipes = player.completedRecipes.filter(recipe => recipe.category.toLowerCase() === category.toLowerCase());
                if (categoryRecipes.length > 0) {
                    completedRecipesHTML += `<h3>${category}</h3><div class="completed-recipes-category">`;
                    categoryRecipes.forEach(recipe => {
                        const card = this.createRecipeCard(recipe);
                        card.classList.add('completed-card');
                        completedRecipesHTML += card.outerHTML;
                    });
                    completedRecipesHTML += '</div>';
                }
            });
            playerArea.innerHTML = `
                <h2>${player.name}</h2>
                <div class="player-score">🏆 <span class="math-inline">\{player\.score\}</span>{bonusDetails} = <span class="math-inline">\{player\.score \+ bonusPoints\}</div\>
<div class\="dice\-area"\>
<div class\="die red"\></span>{player.dice.red}</div>
                    <div class="die white"><span class="math-inline">\{player\.dice\.white\}</div\>
<div class\="die yellow"\></span>{player.dice.yellow}</div>
                    <div class="die green"><span class="math-inline">\{player\.dice\.green\}</div\>
</div\>
<button class\="roll\-dice\-btn" onclick\="game\.rollDice\(</span>{player.id})">Lancia i Dadi</button>
                ${completedRecipesHTML}
            `;
            playerAreas.appendChild(playerArea);
        });
    }

    rollDice(playerId) {
        const player = this.players[playerId];
        player.dice = {
            red: Math.floor(Math.random() * 6) + 1,
            white: Math.floor(Math.random() * 6) + 1,
            yellow: Math.floor(Math.random() * 6) + 1,
            green: Math.floor(Math.random() * 6) + 1
        };
        this.renderGame();
        this.campanelloSuonato = false;
    }

    handleBellRing() {
        const bellButton = document.getElementById('kitchenBell');
        bellButton.classList.add('ringing');
        this.bellSound.play().catch(() => {
            this.showNotification('🔔 Ding!');
        });
        setTimeout(() => {
            bellButton.classList.remove('ringing');
        }, 500);
        this.showNotification('Verifica la tua combinazione!');
    }

    endRound() {
        if (this.market.length === 0) {
            if (this.currentRound < this.totalRounds) {
                this.showNotification(`Fine del Round ${this.currentRound}!`, 3000, () => {
                    this.currentRound++;
                    this.drawRoundCard();
                    this.setupMarket();
                    this.renderGame();
                    document.getElementById('roundNumber').textContent = `<span class="math-inline">\{this\.currentRound\}/</span>{this.totalRounds}`;
                });
            } else {
                this.endGame();
            }
        }
    }

    endGame() {
        let winner = null;
        let highestScore = -1;
        this.players.forEach(player => {
            const { bonusPoints } = this.calculateBonuses(player);
            const totalScore = player.score + bonusPoints;
            if (totalScore > highestScore) {
                winner = player;
                highestScore = totalScore;
            }
        });
        if (winner) {
            this.showNotification(`🎉 ${winner.name} ha vinto con 🏆 ${highestScore} punti totali! 🎉`);
        } else {
            this.showNotification('Pareggio! Nessun vincitore.');
        }
    }

    restartGame() {
        this.currentRound = 1;
        this.deck = [...this.recipes];
        this.shuffleDeck();
        this.initializePlayers();
        this.setupMarket();
        this.drawRoundCard();
        this.renderGame();
	document.getElementById('roundNumber').textContent = `${this.currentRound}/${this.totalRounds}`;
        document.getElementById('welcomeScreen').style.display = 'block';
        document.getElementById('gameScreen').style.display = 'none';
    }

    createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = `recipe-card ${recipe.category.replace(' ', '-')}`;
        card.innerHTML = `
            <div class="difficulty-stars">${recipe.difficulty}</div>
            <div class="victory-points">🏆${recipe.points}</div>
            <div class="category-icon">${this.getCategoryEmoji(recipe.category)}</div>
            <div class="recipe-name">${recipe.name}</div>
            <div class="dice-combination">${recipe.combination}</div>
        `;
        return card;
    }

    getCategoryEmoji(category) {
        const emojis = {
            'Appetizer': '🥟',
            'Street Food': '🌮',
            'Primo': '🍝',
            'Secondo': '🍖',
            'Dessert': '🍰',
            'Holiday Recipe': '🎄'
        };
        return emojis[category] || '🍽️';
    }
}

const game = new Game();
