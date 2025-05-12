// Naruto Pixel Card Game - Módulo de Combate

document.addEventListener("DOMContentLoaded", () => {
    console.log("Módulo de Combate - Naruto Pixel Card Game iniciado!");

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
            this.defenseBuff = defenseBuff;
            this.defensePercent = defensePercent;
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
            if (this.type === "Defesa") imagePlaceholder = "DEF";
            if (this.type === "Item") imagePlaceholder = "ITM";
            if (this.type === "Buff") imagePlaceholder = "BUF";
            if (this.type === "Debuff") imagePlaceholder = "DEB";
            if (this.type === "Invocação") imagePlaceholder = "INV";
            if (this.type === "Modo") imagePlaceholder = "MOD";

            const currentAttack = this.attack;
            const currentDefense = this.defenseBuff;
            const currentDefensePercent = this.defensePercent > 0 ? Math.round(this.defensePercent * 100) : 0;
            const currentSummonDot = this.summonDotDamage;

            let statsHTML = "";
            if (currentAttack > 0) {
                statsHTML += `<span>Atk: ${currentAttack}${this.critChance > 0 ? ` (${Math.round(this.critChance * 100)}%C)` : ""}</span>`;
            }
            if (currentDefense > 0) {
                statsHTML += `<span>Def: ${currentDefense} (${this.duration}t)</span>`;
            }
            if (currentDefensePercent > 0) {
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
        "jutsu006": { name: "Parede de Lama", type: "Defesa", cost: 20, description: "Ganha 30% de Defesa por 2 turnos.", defensePercent: 0.30, duration: 2 },
        "jutsu008": { name: "Amaterasu", type: "Jutsu", cost: 55, description: "Causa 30 de dano por 3 turnos.", effect: "burn", effectValue: 30, duration: 3 },
        "invoc001": { name: "Invocação: Sapo", type: "Invocação", cost: 30, description: "Causa 15 dano/turno por 3 turnos.", effect: "summon_dot", summonDotDamage: 15, duration: 3 },
        "jutsu012": { name: "Jutsu Médico", type: "Jutsu", cost: 25, description: "Recupera 40 de Vida.", effect: "heal", effectValue: 40 },
        "item001": { name: "Kunai", type: "Item", cost: 5, description: "Causa 10 de dano.", attack: 10 },
        "item002": { name: "Pílula Soldado", type: "Item", cost: 10, description: "Recupera 15 Chakra.", effect: "recover_chakra", effectValue: 15 },
        "buff001": { name: "Força Interior", type: "Buff", cost: 20, description: "+10 Atk próximo Taijutsu.", effect: "buff_next_taijutsu", duration: 1, effectValue: 10 },
        "debuff001": { name: "Redução de Defesa", type: "Debuff", cost: 15, description: "Reduz Def oponente em 20 por 2t.", effect: "reduce_defense", effectValue: 20, duration: 2 },
        "mode001": { name: "Modo Sábio (Sapo)", type: "Modo", cost: 50, description: "+20 Atk, +10 Chakra Regen por 3t.", effect: "stat_boost_regen", boost: { attack: 20 }, regen: { chakra: 10 }, duration: 3 },
        "jutsu018": { name: "Tsukuyomi", type: "Jutsu", cost: 75, description: "Atordoa oponente por 1 turno. Causa 20 dano.", effect: "stun", duration: 1, attack: 20 },
    };

    const battleState = {
        turn: 0,
        currentPlayer: "player",
        gamePhase: "setup",
        player: {
            health: 100, maxHealth: 100, chakra: 50, maxChakra: 50, defense: 0, defensePercent: 0, attackBoost: 0, critChanceBoost: 0, statusEffects: [], deck: [], hand: [], discardPile: [], canPlayCard: true, isStunned: false,
        },
        opponent: {
            health: 100, maxHealth: 100, chakra: 50, maxChakra: 50, defense: 0, defensePercent: 0, attackBoost: 0, critChanceBoost: 0, statusEffects: [], deck: [], hand: [], discardPile: [], canPlayCard: true, isStunned: false,
        }
    };

    // --- Elementos da UI ---
    const playerHealthBarFill = document.getElementById("player-health-bar-fill");
    const playerChakraBarFill = document.getElementById("player-chakra-bar-fill");
    const playerStatusEffectsDisplay = document.getElementById("player-status-effects");
    const playerTempStatsDisplay = document.getElementById("player-temp-stats");
    const playerHandElement = document.getElementById("player-hand");

    const opponentHealthBarFill = document.getElementById("opponent-health-bar-fill");
    const opponentChakraBarFill = document.getElementById("opponent-chakra-bar-fill");
    const opponentStatusEffectsDisplay = document.getElementById("opponent-status-effects");
    const opponentTempStatsDisplay = document.getElementById("opponent-temp-stats");
    const opponentHandElement = document.getElementById("opponent-hand");

    const turnCounterDisplay = document.getElementById("turn-counter");
    const messageLogElement = document.getElementById("message-log");
    const endTurnButton = document.getElementById("end-turn-button");
    const restartBattleButton = document.getElementById("restart-battle-button");

    // --- Funções Auxiliares ---
    function logMessage(message) {
        console.log(message);
        const messageElement = document.createElement("p");
        messageElement.textContent = message;
        if (messageLogElement.children.length > 1 && messageLogElement.firstChild.tagName === "P") {
             messageLogElement.insertBefore(messageElement, messageLogElement.children[1]);
        } else {
             messageLogElement.appendChild(messageElement);
        }
        while (messageLogElement.children.length > 51) { 
            messageLogElement.removeChild(messageLogElement.lastChild);
        }
        messageLogElement.scrollTop = 0;
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
    
    function triggerBarShadow(barElement) {
        if (barElement) {
            barElement.classList.remove("active-shadow");
            void barElement.offsetWidth; // Trigger reflow to restart animation if already playing
            barElement.classList.add("active-shadow");
            setTimeout(() => {
                barElement.classList.remove("active-shadow");
            }, 2000);
        }
    }

    // --- Funções de Atualização da UI ---
    function updatePlayerStatsUI() {
        const player = battleState.player;
        const oldHealthPercent = parseFloat(playerHealthBarFill.style.width) || (player.maxHealth > 0 ? (player.health / player.maxHealth) * 100 : 0); // Initial value if style.width is empty
        const newHealthPercent = player.maxHealth > 0 ? Math.max(0, (player.health / player.maxHealth) * 100) : 0;
        
        if (playerHealthBarFill && Math.abs(oldHealthPercent - newHealthPercent) > 0.01) {
            if(playerHealthBarFill.parentElement) triggerBarShadow(playerHealthBarFill.parentElement);
        }
        playerHealthBarFill.style.width = `${newHealthPercent}%`;

        const oldChakraPercent = parseFloat(playerChakraBarFill.style.width) || (player.maxChakra > 0 ? (player.chakra / player.maxChakra) * 100 : 0);
        const newChakraPercent = player.maxChakra > 0 ? Math.max(0, (player.chakra / player.maxChakra) * 100) : 0;

        if (playerChakraBarFill && Math.abs(oldChakraPercent - newChakraPercent) > 0.01) {
            if(playerChakraBarFill.parentElement) triggerBarShadow(playerChakraBarFill.parentElement);
        }
        playerChakraBarFill.style.width = `${newChakraPercent}%`;
        
        updateStatusEffectsUI(player, playerStatusEffectsDisplay);
        updateTempStatsUI(player, playerTempStatsDisplay);
    }

    function updateOpponentStatsUI() {
        const opponent = battleState.opponent;
        const oldHealthPercent = parseFloat(opponentHealthBarFill.style.width) || (opponent.maxHealth > 0 ? (opponent.health / opponent.maxHealth) * 100 : 0);
        const newHealthPercent = opponent.maxHealth > 0 ? Math.max(0, (opponent.health / opponent.maxHealth) * 100) : 0;

        if (opponentHealthBarFill && Math.abs(oldHealthPercent - newHealthPercent) > 0.01) {
            if(opponentHealthBarFill.parentElement) triggerBarShadow(opponentHealthBarFill.parentElement);
        }
        opponentHealthBarFill.style.width = `${newHealthPercent}%`;

        const oldChakraPercent = parseFloat(opponentChakraBarFill.style.width) || (opponent.maxChakra > 0 ? (opponent.chakra / opponent.maxChakra) * 100 : 0);
        const newChakraPercent = opponent.maxChakra > 0 ? Math.max(0, (opponent.chakra / opponent.maxChakra) * 100) : 0;
        
        if (opponentChakraBarFill && Math.abs(oldChakraPercent - newChakraPercent) > 0.01) {
             if(opponentChakraBarFill.parentElement) triggerBarShadow(opponentChakraBarFill.parentElement);
        }
        opponentChakraBarFill.style.width = `${newChakraPercent}%`;

        updateStatusEffectsUI(opponent, opponentStatusEffectsDisplay);
        updateTempStatsUI(opponent, opponentTempStatsDisplay);
    }

    function updateStatusEffectsUI(target, displayElement) {
        displayElement.innerHTML = "";
        target.statusEffects.forEach(effect => {
            const effectElement = document.createElement("span");
            effectElement.classList.add("status-effect-icon", `effect-${effect.type}`);
            effectElement.title = `${effect.name}: ${effect.description || cardDatabase[effect.sourceCardId]?.description || ""} (${effect.duration}t restantes)`;
            let effectText = effect.name ? effect.name.substring(0, 3).toUpperCase() : "EFF";
            if (effect.type === "buff") effectText = "BUF";
            if (effect.type === "debuff") effectText = "DEB";
            if (effect.type === "dot" || effect.type === "burn" || effect.type === "poison" || effect.type === "summon_dot") effectText = "DoT";
            if (effect.type === "hot") effectText = "HoT";
            if (effect.type === "stun") effectText = "STN";
            if (effect.type === "defense_percent") effectText = "D%";
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
        if (target.defense !== 0) {
            statsText += `<span>Def Fixa: ${target.defense}</span>`;
        }
        if (target.defensePercent !== 0) {
            statsText += `<span>Def %: ${Math.round(target.defensePercent * 100)}%</span>`;
        }
        if (target.critChanceBoost !== 0) {
            statsText += `<span>Crit Boost: +${Math.round(target.critChanceBoost * 100)}%</span>`;
        }
        displayElement.innerHTML = statsText;
    }

    function updateHandUI(playerType) {
        const handElement = playerType === "player" ? playerHandElement : opponentHandElement;
        const target = battleState[playerType];
        handElement.innerHTML = "";
        if (target.hand.length === 0) {
            handElement.innerHTML = `<p>Mão Vazia</p>`;
            return;
        }
        target.hand.forEach((cardInstance, index) => {
            if (playerType === "player") {
                const cardElement = cardInstance.getHTMLElement();
                cardElement.onclick = () => playCardFromHand(cardInstance.id, index);
                handElement.appendChild(cardElement);
            } else {
                const cardBackElement = document.createElement("div");
                cardBackElement.classList.add("card", "card-back");
                cardBackElement.textContent = "???";
                handElement.appendChild(cardBackElement);
            }
        });
    }

    function updateTurnUI() {
        turnCounterDisplay.textContent = battleState.turn;
    }

    function updateAllCombatUI() {
        updatePlayerStatsUI();
        updateOpponentStatsUI();
        updateHandUI("player");
        updateHandUI("opponent");
        updateTurnUI();
    }

    function initializeDeck(targetType) {
        const target = battleState[targetType];
        target.deck = [];
        const allCardIds = Object.keys(cardDatabase);
        for (let i = 0; i < 20; i++) {
            target.deck.push(allCardIds[Math.floor(Math.random() * allCardIds.length)]);
        }
        shuffleArray(target.deck);
    }

    function drawCard(playerType, count = 1) {
        const target = battleState[playerType];
        for (let i = 0; i < count; i++) {
            if (target.deck.length > 0) {
                if (target.hand.length < 7) {
                    const cardId = target.deck.pop();
                    const cardInstance = createCardInstance(cardId);
                    if (cardInstance) {
                        target.hand.push(cardInstance);
                        logMessage(`${playerType === "player" ? "Jogador" : "Oponente"} comprou ${cardInstance.name}.`);
                    }
                } else {
                    logMessage(`${playerType === "player" ? "Jogador" : "Oponente"} não pode comprar mais cartas (mão cheia).`);
                    target.deck.pop();
                }
            } else {
                logMessage(`${playerType === "player" ? "Jogador" : "Oponente"} não tem mais cartas no deck!`);
            }
        }
    }

    function startBattle() {
        logMessage("Nova batalha iniciada!");
        battleState.turn = 1;
        battleState.currentPlayer = "player";
        battleState.gamePhase = "player_turn";
        ["player", "opponent"].forEach(type => {
            const target = battleState[type];
            target.health = 100; target.maxHealth = 100; target.chakra = 50; target.maxChakra = 50;
            target.defense = 0; target.defensePercent = 0; target.attackBoost = 0; target.critChanceBoost = 0;
            target.statusEffects = []; target.hand = []; target.discardPile = [];
            target.isStunned = false; target.canPlayCard = true;
            initializeDeck(type);
            drawCard(type, 3);
        });
        logMessage("Turno do Jogador.");
        endTurnButton.disabled = false;
        updateAllCombatUI();
    }

    function playCardFromHand(cardId, handIndex) {
        const player = battleState.player;
        if (battleState.currentPlayer !== "player" || battleState.gamePhase !== "player_turn" || !player.canPlayCard) {
            logMessage("Não é seu turno ou você não pode jogar cartas agora.");
            return;
        }
        const cardInstance = player.hand[handIndex];
        if (!cardInstance || cardInstance.id !== cardId) {
            logMessage("Carta inválida selecionada.");
            return;
        }
        if (player.chakra < cardInstance.cost) {
            logMessage(`Chakra insuficiente para ${cardInstance.name}. Precisa: ${cardInstance.cost}, Tem: ${player.chakra}`);
            return;
        }
        player.chakra -= cardInstance.cost;
        player.hand.splice(handIndex, 1);
        player.discardPile.push(cardInstance.id);
        logMessage(`Jogador usou ${cardInstance.name}.`);
        applyCardEffect(cardInstance, "player", "opponent");
        updateAllCombatUI();
        checkWinCondition();
    }

    function applyCardEffect(card, casterType, targetType) {
        const caster = battleState[casterType];
        const target = battleState[targetType];
        let actualDamage = 0;
        if (card.attack > 0) {
            let damage = card.attack + caster.attackBoost;
            let isCrit = Math.random() < (card.critChance + caster.critChanceBoost);
            if (isCrit) {
                damage *= 1.5;
                logMessage("Acerto Crítico!");
            }
            damage = Math.round(damage);
            let targetDefense = target.defense;
            let damageReductionPercent = target.defensePercent;
            actualDamage = Math.max(0, damage - targetDefense);
            actualDamage = Math.round(actualDamage * (1 - damageReductionPercent));
            target.health -= actualDamage;
            logMessage(`${card.name} causou ${actualDamage} de dano a ${targetType}.`);
        }
        if (card.defenseBuff > 0) {
            addStatusEffect(casterType, { id: `def_buff_${Date.now()}`, name: `${card.name} Defesa`, type: "buff", description: `+${card.defenseBuff} Defesa`, effect: "increase_defense", value: card.defenseBuff, duration: card.duration, sourceCardId: card.id });
        }
        if (card.defensePercent > 0) {
             addStatusEffect(casterType, { id: `def_percent_buff_${Date.now()}`, name: `${card.name} Defesa %`, type: "defense_percent", description: `+${card.defensePercent*100}% Defesa`, effect: "increase_defense_percent", value: card.defensePercent, duration: card.duration, sourceCardId: card.id });
        }
        switch (card.effect) {
            case "draw_card": drawCard(casterType, card.effectValue || 1); break;
            case "heal":
                caster.health = Math.min(caster.maxHealth, caster.health + (card.effectValue || 0));
                logMessage(`${casterType} recuperou ${card.effectValue || 0} de vida.`);
                break;
            case "recover_chakra":
                caster.chakra = Math.min(caster.maxChakra, caster.chakra + (card.effectValue || 0));
                logMessage(`${casterType} recuperou ${card.effectValue || 0} de chakra.`);
                break;
            case "burn": case "poison": case "summon_dot":
                addStatusEffect(targetType, { id: `${card.effect}_${Date.now()}`, name: card.name, type: "dot", description: `Causa ${card.effectValue || card.summonDotDamage} dano/turno`, effect: card.effect, value: card.effectValue || card.summonDotDamage, duration: card.duration, sourceCardId: card.id });
                break;
            case "stun":
                addStatusEffect(targetType, { id: `stun_${Date.now()}`, name: `${card.name} Stun`, type: "stun", description: "Atordoado", effect: "stun_target", value: null, duration: card.duration, sourceCardId: card.id });
                target.isStunned = true;
                logMessage(`${targetType} está atordoado por ${card.duration} turno(s).`);
                break;
            case "reduce_defense":
                 addStatusEffect(targetType, { id: `reduce_def_${Date.now()}`, name: `${card.name} Red. Def.`, type: "debuff", description: `-${card.effectValue} Defesa`, effect: "decrease_defense", value: card.effectValue, duration: card.duration, sourceCardId: card.id });
                break;
            case "buff_next_taijutsu":
                addStatusEffect(casterType, { id: `buff_taijutsu_${Date.now()}`, name: card.name, type: "buff", description: `+${card.effectValue} Atk no próximo Taijutsu`, effect: "buff_specific_type_attack", value: { type: "Taijutsu", amount: card.effectValue }, duration: card.duration, sourceCardId: card.id });
                break;
            case "stat_boost_regen":
                if (card.boost) {
                    if (card.boost.attack) caster.attackBoost += card.boost.attack;
                }
                if (card.regen) {
                    if (card.regen.chakra) addStatusEffect(casterType, { id: `regen_chakra_${Date.now()}`, name: `${card.name} Regen Chakra`, type: "hot", description: `+${card.regen.chakra} Chakra/turno`, effect: "regen_chakra_per_turn", value: card.regen.chakra, duration: card.duration, sourceCardId: card.id });
                }
                logMessage(`${casterType} ativou ${card.name}.`);
                break;
        }
        recalculateStats(caster);
        recalculateStats(target);
    }

    function addStatusEffect(targetType, effectData) {
        const target = battleState[targetType];
        const existingEffectIndex = target.statusEffects.findIndex(e => e.sourceCardId === effectData.sourceCardId && e.type === effectData.type);
        if (existingEffectIndex !== -1) {
            target.statusEffects[existingEffectIndex].duration = Math.max(target.statusEffects[existingEffectIndex].duration, effectData.duration);
            logMessage(`Efeito ${effectData.name} em ${targetType} teve sua duração renovada.`);
        } else {
            target.statusEffects.push(effectData);
            logMessage(`Efeito ${effectData.name} aplicado em ${targetType} por ${effectData.duration} turno(s).`);
        }
        recalculateStats(target);
    }

    function recalculateStats(targetObject) {
        targetObject.defense = 0; 
        targetObject.defensePercent = 0;
        targetObject.attackBoost = 0; 
        targetObject.critChanceBoost = 0;
        targetObject.statusEffects.forEach(effect => {
            switch (effect.effect) {
                case "increase_defense": targetObject.defense += effect.value; break;
                case "increase_defense_percent": targetObject.defensePercent += effect.value; break;
                case "decrease_defense": targetObject.defense -= effect.value; break;
            }
        });
        targetObject.defense = Math.max(0, targetObject.defense);
        targetObject.defensePercent = Math.max(0, Math.min(1, targetObject.defensePercent));
    }

    function applyStatusEffectsAtTurnEnd(entityType) {
        const entity = battleState[entityType];
        const effectsToRemove = [];
        entity.statusEffects.forEach((effect, index) => {
            switch (effect.effect) {
                case "burn": case "poison": case "summon_dot":
                    entity.health -= effect.value;
                    logMessage(`${entityType} sofreu ${effect.value} de dano de ${effect.name}.`);
                    break;
                case "regen_chakra_per_turn":
                    entity.chakra = Math.min(entity.maxChakra, entity.chakra + effect.value);
                    logMessage(`${entityType} recuperou ${effect.value} de chakra de ${effect.name}.`);
                    break;
            }
            effect.duration--;
            if (effect.duration <= 0) {
                effectsToRemove.push(index);
                if (effect.effect === "stun_target") entity.isStunned = false;
                logMessage(`Efeito ${effect.name} em ${entityType} terminou.`);
            }
        });
        for (let i = effectsToRemove.length - 1; i >= 0; i--) {
            entity.statusEffects.splice(effectsToRemove[i], 1);
        }
        recalculateStats(entity);
        updateAllCombatUI(); // Update UI after status effects are applied and stats recalculated
        checkWinCondition();
    }

    function checkWinCondition() {
        if (battleState.gamePhase === "game_over") return false;
        if (battleState.player.health <= 0) {
            logMessage("Jogador foi derrotado! Oponente venceu!");
            battleState.gamePhase = "game_over";
            endTurnButton.disabled = true;
            return true;
        }
        if (battleState.opponent.health <= 0) {
            logMessage("Oponente foi derrotado! Jogador venceu!");
            battleState.gamePhase = "game_over";
            endTurnButton.disabled = true;
            return true;
        }
        return false;
    }

    function endTurn() {
        if (battleState.gamePhase === "game_over") return;
        logMessage(`Fim do turno de ${battleState.currentPlayer}.`);
        applyStatusEffectsAtTurnEnd(battleState.currentPlayer);
        if (checkWinCondition()) return;
        if (battleState.currentPlayer === "player") {
            battleState.currentPlayer = "opponent";
            battleState.gamePhase = "opponent_turn";
            logMessage("Turno do Oponente.");
            endTurnButton.disabled = true;
            setTimeout(opponentTurn, 1000);
        } else {
            battleState.currentPlayer = "player";
            battleState.gamePhase = "player_turn";
            battleState.turn++;
            logMessage(`Turno ${battleState.turn} do Jogador.`);
            battleState.player.chakra = Math.min(battleState.player.maxChakra, battleState.player.chakra + 10);
            logMessage("Jogador regenerou 10 de Chakra.");
            drawCard("player", 1);
            battleState.player.canPlayCard = true;
            if (battleState.player.isStunned) {
                logMessage("Jogador está atordoado e não pode jogar neste turno!");
                setTimeout(endTurn, 1000);
            } else {
                 endTurnButton.disabled = false;
            }
        }
        updateAllCombatUI(); // Ensure UI is updated at turn change too
    }

    function opponentTurn() {
        if (battleState.gamePhase === "game_over") return;
        logMessage("Oponente está pensando...");
        const opponent = battleState.opponent;
        if (opponent.isStunned) {
            logMessage("Oponente está atordoado e não pode jogar!");
            setTimeout(endTurn, 1000);
            return;
        }
        let cardPlayed = false;
        for (let i = 0; i < opponent.hand.length; i++) {
            const cardInstance = opponent.hand[i];
            if (opponent.chakra >= cardInstance.cost) {
                opponent.chakra -= cardInstance.cost;
                opponent.hand.splice(i, 1);
                opponent.discardPile.push(cardInstance.id);
                logMessage(`Oponente usou ${cardInstance.name}.`);
                applyCardEffect(cardInstance, "opponent", "player");
                cardPlayed = true;
                break; 
            }
        }
        if (!cardPlayed) {
            logMessage("Oponente não jogou nenhuma carta.");
        }
        updateAllCombatUI();
        if (checkWinCondition()) return;
        opponent.chakra = Math.min(opponent.maxChakra, opponent.chakra + 10);
        logMessage("Oponente regenerou 10 de Chakra.");
        drawCard("opponent", 1);
        setTimeout(endTurn, 1500);
    }

    endTurnButton.addEventListener("click", endTurn);
    restartBattleButton.addEventListener("click", startBattle);
    startBattle();
});

