// Naruto Pixel Card Game - Módulo de Combate

document.addEventListener("DOMContentLoaded", () => {
    console.log("Módulo de Combate - Naruto Pixel Card Game iniciado!");

    // --- Áudio Elements ---
    let ambientSound = null;
    let victorySound = null;
    let defeatSound = null;
    let battleStartTime = 0;

    // --- Lista de Rivais ---
    const rivalNames = [
        "Sasuke Uchiha", "Gaara", "Neji Hyuga", "Rock Lee", "Orochimaru", 
        "Kabuto Yakushi", "Kimimaro", "Zabuza Momochi", "Haku", "Itachi Uchiha",
        "Kisame Hoshigaki", "Deidara", "Sasori", "Pain (Tendo)", "Konan"
    ];
    let currentRivalName = "Oponente Desconhecido";

    // --- Definição da Estrutura das Cartas ---
    class Card {
        constructor(id, name, type, cost, description, image, attack = 0, defenseBuff = 0, effect = null, duration = 0, critChance = 0, effectValue = 0, defensePercent = 0, summonDotDamage = 0) {
            this.id = id;
            this.name = name;
            this.type = type;
            this.cost = cost;
            this.description = description;
            this.image = image;
            this.attack = attack;
            this.defenseBuff = defenseBuff; // Para ganho direto na barra de defesa
            this.defensePercent = defensePercent; // Para status effect de % de defesa
            this.effect = effect;
            this.duration = duration;
            this.critChance = critChance;
            this.effectValue = effectValue;
            this.summonDotDamage = summonDotDamage;
            this.level = 1;
            this.xp = 0;
        }

        getHTMLElement() {
            const cardElement = document.createElement("div");
            cardElement.classList.add("card");
            cardElement.classList.add(`type-${this.type.toLowerCase()}`);
            cardElement.dataset.cardId = this.id;

            let imagePlaceholder = this.type.substring(0, 3).toUpperCase();
            if (this.type === "Jutsu") imagePlaceholder = "JUT";
            if (this.type === "Taijutsu") imagePlaceholder = "TAI";
            if (this.type === "Defesa") imagePlaceholder = "DEF"; // Usado para cartas que dão defenseBuff
            if (this.type === "Item") imagePlaceholder = "ITM";
            if (this.type === "Buff") imagePlaceholder = "BUF";
            if (this.type === "Debuff") imagePlaceholder = "DEB";
            if (this.type === "Invocação") imagePlaceholder = "INV";
            if (this.type === "Modo") imagePlaceholder = "MOD";

            const currentAttack = this.attack;
            const currentDefenseBuff = this.defenseBuff; // Defesa direta da carta
            const currentDefensePercent = this.defensePercent > 0 ? Math.round(this.defensePercent * 100) : 0; // % Defesa como status
            const currentSummonDot = this.summonDotDamage;

            let statsHTML = "";
            if (currentAttack > 0) {
                statsHTML += `<span>Atk: ${currentAttack}${this.critChance > 0 ? ` (${Math.round(this.critChance * 100)}%C)` : ""}</span>`;
            }
            if (currentDefenseBuff > 0) { // Mostra o ganho de defesa da carta
                statsHTML += `<span>Def: +${currentDefenseBuff}</span>`;
            }
            if (currentDefensePercent > 0) { // Mostra o buff de % de defesa
                statsHTML += `<span>Def%: ${currentDefensePercent}% (${this.duration}t)</span>`;
            }
            if (currentSummonDot > 0) {
                statsHTML += `<span>DoT: ${currentSummonDot}/${this.duration}t</span>`;
            }
            if (statsHTML === "") statsHTML = "<span></span>";

            cardElement.innerHTML = `
                <div class="card-name">${this.name}</div>
                <div class="card-cost">${this.cost > 0 ? this.cost : ""}</div>
                <div class="card-image-placeholder">${imagePlaceholder}</div>
                <div class="card-type">${this.type}</div>
                <div class="card-desc">${this.description}</div>
                <div class="card-stats">
                    ${statsHTML}
                </div>
            `;
            return cardElement;
        }
    }

    const cardDatabase = {
        "jutsu001": { name: "Rasengan", type: "Jutsu", cost: 30, description: "Causa 40 de dano.", attack: 40 },
        "jutsu002": { name: "Chidori", type: "Jutsu", cost: 35, description: "Causa 45 de dano. Crítico: 15%", attack: 45, critChance: 0.15 },
        "jutsu003": { name: "Kage Bunshin", type: "Jutsu", cost: 20, description: "Compra 1 carta.", effect: "draw_card", effectValue: 1 },
        "taijutsu001": { name: "Chute Dinâmico", type: "Taijutsu", cost: 10, description: "Causa 20 de dano.", attack: 20 },
        "defesa001": { name: "Escudo de Terra", type: "Defesa", cost: 15, description: "Ganha 25 de Defesa.", defenseBuff: 25 }, // Carta de defesa direta
        "jutsu006": { name: "Parede de Lama", type: "Buff", cost: 20, description: "Ganha 30% de Redução de Dano por 2 turnos.", defensePercent: 0.30, duration: 2, effect: "apply_defense_percent_buff" }, // Buff de % Defesa
        "jutsu008": { name: "Amaterasu", type: "Jutsu", cost: 55, description: "Causa 30 de dano por 3 turnos.", effect: "burn", effectValue: 30, duration: 3 },
        "invoc001": { name: "Invocação: Sapo", type: "Invocação", cost: 30, description: "Causa 15 dano/turno por 3 turnos.", effect: "summon_dot", summonDotDamage: 15, duration: 3 },
        "jutsu012": { name: "Jutsu Médico", type: "Jutsu", cost: 25, description: "Recupera 40 de Vida.", effect: "heal", effectValue: 40 },
        "item001": { name: "Kunai", type: "Item", cost: 5, description: "Causa 10 de dano.", attack: 10 },
        "item002": { name: "Pílula Soldado", type: "Item", cost: 10, description: "Recupera 15 Chakra.", effect: "recover_chakra", effectValue: 15 },
        "buff001": { name: "Força Interior", type: "Buff", cost: 20, description: "+10 Atk próximo Taijutsu.", effect: "buff_next_taijutsu", duration: 1, effectValue: 10 },
        "debuff001": { name: "Redução de Defesa Oponente", type: "Debuff", cost: 15, description: "Reduz Defesa% do oponente em 20% por 2t.", effect: "reduce_opponent_defense_percent", effectValue: 0.20, duration: 2 }, // Exemplo de debuff de defesa
        "mode001": { name: "Modo Sábio (Sapo)", type: "Modo", cost: 50, description: "+20 Atk, +10 Chakra Regen por 3t.", effect: "stat_boost_regen", boost: { attack: 20 }, regen: { chakra: 10 }, duration: 3 },
        "jutsu018": { name: "Tsukuyomi", type: "Jutsu", cost: 75, description: "Atordoa oponente por 1 turno. Causa 20 dano.", effect: "stun", duration: 1, attack: 20 },
    };

    const battleState = {
        turn: 0,
        currentPlayer: "player",
        gamePhase: "setup",
        player: {
            health: 500, maxHealth: 500, chakra: 50, maxChakra: 380, defense: 0, maxDefense: 50, 
            attackBoost: 0, critChanceBoost: 0, statusEffects: [], deck: [], hand: [], discardPile: [], 
            canPlayCard: true, isStunned: false, cardBoughtThisTurn: false,
            healthBarFill: null, chakraBarFill: null, defenseBarFill: null,
            healthBarText: null, chakraBarText: null, defenseBarText: null, 
            healthFeedback: null, chakraFeedback: null, defenseFeedback: null,
            statusEffectsDisplay: null, tempStatsDisplay: null, handElement: null
        },
        opponent: {
            health: 500, maxHealth: 500, chakra: 50, maxChakra: 380, defense: 0, maxDefense: 50, 
            attackBoost: 0, critChanceBoost: 0, statusEffects: [], deck: [], hand: [], discardPile: [], 
            canPlayCard: true, isStunned: false, cardBoughtThisTurn: false,
            healthBarFill: null, chakraBarFill: null, defenseBarFill: null,
            healthBarText: null, chakraBarText: null, defenseBarText: null, 
            healthFeedback: null, chakraFeedback: null, defenseFeedback: null,
            statusEffectsDisplay: null, tempStatsDisplay: null, handElement: null
        }
    };

    // --- Elementos da UI ---
    function cacheUIElements() {
        // Player UI Elements
        battleState.player.healthBarFill = document.getElementById("player-health-bar-fill");
        battleState.player.chakraBarFill = document.getElementById("player-chakra-bar-fill");
        battleState.player.defenseBarFill = document.getElementById("player-defense-bar-fill");

        battleState.player.healthBarText = createBarTextElement(battleState.player.healthBarFill);
        battleState.player.chakraBarText = createBarTextElement(battleState.player.chakraBarFill);
        battleState.player.defenseBarText = createBarTextElement(battleState.player.defenseBarFill);

        battleState.player.healthFeedback = document.getElementById("player-health-feedback");
        battleState.player.chakraFeedback = document.getElementById("player-chakra-feedback");
        battleState.player.defenseFeedback = document.getElementById("player-defense-feedback");
        battleState.player.statusEffectsDisplay = document.getElementById("player-status-effects");
        battleState.player.tempStatsDisplay = document.getElementById("player-temp-stats");
        battleState.player.handElement = document.getElementById("player-hand");

        // Opponent UI Elements
        battleState.opponent.healthBarFill = document.getElementById("opponent-health-bar-fill");
        battleState.opponent.chakraBarFill = document.getElementById("opponent-chakra-bar-fill");
        battleState.opponent.defenseBarFill = document.getElementById("opponent-defense-bar-fill");

        battleState.opponent.healthBarText = createBarTextElement(battleState.opponent.healthBarFill);
        battleState.opponent.chakraBarText = createBarTextElement(battleState.opponent.chakraBarFill);
        battleState.opponent.defenseBarText = createBarTextElement(battleState.opponent.defenseBarFill);

        battleState.opponent.healthFeedback = document.getElementById("opponent-health-feedback");
        battleState.opponent.chakraFeedback = document.getElementById("opponent-chakra-feedback");
        battleState.opponent.defenseFeedback = document.getElementById("opponent-defense-feedback");
        battleState.opponent.statusEffectsDisplay = document.getElementById("opponent-status-effects");
        battleState.opponent.tempStatsDisplay = document.getElementById("opponent-temp-stats");
        battleState.opponent.handElement = document.getElementById("opponent-hand");
    }
    cacheUIElements(); // Chamar para popular os elementos no battleState

    function createBarTextElement(barFillElement) {
        const textElement = document.createElement("div");
        textElement.classList.add("bar-text");
        textElement.textContent = "0"; // Initial value
        barFillElement.appendChild(textElement);
        return textElement;
    }

    const turnCounterDisplay = document.getElementById("turn-counter");
    const messageLogElement = document.getElementById("message-log");
    const endTurnButton = document.getElementById("end-turn-button");
    const restartBattleButton = document.getElementById("restart-battle-button");

    const battleResultsScreen = document.getElementById("battle-results-screen");
    const rivalNameDisplay = document.getElementById("rival-name-display");
    const battleResultTitle = document.getElementById("battle-result-title");
    const resultTrophies = document.getElementById("result-trophies");
    const resultCoins = document.getElementById("result-coins");
    const resultTime = document.getElementById("result-time");
    const resultStars = document.getElementById("result-stars");
    const closeResultsButton = document.getElementById("close-results-button");
    const nextLevelButton = document.getElementById("next-level-button");

    // --- Função para inicializar o scroll da mão ---
    function initializeHandScrolling() {
        const scrollArrows = document.querySelectorAll(".scroll-arrow");
        scrollArrows.forEach(arrow => {
            arrow.addEventListener("click", () => {
                const targetHandId = arrow.dataset.target;
                const handArea = document.getElementById(targetHandId);
                if (handArea) {
                    const cardWidth = 65; // Largura da carta definida no CSS
                    const cardGap = 5; // Espaço entre as cartas definido no CSS
                    const scrollAmount = (cardWidth + cardGap) * 2; // Rolar por 2 cartas

                    if (arrow.classList.contains("left-arrow")) {
                        handArea.scrollBy({ left: -scrollAmount, behavior: "smooth" });
                    } else if (arrow.classList.contains("right-arrow")) {
                        handArea.scrollBy({ left: scrollAmount, behavior: "smooth" });
                    }
                }
            });
        });
    }
    initializeHandScrolling(); // Chamar a função de inicialização
    startChakraRegeneration(); // Iniciar a regeneração de chakra

    // --- Função para regeneração de Chakra ---
    function startChakraRegeneration() {
        setInterval(() => {
            if (battleState.gamePhase !== "battle-over") { // Só regenera se a batalha não acabou
                // Regenera Chakra do Jogador
                if (battleState.player.chakra < battleState.player.maxChakra) {
                    battleState.player.chakra = Math.min(battleState.player.chakra + 5, battleState.player.maxChakra);
                    // logMessage(`Jogador regenerou 5 de chakra. Total: ${battleState.player.chakra}`); // Opcional: log
                }
                // Regenera Chakra do Oponente
                if (battleState.opponent.chakra < battleState.opponent.maxChakra) {
                    battleState.opponent.chakra = Math.min(battleState.opponent.chakra + 5, battleState.opponent.maxChakra);
                    // logMessage(`Oponente regenerou 5 de chakra. Total: ${battleState.opponent.chakra}`); // Opcional: log
                }
                updatePlayerStatsUI();
                updateOpponentStatsUI();
            }
        }, 3000); // Regenera a cada 3 segundos
    }

    // --- Funções Auxiliares ---
    function logMessage(message) {
        console.log(message);
        const messageElement = document.createElement("p");
        messageElement.textContent = message;
        if (messageLogElement.children.length > 0 && messageLogElement.firstChild.tagName === "P") {
             messageLogElement.insertBefore(messageElement, messageLogElement.children[0]); // Insere no topo
        } else {
             messageLogElement.appendChild(messageElement);
        }
        while (messageLogElement.children.length > 50) { 
            messageLogElement.removeChild(messageLogElement.lastChild);
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function createCardInstance(cardId) {
        const cardData = cardDatabase[cardId];
        if (!cardData) {
            console.error(`Dados não encontrados para a carta ID: ${cardId}`);
            return null;
        }
        return new Card(
            cardId, cardData.name, cardData.type, cardData.cost, cardData.description, cardData.image,
            cardData.attack, cardData.defenseBuff, cardData.effect, cardData.duration, cardData.critChance,
            cardData.effectValue, cardData.defensePercent, cardData.summonDotDamage
        );
    }
    
    function triggerBarShadow(barFillElement) {
        const barContainer = barFillElement.parentElement;
        if (barContainer) {
            barContainer.classList.remove("active-shadow");
            void barContainer.offsetWidth; 
            barContainer.classList.add("active-shadow");
            setTimeout(() => {
                barContainer.classList.remove("active-shadow");
            }, 2000);
        }
    }

    function showFloatingNumber(value, type, feedbackElement) { // Modificado para aceitar o elemento diretamente
        if (!feedbackElement) return;

        const numberElement = document.createElement("div");
        numberElement.classList.add("floating-number");
        numberElement.classList.add(type); 
        numberElement.textContent = (value > 0 && (type === "heal" || type === "chakra-gained" || type === "defense-gained")) ? `+${value}` : `${value}`; 
        
        feedbackElement.appendChild(numberElement);

        setTimeout(() => {
            if (numberElement.parentElement) {
                numberElement.parentElement.removeChild(numberElement);
            }
        }, 2000);
    }

    // --- Funções de Áudio (sem alterações) ---
    function playAmbientSound() { if (!ambientSound) { ambientSound = new Audio("sons/som1ambiente.mp3"); ambientSound.loop = true; } ambientSound.play().catch(e => console.error("Audio Error:", e)); }
    function stopAmbientSound() { if (ambientSound && !ambientSound.paused) { ambientSound.pause(); ambientSound.currentTime = 0; } }
    function playVictorySound() { stopAmbientSound(); if (!victorySound) { victorySound = new Audio("sons/vitoria.mp3"); } victorySound.currentTime = 0; victorySound.play().catch(e => console.error("Audio Error:", e)); }
    function playDefeatSound() { stopAmbientSound(); if (!defeatSound) { defeatSound = new Audio("sons/voceperdeu.mp3"); } defeatSound.currentTime = 0; defeatSound.play().catch(e => console.error("Audio Error:", e)); }

    // --- Funções de Atualização da UI ---
    function updateTargetStatsUI(targetKey) {
        const target = battleState[targetKey];

        // Health Bar
        const oldHealthPercent = parseFloat(target.healthBarFill.style.width) || (target.maxHealth > 0 ? (target.health / target.maxHealth) * 100 : 0);
        const newHealthPercent = target.maxHealth > 0 ? Math.max(0, (target.health / target.maxHealth) * 100) : 0;
        if (Math.abs(oldHealthPercent - newHealthPercent) > 0.01) triggerBarShadow(target.healthBarFill);
        target.healthBarFill.style.width = `${newHealthPercent}%`;
        if (target.healthBarText) target.healthBarText.textContent = `${target.health} / ${target.maxHealth}`;

        // Chakra Bar
        const oldChakraPercent = parseFloat(target.chakraBarFill.style.width) || (target.maxChakra > 0 ? (target.chakra / target.maxChakra) * 100 : 0);
        const newChakraPercent = target.maxChakra > 0 ? Math.max(0, (target.chakra / target.maxChakra) * 100) : 0;
        if (Math.abs(oldChakraPercent - newChakraPercent) > 0.01) triggerBarShadow(target.chakraBarFill);
        target.chakraBarFill.style.width = `${newChakraPercent}%`;
        if (target.chakraBarText) target.chakraBarText.textContent = `${target.chakra} / ${target.maxChakra}`;

        // Defense Bar
        const oldDefensePercent = parseFloat(target.defenseBarFill.style.width) || (target.maxDefense > 0 ? (target.defense / target.maxDefense) * 100 : 0);
        const newDefensePercent = target.maxDefense > 0 ? Math.max(0, (target.defense / target.maxDefense) * 100) : 0;
        if (Math.abs(oldDefensePercent - newDefensePercent) > 0.01) triggerBarShadow(target.defenseBarFill);
        target.defenseBarFill.style.width = `${newDefensePercent}%`;
        if (target.defenseBarText) target.defenseBarText.textContent = `${target.defense} / ${target.maxDefense}`;
        
        updateStatusEffectsUI(target, target.statusEffectsDisplay);
        updateTempStatsUI(target, target.tempStatsDisplay);
    }

    function updatePlayerStatsUI() { updateTargetStatsUI("player"); }
    function updateOpponentStatsUI() { updateTargetStatsUI("opponent"); }

    function updateStatusEffectsUI(target, displayElement) {
        displayElement.innerHTML = "";
        target.statusEffects.forEach(effect => {
            const effectElement = document.createElement("span");
            effectElement.classList.add("status-effect-icon", `effect-${effect.type}`);
            let effectDescription = effect.description || cardDatabase[effect.sourceCardId]?.description || "";
            if (effect.value && effect.type !== "stun") effectDescription += ` (${effect.value > 0 && effect.type.includes("percent") ? Math.round(effect.value*100)+"%": effect.value})`;
            effectElement.title = `${effect.name}: ${effectDescription} (${effect.duration}t restantes)`;
            
            let effectText = effect.name ? effect.name.substring(0, 3).toUpperCase() : "EFF";
            if (effect.type === "buff") effectText = "BUF";
            if (effect.type === "debuff") effectText = "DEB";
            if (effect.type === "dot" || effect.type === "burn" || effect.type === "poison" || effect.type === "summon_dot") effectText = "DoT";
            if (effect.type === "hot") effectText = "HoT";
            if (effect.type === "stun") effectText = "STN";
            if (effect.type === "defense_percent") effectText = "D%";
            if (effect.type === "reduce_defense_percent_active") effectText = "-D%"; // Para debuff de defesa percentual no alvo

            effectElement.textContent = `${effectText}(${effect.duration})`;
            displayElement.appendChild(effectElement);
        });
    }

    function updateTempStatsUI(target, displayElement) {
        displayElement.innerHTML = "";
        let statsText = "";
        if (target.attackBoost !== 0) {
            statsText += `<span>Atk Boost: ${target.attackBoost > 0 ? "+" : ""}${target.attackBoost}</span>`;
        }
        // Não mostrar mais target.defense ou target.defensePercent aqui, pois são refletidos na barra ou nos status icons
        if (target.critChanceBoost !== 0) {
            statsText += `<span>Crit Boost: +${Math.round(target.critChanceBoost * 100)}%</span>`;
        }
        displayElement.innerHTML = statsText;
    }

    function updateHandUI(playerType) {
        const target = battleState[playerType];
        target.handElement.innerHTML = "";
        if (target.hand.length === 0) {
            target.handElement.innerHTML = `<p>Mão Vazia</p>`;
            return;
        }
        target.hand.forEach((cardInstance, index) => {
            if (playerType === "player") {
                const cardElement = cardInstance.getHTMLElement();
                cardElement.onclick = () => playCardFromHand(cardInstance.id, index);
                target.handElement.appendChild(cardElement);
            } else {
                const cardBackElement = document.createElement("div");
                cardBackElement.classList.add("card", "card-back");
                cardBackElement.textContent = "???";
                target.handElement.appendChild(cardBackElement);
            }
        });
    }

    function updateTurnUI() { turnCounterDisplay.textContent = battleState.turn; }
    function updateAllCombatUI() { updatePlayerStatsUI(); updateOpponentStatsUI(); updateHandUI("player"); updateHandUI("opponent"); updateTurnUI(); }

    function initializeDeck(targetType) {
        const target = battleState[targetType];
        target.deck = [];
        const allCardIds = Object.keys(cardDatabase);
        for (let i = 0; i < 20; i++) { target.deck.push(allCardIds[Math.floor(Math.random() * allCardIds.length)]); }
        shuffleArray(target.deck);
    }

    function drawCard(playerType, count = 1) {
        const target = battleState[playerType];
        for (let i = 0; i < count; i++) {
            if (target.deck.length > 0) {
                if (target.hand.length < 7) {
                    const cardId = target.deck.pop();
                    const cardInstance = createCardInstance(cardId);
                    if (cardInstance) { target.hand.push(cardInstance); logMessage(`${playerType === "player" ? "Jogador" : "Oponente"} comprou ${cardInstance.name}.`); }
                } else { logMessage(`${playerType === "player" ? "Jogador" : "Oponente"} não pode comprar (mão cheia).`); target.deck.pop(); }
            } else { logMessage(`${playerType === "player" ? "Jogador" : "Oponente"} sem cartas no deck!`); }
        }
    }

    function startBattle() {
        logMessage("Nova batalha iniciada!");
        currentRivalName = rivalNames[Math.floor(Math.random() * rivalNames.length)];
        logMessage(`Seu oponente é: ${currentRivalName}`);
        const opponentAvatarElement = document.querySelector("#opponent-status-side .player-avatar");
        if (opponentAvatarElement) opponentAvatarElement.textContent = currentRivalName.substring(0,3).toUpperCase();

        battleStartTime = Date.now();
        playAmbientSound(); 
        battleState.turn = 1;
        battleState.currentPlayer = "player";
        battleState.gamePhase = "player_turn";
        battleResultsScreen.classList.remove("visible");
        battleResultsScreen.classList.add("battle-results-screen-hidden");

        ["player", "opponent"].forEach(type => {
            const target = battleState[type];
            target.health = target.maxHealth; target.chakra = target.maxChakra; 
            target.defense = 0; // Defesa inicial da barra
            // target.maxDefense já está definido no battleState inicial
            target.attackBoost = 0; target.critChanceBoost = 0;
            target.statusEffects = []; target.hand = []; target.discardPile = [];
            target.isStunned = false; target.canPlayCard = true;
            initializeDeck(type);
            drawCard(type, 3);
        });
        logMessage("Turno do Jogador.");
        endTurnButton.disabled = false;
        updateAllCombatUI();
    }

    function showResultsScreen(playerWon) {
        battleState.gamePhase = "results_screen";
        stopAmbientSound();
        const battleDurationMs = Date.now() - battleStartTime;
        const minutes = Math.floor(battleDurationMs / 60000);
        const seconds = Math.floor((battleDurationMs % 60000) / 1000);
        resultTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        rivalNameDisplay.textContent = `Rival: ${currentRivalName}`;

        if (playerWon) {
            battleResultTitle.textContent = "Vitória!"; playVictorySound();
            resultTrophies.textContent = "+25"; resultCoins.textContent = "+100"; resultStars.textContent = "★★★"; 
            nextLevelButton.style.display = "inline-block"; 
            closeResultsButton.textContent = "Menu Principal";
        } else {
            battleResultTitle.textContent = "Derrota!"; playDefeatSound();
            resultTrophies.textContent = "-10"; resultCoins.textContent = "+10"; resultStars.textContent = "☆☆☆"; 
            nextLevelButton.style.display = "none"; 
            closeResultsButton.textContent = "Tentar Novamente";
        }
        battleResultsScreen.classList.remove("battle-results-screen-hidden");
        battleResultsScreen.classList.add("visible");
    }

    function playCardFromHand(cardId, handIndex) {
        const player = battleState.player;
        if (battleState.currentPlayer !== "player" || battleState.gamePhase !== "player_turn" || !player.canPlayCard) {
            logMessage("Não é seu turno ou você não pode jogar cartas agora."); return;
        }
        const cardInstance = player.hand[handIndex];
        if (!cardInstance || cardInstance.id !== cardId) { logMessage("Carta inválida."); return; }
        if (player.chakra < cardInstance.cost) { logMessage(`Chakra insuficiente para ${cardInstance.name}.`); return; }
        
        const chakraSpent = cardInstance.cost;
        player.chakra -= chakraSpent;
        if (chakraSpent > 0) showFloatingNumber(-chakraSpent, "chakra-spent", player.chakraFeedback);
        
        player.hand.splice(handIndex, 1);
        player.discardPile.push(cardInstance.id);
        logMessage(`Jogador usou ${cardInstance.name}.`);
        applyCardEffect(cardInstance, "player", "opponent");
        updateAllCombatUI();
        checkWinCondition();
    }

    function applyCardEffect(card, casterKey, targetKey) {
        const caster = battleState[casterKey];
        const target = battleState[targetKey];

        // Aplicar ganho de defesa da carta (defenseBuff)
        if (card.defenseBuff > 0) {
            const oldDef = caster.defense;
            caster.defense = Math.min(caster.maxDefense, caster.defense + card.defenseBuff);
            const gainedDef = caster.defense - oldDef;
            if (gainedDef > 0) showFloatingNumber(gainedDef, "defense-gained", caster.defenseFeedback);
            logMessage(`${casterKey} ganhou ${gainedDef} de defesa com ${card.name}.`);
        }

        // Aplicar dano da carta
        if (card.attack > 0) {
            let totalAttackDamage = card.attack + caster.attackBoost;
            if (Math.random() < (card.critChance + caster.critChanceBoost)) {
                totalAttackDamage = Math.round(totalAttackDamage * 1.5);
                logMessage("Acerto Crítico!");
            }
            totalAttackDamage = Math.round(totalAttackDamage);

            // Aplicar Redução de Dano Percentual (debuffs no atacante ou buffs no defensor)
            let effectiveDR = 0;
            target.statusEffects.forEach(effect => { 
                if (effect.type === "defense_percent" && effect.duration > 0) effectiveDR += effect.value;
            });
            caster.statusEffects.forEach(effect => { // Considerar debuffs no atacante que reduzem seu dano
                if (effect.type === "reduce_attack_percent" && effect.duration > 0) effectiveDR += effect.value; 
            });
            totalAttackDamage = Math.round(totalAttackDamage * (1 - effectiveDR));
            if (totalAttackDamage < 0) totalAttackDamage = 0; // Dano não pode ser negativo

            logMessage(`${card.name} tenta causar ${totalAttackDamage} de dano a ${targetKey}.`);

            // Dano à barra de defesa primeiro
            let damageDealtToShield = Math.min(totalAttackDamage, target.defense);
            if (damageDealtToShield > 0) {
                target.defense -= damageDealtToShield;
                showFloatingNumber(-damageDealtToShield, "defense-lost", target.defenseFeedback);
                logMessage(`${damageDealtToShield} de dano absorvido pela defesa de ${targetKey}.`);
            }

            // Dano restante à vida
            let remainingDamageToHealth = totalAttackDamage - damageDealtToShield;
            if (remainingDamageToHealth > 0) {
                target.health -= remainingDamageToHealth;
                showFloatingNumber(-remainingDamageToHealth, "damage", target.healthFeedback);
                logMessage(`${remainingDamageToHealth} de dano causado à vida de ${targetKey}.`);
            }
            if (totalAttackDamage === 0 && damageDealtToShield === 0) {
                 logMessage(`${card.name} não causou dano.`);
            }
        }

        // Aplicar outros efeitos da carta
        switch (card.effect) {
            case "draw_card": drawCard(casterKey, card.effectValue || 1); break;
            case "heal":
                const healAmount = card.effectValue || 0;
                const oldHealth = caster.health;
                caster.health = Math.min(caster.maxHealth, caster.health + healAmount);
                const actualHeal = caster.health - oldHealth;
                if (actualHeal > 0) showFloatingNumber(actualHeal, "heal", caster.healthFeedback);
                logMessage(`${casterKey} recuperou ${actualHeal} de vida.`);
                break;
            case "recover_chakra":
                const chakraRecoverAmount = card.effectValue || 0;
                const oldChakra = caster.chakra;
                caster.chakra = Math.min(caster.maxChakra, caster.chakra + chakraRecoverAmount);
                const actualChakraGain = caster.chakra - oldChakra;
                if (actualChakraGain > 0) showFloatingNumber(actualChakraGain, "chakra-gained", caster.chakraFeedback);
                logMessage(`${casterKey} recuperou ${actualChakraGain} de chakra.`);
                break;
            case "apply_defense_percent_buff": // Efeito para cartas como "Parede de Lama"
                 addStatusEffect(casterKey, { 
                    id: `def_percent_${Date.now()}`,
                    name: card.name, 
                    type: "defense_percent", 
                    description: `+${Math.round(card.defensePercent*100)}% Redução de Dano`, 
                    value: card.defensePercent, 
                    duration: card.duration, 
                    sourceCardId: card.id 
                });
                logMessage(`${casterKey} ativou ${card.name} (+${Math.round(card.defensePercent*100)}% Redução de Dano por ${card.duration} turnos).`);
                break;
            case "reduce_opponent_defense_percent": // Exemplo de debuff
                addStatusEffect(targetKey, { 
                    id: `reduce_def_percent_${Date.now()}`,
                    name: card.name, 
                    type: "defense_percent", // Usa o mesmo tipo, mas com valor negativo para aumentar dano recebido
                    description: `-${Math.round(card.effectValue*100)}% Redução de Dano (Alvo recebe mais dano)`, 
                    value: -card.effectValue, // Valor negativo para aumentar dano sofrido
                    duration: card.duration, 
                    sourceCardId: card.id 
                });
                logMessage(`${targetKey} foi afetado por ${card.name} (-${Math.round(card.effectValue*100)}% Redução de Dano por ${card.duration} turnos).`);
                break;
            // Adicionar outros casos de efeito aqui (burn, stun, summon_dot, etc.)
            case "burn":
            case "summon_dot":
            case "stun":
                 addStatusEffect(targetKey, { 
                    id: `${card.effect}_${Date.now()}`,
                    name: card.name, 
                    type: card.effect, 
                    description: card.description, 
                    value: card.effect === "stun" ? 0 : (card.effectValue || card.summonDotDamage || 0), 
                    duration: card.duration, 
                    sourceCardId: card.id 
                });
                logMessage(`${targetKey} foi afetado por ${card.name} (${card.effect}).`);
                break;
            case "buff_next_taijutsu":
                 addStatusEffect(casterKey, { 
                    id: `buff_taijutsu_${Date.now()}`,
                    name: card.name, 
                    type: "buff_taijutsu_atk", 
                    description: `+${card.effectValue} Atk para próximo Taijutsu`, 
                    value: card.effectValue, 
                    duration: card.duration, // Normalmente 1 ou até ser usado
                    sourceCardId: card.id 
                });
                logMessage(`${casterKey} ativou ${card.name}.`);
                break;
            // ... outros efeitos
        }
        // Lógica para consumir buff_next_taijutsu se a carta atual for Taijutsu
        if (card.type === "Taijutsu") {
            const buffIndex = caster.statusEffects.findIndex(eff => eff.type === "buff_taijutsu_atk" && eff.duration > 0);
            if (buffIndex !== -1) {
                const buff = caster.statusEffects[buffIndex];
                logMessage(`${casterKey} consumiu ${buff.name} para ${card.name}.`);
                caster.attackBoost -= buff.value; // Remove o boost após o cálculo do dano desta carta
                caster.statusEffects.splice(buffIndex, 1);
            }
        }
    }

    function addStatusEffect(targetKey, effectData) {
        const target = battleState[targetKey];
        // Verificar se já existe um efeito do mesmo tipo e fonte para evitar duplicatas (opcional, depende da regra do jogo)
        // const existingEffectIndex = target.statusEffects.findIndex(e => e.sourceCardId === effectData.sourceCardId && e.type === effectData.type);
        // if (existingEffectIndex !== -1) { target.statusEffects[existingEffectIndex] = effectData; } else { target.statusEffects.push(effectData); }
        target.statusEffects.push(effectData);
        logMessage(`${targetKey} recebeu efeito: ${effectData.name || effectData.type}.`);
        // Se o efeito for buff_taijutsu_atk, aplicar o boost imediatamente
        if (effectData.type === "buff_taijutsu_atk") {
            target.attackBoost += effectData.value;
        }
    }

    function applyStatusEffectsAtTurnStart(entityKey) {
        const entity = battleState[entityKey];
        const opponentKey = entityKey === "player" ? "opponent" : "player";
        const opponent = battleState[opponentKey];

        entity.statusEffects = entity.statusEffects.filter(effect => {
            if (effect.duration <= 0) return false;

            switch (effect.type) {
                case "burn":
                case "poison":
                case "summon_dot":
                    const dotDamage = effect.value || 0;
                    if (dotDamage > 0) {
                        entity.health -= dotDamage;
                        showFloatingNumber(-dotDamage, "damage", entity.healthFeedback);
                        logMessage(`${entityKey} sofreu ${dotDamage} de dano de ${effect.name}.`);
                    }
                    break;
                case "hot": // Heal Over Time
                    const hotHeal = effect.value || 0;
                    if (hotHeal > 0) {
                        const oldH = entity.health;
                        entity.health = Math.min(entity.maxHealth, entity.health + hotHeal);
                        const actualHotHeal = entity.health - oldH;
                        if(actualHotHeal > 0) showFloatingNumber(actualHotHeal, "heal", entity.healthFeedback);
                        logMessage(`${entityKey} recuperou ${actualHotHeal} de vida de ${effect.name}.`);
                    }
                    break;
                // defense_percent e outros buffs/debuffs são passivos, aplicados no cálculo de dano ou stats
            }
            effect.duration--;
            return effect.duration > 0;
        });
        // Recalcular stats que podem ser afetados por buffs que não são de dano direto
        // Por exemplo, attackBoost de "buff_taijutsu_atk" é removido ao usar, não aqui.
    }

    function checkWinCondition() {
        const player = battleState.player;
        const opponent = battleState.opponent;
        if (player.health <= 0) {
            logMessage("Jogador foi derrotado!");
            battleState.gamePhase = "game_over";
            endTurnButton.disabled = true;
            showResultsScreen(false);
            return true;
        }
        if (opponent.health <= 0) {
            logMessage("Oponente foi derrotado!");
            battleState.gamePhase = "game_over";
            endTurnButton.disabled = true;
            showResultsScreen(true);
            return true;
        }
        return false;
    }

    function endTurn() {
        if (battleState.gamePhase === "game_over") return;
        logMessage(`Fim do turno de ${battleState.currentPlayer}.`);
        
        // Lógica de final de turno para o jogador atual (ex: remover buffs de 1 turno)
        // applyStatusEffectsAtTurnEnd(battleState.currentPlayer);

        if (battleState.currentPlayer === "player") {
            battleState.currentPlayer = "opponent";
            logMessage("Turno do Oponente.");
            applyStatusEffectsAtTurnStart("opponent"); // Efeitos de início de turno para o oponente
            if (checkWinCondition()) return;
            updateAllCombatUI();
            setTimeout(opponentTurnLogic, 1000);
        } else {
            battleState.currentPlayer = "player";
            logMessage("Turno do Jogador.");
            applyStatusEffectsAtTurnStart("player"); // Efeitos de início de turno para o jogador
            if (checkWinCondition()) return;
            drawCard("player", 1); // Jogador compra 1 carta no início do seu turno
            battleState.player.canPlayCard = true;
            battleState.player.isStunned = false; // Limpa stun no início do turno
            battleState.turn++;
            updateAllCombatUI();
            endTurnButton.disabled = false;
        }
    }

    function opponentTurnLogic() {
        if (battleState.gamePhase === "game_over" || battleState.opponent.isStunned) {
            if(battleState.opponent.isStunned) logMessage("Oponente está atordoado e não pode jogar.");
            endTurn(); // Passa o turno mesmo se atordoado
            return;
        }
        logMessage("Oponente está pensando...");
        // Lógica simples: Oponente joga a primeira carta que pode pagar, se tiver chakra.
        const opponent = battleState.opponent;
        let cardPlayed = false;
        if (opponent.hand.length > 0) {
            for (let i = 0; i < opponent.hand.length; i++) {
                const card = opponent.hand[i];
                if (opponent.chakra >= card.cost) {
                    opponent.chakra -= card.cost;
                    if (card.cost > 0) showFloatingNumber(-card.cost, "chakra-spent", opponent.chakraFeedback);
                    opponent.hand.splice(i, 1);
                    opponent.discardPile.push(card.id);
                    logMessage(`Oponente usou ${card.name}.`);
                    applyCardEffect(card, "opponent", "player");
                    cardPlayed = true;
                    break; 
                }
            }
        }
        if (!cardPlayed) {
            logMessage("Oponente não jogou nenhuma carta.");
        }
        updateAllCombatUI();
        if (checkWinCondition()) return;
        setTimeout(endTurn, 1500); // Pequeno delay antes de finalizar o turno do oponente
    }

    // --- Event Listeners ---
    endTurnButton.addEventListener("click", () => {
        if (battleState.currentPlayer === "player" && battleState.gamePhase === "player_turn") {
            endTurnButton.disabled = true;
            endTurn();
        }
    });

    restartBattleButton.addEventListener("click", startBattle);
    closeResultsButton.addEventListener("click", () => {
        if (battleResultTitle.textContent === "Vitória!") {
            // Lógica para ir ao menu principal ou próxima fase geral do jogo
            logMessage("Retornando ao menu principal (simulado).");
            battleResultsScreen.classList.remove("visible");
            battleResultsScreen.classList.add("battle-results-screen-hidden");
            // Aqui você poderia redirecionar ou carregar outra parte do jogo
        } else { // Derrota
            startBattle(); // Tentar novamente o mesmo nível/batalha
        }
    });
    nextLevelButton.addEventListener("click", () => {
        logMessage("Iniciando próximo nível (nova batalha).");
        startBattle(); // Inicia uma nova batalha, que servirá como "próximo nível"
    });

    // --- Início do Jogo ---
    startBattle();
});

