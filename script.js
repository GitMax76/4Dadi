class Game {
 constructor() {
 this.recipes = [];
 this.players = [];
 this.market = [];
 this.currentRound = 1;
 this.deck = [];
 this.playerCount = 2;
 this.totalRounds = 3; // Valore predefinito
 this.activePlayer = 0;
 this.bellSound = document.getElementById('bellSound');
 this.roundCards = [];
 this.currentRoundCard = null;
 this.recipesLoaded = false; // Aggiunta la variabile per il caricamento delle ricette
 this.roundCardsLoaded = false; // Aggiunta la variabile per il caricamento delle carte round
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
 bonusDetails += ` +${emoji}${bonus}`;
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
 const file = event.target.files[0];
 if (file) {
 const reader = new FileReader();
 reader.onload = (e) => {
 try {
 this.recipes = this.parseCSV(e.target.result);
 if (this.recipes.length > 0) {
 this.recipesLoaded = true; // Aggiorna la variabile
 this.showNotification('Ricette caricate con successo!');
 this.checkFilesLoaded(); // Controlla se entrambi i file sono caricati
 } else {
 throw new Error('Nessuna ricetta trovata nel file CSV');
 }
 } catch (error) {
 this.showNotification('Errore nel caricamento del file: ' + error.message);
 this.recipesLoaded = false; // Aggiorna la variabile
 this.checkFilesLoaded(); // Controlla se entrambi i file sono caricati
 }
 };
 reader.readAsText(file);
 }
 });
 roundCsvInput.addEventListener('change', (event) => {
 const file = event.target.files[0];
 if (file) {
 const reader = new FileReader();
 reader.onload = (e) => {
 try {
 this.roundCards = this.parseRoundCSV(e.target.result);
 if (this.roundCards.length > 0) {
 this.roundCardsLoaded = true; // Aggiorna la variabile
 this.showNotification('Carte round caricate con successo!');
 this.checkFilesLoaded(); // Controlla se entrambi i file sono caricati
 } else {
 throw new Error('Nessuna carta trovata nel file CSV');
 }
 } catch (error) {
 this.showNotification('Errore nel caricamento del file: ' + error.message);
 this.roundCardsLoaded = false; // Aggiorna la variabile
 this.checkFilesLoaded(); // Controlla se entrambi i file sono caricati
 }
 };
 reader.readAsText(file);
 }
 });
 document.getElementById('loadOfficialCSV').addEventListener('click', async () => {
    try {
        await this.loadCSVFromURL("https://raw.githubusercontent.com/GitMax76/4Dadi/main/recipes.csv", 'recipes');
        await this.loadCSVFromURL("https://raw.githubusercontent.com/GitMax76/4Dadi/main/rounds.csv", 'rounds');
        this.checkFilesLoaded();
    } catch (error) {
        this.showNotification("Errore nel caricamento dei file ufficiali: " + error.message);
    }
});

 startBtn.addEventListener('click', () => this.startGame());
 document.getElementById('kitchenBell').addEventListener('click', () => this.handleBellRing());
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
 async loadCSVFromURL(url, type) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Errore nel download del file " + type);

        const csvText = await response.text();
        if (type === 'recipes') {
            this.recipes = this.parseCSV(csvText);
            this.recipesLoaded = true;
            this.showNotification("Ricette ufficiali caricate con successo!");
        } else if (type === 'rounds') {
            this.roundCards = this.parseRoundCSV(csvText);
            this.roundCardsLoaded = true;
            this.showNotification("Carte round ufficiali caricate con successo!");
        }
        this.checkFilesLoaded();
    } catch (error) {
        this.showNotification("Errore nel caricamento del file " + type + ": " + error.message);
    }
}
 parseCSV(csvText) {
 const lines = csvText.split('\n');
 const recipes = [];
 for (let i = 1; i < lines.length; i++) {
 const line = lines[i].trim();
 if (line) {
 const [name, difficulty, category, points, combination] = line.split(',');
 if (!name || !difficulty || !category || !points || !combination) {
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
 const roundCards = [];
 for (let i = 1; i < lines.length; i++) {
 const line = lines[i].trim();
 if (line) {
 const [Nome, Icona, Descrizione] = line.split(',');
 if (!Nome || !Icona || !Descrizione) {
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
 document.getElementById('roundNumber').textContent = `${this.currentRound}/${this.totalRounds}`;
 }
 shuffleDeck() {
 for (let i = this.deck.length - 1; i > 0; i--) {
 const j = Math.floor(Math.random() * (i + 1));
 [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
 }
 }
 initializePlayers() {
 this.players = [];
 for (let i = 0; i < this.playerCount; i++) {
 this.players.push({
 id: i,
 name: `Giocatore ${i + 1}`,
 score: 0,
 completedRecipes: [],
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
 document.getElementById('roundNumber').textContent = `${this.currentRound}/${this.totalRounds}`;
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
 <div class="round-card-icon">${this.currentRoundCard.Icona}</div>
 <div class="round-card-name">${this.currentRoundCard.Nome}</div>
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
 <div class="player-score">🏆 ${player.score}${bonusDetails} = ${player.score + bonusPoints}</div>
 <div class="dice-area">
 <div class="die red">${player.dice.red}</div>
 <div class="die white">${player.dice.white}</div>
 <div class="die yellow">${player.dice.yellow}</div>
 <div class="die green">${player.dice.green}</div>
 </div>
 <button class="roll-dice-btn" onclick="game.rollDice(${player.id})">Lancia i Dadi</button>
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
 this.drawRoundCard(); // Pesca una nuova carta round
 this.setupMarket(); // Avvia il prossimo round
 this.renderGame();
 document.getElementById('roundNumber').textContent = `${this.currentRound}/${this.totalRounds}`;
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
 const { bonusPoints, bonusDetails } = this.calculateBonuses(player);
 player.bonusPoints = bonusPoints;
 player.totalScore = player.score + bonusPoints;
 if (player.totalScore > highestScore) {
 winner = player;
 highestScore = player.totalScore;
 }
 });
 if (winner) {
 const notification = document.getElementById('notification');
 notification.innerHTML = `
 🎉 ${winner.name} ha vinto con 🏆 ${winner.totalScore} punti totali! 🎉
 <button id="endGameButton">Termina</button>
 <button id="restartGameButton">Ricomincia</button>
 `;
 notification.style.display = 'block';
 notification.style.backgroundColor = '#DC143C';
 notification.style.fontSize = '24px';
 notification.style.padding = '20px 30px';
 document.getElementById('endGameButton').addEventListener('click', () => {
 notification.style.display = 'none';
 });
 document.getElementById('restartGameButton').addEventListener('click', () => {
 notification.style.display = 'none';
 this.restartGame();
 });
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
 this.renderGame();
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
