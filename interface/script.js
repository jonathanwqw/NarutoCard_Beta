// Script principal para o Naruto Pixel Card Game

document.addEventListener("DOMContentLoaded", () => {
    console.log("Jogo Naruto Pixel Card Game iniciado e DOM carregado!");

    // --- Variáveis Globais ---
    let shoppingCart = []; // Array para armazenar IDs das cartas no carrinho

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
            if (this.type === "Armadura") imagePlaceholder = "ARM";
            if (this.type === "Arma") imagePlaceholder = "WPN";
            if (this.type === "Modo") imagePlaceholder = "MOD";
            if (this.type === "Material") imagePlaceholder = "MAT";
            if (this.type === "Invocação") imagePlaceholder = "INV";

            const levelMultiplier = 1 + (this.level - 1) * 0.05;
            const currentAttack = this.attack > 0 ? Math.round(this.attack * levelMultiplier) : 0;
            const currentDefense = this.defenseBuff > 0 ? Math.round(this.defenseBuff * levelMultiplier) : 0;
            const currentDefensePercent = this.defensePercent > 0 ? Math.round(this.defensePercent * 100 * levelMultiplier) : 0;
            const currentSummonDot = this.summonDotDamage > 0 ? Math.round(this.summonDotDamage * levelMultiplier) : 0;

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
                <div class="card-name">${this.name} ${this.level > 1 ? `(Lvl ${this.level})` : ""}</div>
                <div class="card-cost">${this.cost > 0 ? this.cost : ""}</div>
                <div class="card-image-placeholder">${imagePlaceholder}</div>
                <div class="card-type">${this.type}</div>
                <div class="card-desc">${this.description}</div>
                <div class="card-stats">
                    ${statsHTML}
                </div>
            `;

            // ADIÇÃO UI/UX: Tooltip para cartas
            cardElement.addEventListener("mouseenter", (event) => {
                const cardInstance = this;
                const levelMultiplierDetailed = 1 + (cardInstance.level - 1) * 0.05;
                const currentAttackDetailed = cardInstance.attack > 0 ? Math.round(cardInstance.attack * levelMultiplierDetailed) : 0;
                const currentDefenseDetailed = cardInstance.defenseBuff > 0 ? Math.round(cardInstance.defenseBuff * levelMultiplierDetailed) : 0;
                const currentDefensePercentDetailed = cardInstance.defensePercent > 0 ? Math.round(cardInstance.defensePercent * 100 * levelMultiplierDetailed) : 0;
                const currentSummonDotDetailed = cardInstance.summonDotDamage > 0 ? Math.round(cardInstance.summonDotDamage * levelMultiplierDetailed) : 0;

                let detailedStatsHTML = "";
                if (currentAttackDetailed > 0) {
                    detailedStatsHTML += `<span>Ataque: ${currentAttackDetailed}${cardInstance.critChance > 0 ? ` (Crítico: ${Math.round(cardInstance.critChance * 100)}%)` : ""}</span>`;
                }
                if (currentDefenseDetailed > 0) {
                    detailedStatsHTML += `<span>Defesa Fixa: ${currentDefenseDetailed} (Duração: ${cardInstance.duration}t)</span>`;
                }
                if (currentDefensePercentDetailed > 0) {
                    detailedStatsHTML += `<span>Defesa %: ${currentDefensePercentDetailed}% (Duração: ${cardInstance.duration}t)</span>`;
                }
                if (cardInstance.effectValue > 0 && (cardInstance.type === "Jutsu" || cardInstance.type === "Item" || cardInstance.type === "Buff" || cardInstance.type === "Debuff")) {
                     detailedStatsHTML += `<span>Valor Efeito: ${cardInstance.effectValue} (Duração: ${cardInstance.duration}t)</span>`;
                }
                if (currentSummonDotDetailed > 0) {
                    detailedStatsHTML += `<span>Dano Invocação: ${currentSummonDotDetailed}/turno (Duração: ${cardInstance.duration}t)</span>`;
                }
                showTooltip(event, `${cardInstance.name} ${cardInstance.level > 1 ? `(Lvl ${cardInstance.level})` : ""}`, cardInstance.description, cardInstance.cost, detailedStatsHTML);
            });
            cardElement.addEventListener("mouseleave", hideTooltip);
            cardElement.addEventListener("mousemove", moveTooltip);
            // FIM ADIÇÃO UI/UX

            cardElement.addEventListener("click", () => {
                console.log(`Tentando jogar a carta: ${this.name} (ID: ${this.id})`);
                playCardFromHand(this.id);
            });
            return cardElement;
        }

        addXP(amount) {
            this.xp += amount;
            const xpToNextLevel = this.level * 100;
            if (this.xp >= xpToNextLevel) {
                this.level++;
                this.xp -= xpToNextLevel;
                console.log(`Carta ${this.name} subiu para o nível ${this.level}!`);
            }
        }
    }

    // --- Base de Dados de Cartas ---
    const cardDatabase = {
        "jutsu001": { name: "Rasengan", type: "Jutsu", element: "Vento", cost: 30, description: "Causa 40 de dano de Vento.", image: "rasengan.png", attack: 40, price: 150 },
        "jutsu002": { name: "Chidori", type: "Jutsu", element: "Raio", cost: 35, description: "Causa 45 de dano de Raio. Chance Crítica: 15%", image: "chidori.png", attack: 45, critChance: 0.15, price: 160 },
        "jutsu003": { name: "Kage Bunshin", type: "Jutsu", element: "Nenhum", cost: 20, description: "Compra 1 carta.", image: "kagebunshin.png", effect: "draw_card", effectValue: 1, price: 80 },
        "jutsu004": { name: "Bola de Fogo", type: "Jutsu", element: "Fogo", cost: 25, description: "Causa 35 de dano de Fogo.", image: "fireball.png", attack: 35, price: 100 },
        "taijutsu001": { name: "Chute Dinâmico", type: "Taijutsu", element: "Nenhum", cost: 10, description: "Causa 20 de dano físico.", image: "dynamic_kick.png", attack: 20, price: 50 },
        "taijutsu002": { name: "Rajada Leões", type: "Taijutsu", element: "Nenhum", cost: 15, description: "Causa 25 de dano físico.", image: "lion_barrage.png", attack: 25, price: 60 },
        "jutsu005": { name: "Dragão de Água", type: "Jutsu", element: "Água", cost: 40, description: "Causa 50 de dano de Água.", image: "water_dragon.png", attack: 50, price: 180 },
        "jutsu006": { name: "Parede de Lama", type: "Defesa", element: "Terra", cost: 20, description: "Ganha 30% de Defesa por 2 turnos.", image: "mud_wall.png", defensePercent: 0.30, duration: 2, price: 100 },
        "jutsu007": { name: "Rasenshuriken", type: "Jutsu", element: "Vento", cost: 60, description: "Causa 70 de dano de Vento. Ignora defesa.", image: "rasenshuriken.png", attack: 70, effect: "ignore_defense", price: 300 },
        "jutsu008": { name: "Amaterasu", type: "Jutsu", element: "Fogo", cost: 55, description: "Causa 30 de dano de Fogo por 3 turnos.", image: "amaterasu.png", effect: "burn", effectValue: 30, duration: 3, price: 280 },
        "jutsu009": { name: "Susanoo Ribcage", type: "Defesa", element: "Nenhum", cost: 50, description: "Bloqueia todo o dano no próximo turno.", image: "susanoo_rib.png", effect: "block_all_damage", duration: 1, price: 250 },
        "jutsu010": { name: "Kamui (Short Range)", type: "Jutsu", element: "Nenhum", cost: 70, description: "Remove uma carta aleatória da mão inimiga.", image: "kamui_short.png", effect: "opponent_discard", effectValue: 1, price: 350 }, 
        "taijutsu003": { name: "Lótus Primária", type: "Taijutsu", element: "Nenhum", cost: 40, description: "Causa 60 de dano físico. Causa 10 de dano a si mesmo.", image: "primary_lotus.png", attack: 60, effect: "self_damage", effectValue: 10, price: 180 },
        "invoc001": { name: "Invocação: Sapo", type: "Invocação", element: "Nenhum", cost: 30, description: "Invoca Gamabunta. Causa 15 de dano por 3 turnos ao oponente.", image: "summon_toad.png", effect: "summon_dot", summonDotDamage: 15, duration: 3, price: 140 },
        "jutsu012": { name: "Jutsu Médico", type: "Jutsu", element: "Nenhum", cost: 25, description: "Recupera 40 de Vida.", image: "medical_jutsu.png", effect: "heal", effectValue: 40, price: 100 },
        "jutsu013": { name: "Genjutsu: Sharingan", type: "Jutsu", element: "Nenhum", cost: 30, description: "Oponente descarta 1 carta aleatória.", image: "genjutsu_sharingan.png", effect: "opponent_discard", effectValue: 1, price: 120 },
        "jutsu014": { name: "Liberação de Vento: Grande Brecha", type: "Jutsu", element: "Vento", cost: 35, description: "Causa 40 de dano de Vento.", image: "wind_great_breach.png", attack: 40, price: 150 }, 
        "jutsu015": { name: "Liberação de Terra: Lança de Pedra", type: "Jutsu", element: "Terra", cost: 30, description: "Causa 40 de dano de Terra.", image: "earth_spear.png", attack: 40, price: 130 },
        "jutsu016": { name: "Liberação de Raio: Pantera Negra", type: "Jutsu", element: "Raio", cost: 45, description: "Causa 55 de dano de Raio.", image: "lightning_panther.png", attack: 55, price: 200 },
        "jutsu017": { name: "Liberação de Água: Tubarão Bomba", type: "Jutsu", element: "Água", cost: 40, description: "Causa 50 de dano de Água.", image: "water_shark_bomb.png", attack: 50, price: 180 },
        "item001": { name: "Kunai", type: "Item", item_subtype: "Arma", cost: 5, description: "Causa 10 de dano físico.", image: "kunai.png", attack: 10, price: 20 },
        "item002": { name: "Pílula Soldado", type: "Item", item_subtype: "Consumível", cost: 10, description: "Recupera 15 Chakra.", image: "soldier_pill.png", effect: "recover_chakra", effectValue: 15, price: 30 },
        "item003": { name: "Shuriken", type: "Item", item_subtype: "Arma", cost: 8, description: "Causa 12 de dano físico.", image: "shuriken.png", attack: 12, price: 25 },
        "item004": { name: "Bomba de Fumaça", type: "Item", item_subtype: "Consumível", cost: 10, description: "Reduz o próximo ataque inimigo em 50%.", image: "smoke_bomb.png", effect: "reduce_next_enemy_attack_percent", effectValue: 0.5, duration: 1, price: 40 },
        "item005": { name: "Papel Bomba", type: "Item", item_subtype: "Arma", cost: 15, description: "Causa 25 de dano de Fogo.", image: "paper_bomb.png", attack: 25, element: "Fogo", price: 50 },
        "item006": { name: "Bandagem", type: "Item", item_subtype: "Consumível", cost: 5, description: "Recupera 10 de Vida.", image: "bandage.png", effect: "heal", effectValue: 10, price: 15 },
        "item007": { name: "Veneno", type: "Item", item_subtype: "Consumível", cost: 20, description: "Aplica veneno (5 dano/turno) por 3 turnos.", image: "poison.png", effect: "poison", effectValue: 5, duration: 3, price: 60 },
        "item008": { name: "Antídoto", type: "Item", item_subtype: "Consumível", cost: 10, description: "Remove efeitos negativos (Veneno, Queimadura, Invocação).", image: "antidote.png", effect: "remove_debuffs", price: 35 },
        "armor001": { name: "Colete Chūnin", type: "Armadura", item_subtype: "Armadura", slot: "Peito", cost: 0, description: "Equipamento: +20 Vida Máx. Reduz dano recebido em 10%.", image: "chunin_vest.png", effect: "equip_passive", equip_effect: "increase_max_health_and_defense_percent", effectValue: { health: 20, defensePercent: 0.10 }, price: 0 },
        "armor002": { name: "Protetor Testa (Folha)", type: "Armadura", item_subtype: "Armadura", slot: "Cabeça", cost: 0, description: "Equipamento: +5 Defesa base.", image: "forehead_protector.png", effect: "equip_passive", equip_effect: "increase_base_defense", effectValue: 5, price: 0 },
        "weapon001": { name: "Espada Kusanagi", type: "Arma", item_subtype: "Arma", slot: "Ferramenta1", cost: 0, description: "Equipamento: +10 Ataque base.", image: "kusanagi.png", effect: "equip_passive", equip_effect: "increase_base_attack", effectValue: 10, price: 0 },
        "item009": { name: "Pergaminho Selado", type: "Item", item_subtype: "Consumível", cost: 25, description: "Compra 2 cartas.", image: "sealed_scroll.png", effect: "draw_card", effectValue: 2, price: 70 },
        "item010": { name: "Pílula Chakra", type: "Item", item_subtype: "Consumível", cost: 30, description: "Recupera 50 Chakra.", image: "chakra_pill.png", effect: "recover_chakra", effectValue: 50, price: 80 },
        "buff001": { name: "Força Interior", type: "Buff", element: "Nenhum", cost: 20, description: "+10 Ataque no próximo Taijutsu.", image: "inner_strength.png", effect: "buff_next_taijutsu", duration: 1, effectValue: 10, price: 75 },
        "debuff001": { name: "Redução de Defesa", type: "Debuff", element: "Nenhum", cost: 15, description: "Reduz a defesa do oponente em 20 por 2 turnos.", image: "defense_down.png", effect: "reduce_defense", effectValue: 20, duration: 2, price: 65 },
        "mode001": { name: "Modo Sábio (Sapo)", type: "Modo", element: "Nenhum", cost: 50, description: "+20 Ataque e +10 Chakra Regen por 3 turnos.", image: "sage_mode_toad.png", effect: "stat_boost_regen", boost: { attack: 20 }, regen: { chakra: 10 }, duration: 3, price: 260 },
        "mode002": { name: "Oito Portões (Portão 1)", type: "Modo", element: "Nenhum", cost: 30, description: "+30 Ataque Taijutsu por 2 turnos. Causa 5 dano/turno.", image: "gate_1.png", effect: "stat_boost_self_dmg", boost: { taijutsu_attack: 30 }, self_dmg: 5, duration: 2, price: 190 },
        "buff002": { name: "Concentração de Chakra", type: "Buff", element: "Nenhum", cost: 10, description: "Próximo Jutsu custa 10 Chakra a menos.", image: "chakra_focus.png", effect: "reduce_next_jutsu_cost", effectValue: 10, duration: 1, price: 45 },
        "debuff002": { name: "Lentidão", type: "Debuff", element: "Nenhum", cost: 15, description: "Oponente compra 1 carta a menos no próximo turno.", image: "slow.png", effect: "opponent_draw_less", effectValue: 1, duration: 1, price: 55 },
        "mode003": { name: "Manto de Chakra (1 Cauda)", type: "Modo", element: "Nenhum", cost: 40, description: "+15 Ataque, +15 Defesa por 3 turnos.", image: "chakra_cloak_1.png", effect: "stat_boost", boost: { attack: 15, defense: 15 }, duration: 3, price: 220 },
        "buff003": { name: "Visão Sharingan", type: "Buff", element: "Nenhum", cost: 25, description: "+20% Chance Crítica por 2 turnos.", image: "sharingan_vision.png", effect: "increase_crit_chance", effectValue: 0.20, duration: 2, price: 110 },
        "debuff003": { name: "Confusão", type: "Debuff", element: "Nenhum", cost: 20, description: "50% chance do ataque inimigo falhar no próximo turno.", image: "confusion.png", effect: "enemy_attack_fail_chance", effectValue: 0.5, duration: 1, price: 85 },
        "mode004": { name: "Byakugan", type: "Modo", element: "Nenhum", cost: 30, description: "Revela a mão do oponente por 1 turno. +10% Acerto.", image: "byakugan.png", effect: "reveal_hand_accuracy_boost", boost: { accuracy: 0.10 }, duration: 1, price: 140 },
        "jutsu018": { name: "Tsukuyomi", type: "Jutsu", element: "Nenhum", cost: 75, description: "Atordoa o oponente por 1 turno. Causa 20 dano.", image: "tsukuyomi.png", effect: "stun", duration: 1, attack: 20, price: 320 },
        "jutsu019": { name: "Chidori Senbon", type: "Jutsu", element: "Raio", cost: 25, description: "Causa 30 de dano Piercing.", image: "placeholder.png", attack: 30, effect: "piercing_attack", price: 130 },
        "jutsu020": { name: "Chidori Sharp Spear", type: "Jutsu", element: "Raio", cost: 35, description: "Causa 45 de dano Piercing. Ignora 5 de Defesa.", image: "placeholder.png", attack: 45, effect: "ignore_defense_value", effectValue: 5, price: 170 },
        "jutsu021": { name: "Chidori Nagashi", type: "Jutsu", element: "Raio", cost: 40, description: "Causa 20 de dano a todos inimigos. (Não implementado)", image: "placeholder.png", attack: 20, effect: "area_attack", price: 190 },
        "material001": { name: "Erva Medicinal", type: "Material", description: "Usada para criar itens de cura.", price: 5 },
        "material002": { name: "Fragmento de Metal", type: "Material", description: "Usado para criar armas e armaduras.", price: 10 },
        "material003": { name: "Pó de Chakra", type: "Material", description: "Usado para encantar equipamentos ou criar jutsus.", price: 15 }
    };

    // --- Perfil do Jogador e Estado do Jogo ---
    const playerProfile = {
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        currency: 500,
        cardCollection: {
            "jutsu001": { quantity: 2, level: 1, xp: 0 },
            "taijutsu001": { quantity: 3, level: 1, xp: 0 },
            "item001": { quantity: 5, level: 1, xp: 0 },
            "item002": { quantity: 3, level: 1, xp: 0 },
            "jutsu004": { quantity: 2, level: 1, xp: 0 },
            "armor001": { quantity: 1, level: 1, xp: 0 },
            "weapon001": { quantity: 1, level: 1, xp: 0 },
            "material001": { quantity: 10, level: 1, xp: 0 }
        },
        deck: [],
        equippedArmor: {
            Cabeça: "armor002",
            Peito: "armor001",
            Pernas: null,
            Pés: null,
            Acessório1: null,
            Acessório2: null
        },
        equippedTools: {
            Ferramenta1: "weapon001",
            Ferramenta2: null,
            Ferramenta3: null
        },
        materials: {
            "material001": 10,
        },
        chests: {
            "common_chest": 1
        }
    };

    function initializePlayerDeck() {
        playerProfile.deck = [];
        for (const cardId in playerProfile.cardCollection) {
            const cardData = cardDatabase[cardId];
            if (cardData && cardData.type !== "Material" && cardData.type !== "Armadura" && cardData.type !== "Arma" && cardData.type !== "Modo") {
                const quantityInDeck = Math.min(playerProfile.cardCollection[cardId].quantity, 3);
                for (let i = 0; i < quantityInDeck; i++) {
                    playerProfile.deck.push(cardId);
                }
            }
        }
        while (playerProfile.deck.length < 20 && playerProfile.deck.length > 0) {
             playerProfile.deck.push(playerProfile.deck[Math.floor(Math.random() * playerProfile.deck.length)]);
        }
         console.log("Deck inicial do jogador:", playerProfile.deck);
    }
    initializePlayerDeck();

    const battleState = {
        turn: 0,
        currentPlayer: null, 
        gamePhase: "setup", 
        player: {
            health: 0,
            maxHealth: 0,
            chakra: 0,
            maxChakra: 0,
            defense: 0, 
            defensePercent: 0, 
            attackBoost: 0,
            critChanceBoost: 0,
            statusEffects: [], 
            deck: [],
            hand: [], 
            discardPile: [],
        },
        opponent: {
            health: 0,
            maxHealth: 0,
            chakra: 0,
            maxChakra: 0,
            defense: 0,
            defensePercent: 0,
            attackBoost: 0,
            critChanceBoost: 0,
            statusEffects: [],
            deck: [],
            hand: [],
            discardPile: [],
        }
    };

    // --- Elementos da UI ---
    const gameContainer = document.getElementById("game-container");
    const playerProfileDisplay = document.getElementById("player-profile-display");
    const playerLevelDisplay = document.getElementById("player-level");
    const playerXpDisplay = document.getElementById("player-xp");
    const playerCurrencyDisplay = document.getElementById("player-currency");
    const battleStatusContainer = document.getElementById("battle-status-container");
    const playerStatusSide = document.getElementById("player-status-side");
    const playerHealthDisplay = document.getElementById("player-health");
    const playerMaxHealthDisplay = document.getElementById("player-max-health");
    const playerHealthBarFill = document.getElementById("player-health-bar-fill");
    const playerChakraDisplay = document.getElementById("player-chakra");
    const playerMaxChakraDisplay = document.getElementById("player-max-chakra");
    const playerChakraBarFill = document.getElementById("player-chakra-bar-fill");
    const playerStatusEffectsDisplay = document.getElementById("player-status-effects");
    const playerTempStatsDisplay = document.getElementById("player-temp-stats");
    const playerHandElement = document.getElementById("player-hand");
    const opponentStatusSide = document.getElementById("opponent-status-side");
    const opponentHealthDisplay = document.getElementById("opponent-health");
    const opponentMaxHealthDisplay = document.getElementById("opponent-max-health");
    const opponentHealthBarFill = document.getElementById("opponent-health-bar-fill");
    const opponentChakraDisplay = document.getElementById("opponent-chakra");
    const opponentMaxChakraDisplay = document.getElementById("opponent-max-chakra");
    const opponentChakraBarFill = document.getElementById("opponent-chakra-bar-fill");
    const opponentStatusEffectsDisplay = document.getElementById("opponent-status-effects");
    const opponentTempStatsDisplay = document.getElementById("opponent-temp-stats");
    const opponentHandElement = document.getElementById("opponent-hand");
    const gameBoardElement = document.getElementById("game-board");
    const turnCounterDisplay = document.getElementById("turn-counter");
    const messageLogElement = document.getElementById("message-log");
    const endTurnButton = document.getElementById("end-turn-button");
    const gameAreaSection = document.getElementById("game-area");
    const inventorySection = document.getElementById("inventory-area");
    const shopSection = document.getElementById("shop-area");
    const equipmentSection = document.getElementById("equipment-area");
    const craftSection = document.getElementById("craft-area");
    const chestsSection = document.getElementById("chests-area");
    const inventoryDisplay = document.getElementById("inventory-display");
    const shopDisplay = document.getElementById("shop-display");
    const cartItemsElement = document.getElementById("cart-items");
    const cartTotalElement = document.getElementById("cart-total");
    const finalizePurchaseButton = document.getElementById("finalize-purchase-button");

    // ADIÇÃO UI/UX: Botão Limpar Log
    const clearLogButton = document.getElementById("clear-log-button");
    if (clearLogButton) {
        clearLogButton.addEventListener("click", () => {
            if (messageLogElement) {
                const logTitle = messageLogElement.querySelector("p"); // Preserva o título
                messageLogElement.innerHTML = "";
                if(logTitle) messageLogElement.appendChild(logTitle);
                logMessage("Log de batalha limpo.");
            }
        });
    }
    // FIM ADIÇÃO UI/UX

    // ADIÇÃO UI/UX: Tooltip Management
    let tooltipElement;
    function createTooltip() {
        if (!tooltipElement) {
            tooltipElement = document.createElement("div");
            tooltipElement.classList.add("custom-tooltip");
            document.body.appendChild(tooltipElement);
        }
    }
    createTooltip(); 

    function showTooltip(event, title, description, cost, statsHTML) {
        if (!tooltipElement) createTooltip();
        
        let content = `<h4>${title}</h4>`;
        if (cost !== undefined && cost !== null && cost !== "") {
            content += `<p class="tooltip-cost">Custo: ${cost}</p>`;
        }
        content += `<p>${description}</p>`;
        if (statsHTML) {
            content += `<div class="tooltip-stats">${statsHTML}</div>`;
        }

        tooltipElement.innerHTML = content;
        tooltipElement.classList.add("visible");
        moveTooltip(event); // Position it immediately
    }

    function hideTooltip() {
        if (tooltipElement) {
            tooltipElement.classList.remove("visible");
        }
    }

    function moveTooltip(event) {
        if (tooltipElement && tooltipElement.classList.contains("visible")) {
            const PADDING = 15;
            let x = event.pageX + PADDING;
            let y = event.pageY + PADDING;
            const tooltipRect = tooltipElement.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            if (x + tooltipRect.width > viewportWidth - PADDING) {
                x = event.pageX - tooltipRect.width - PADDING;
            }
            if (y + tooltipRect.height > viewportHeight - PADDING) {
                y = event.pageY - tooltipRect.height - PADDING;
            }
            
            tooltipElement.style.left = `${x}px`;
            tooltipElement.style.top = `${y}px`;
        }
    }
    // FIM ADIÇÃO UI/UX

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

    function createCardInstance(cardId, level = 1, xp = 0) {
        const cardData = cardDatabase[cardId];
        if (!cardData) {
            console.error(`Dados não encontrados para a carta ID: ${cardId}`);
            return null;
        }
        const cardInstance = new Card(
            cardId,
            cardData.name,
            cardData.type,
            cardData.cost,
            cardData.description,
            cardData.image,
            cardData.attack,
            cardData.defenseBuff,
            cardData.effect,
            cardData.duration,
            cardData.critChance,
            cardData.effectValue,
            cardData.defensePercent, 
            cardData.summonDotDamage 
        );
        cardInstance.level = level;
        cardInstance.xp = xp;
        return cardInstance;
    }

    // --- Funções de Atualização da UI ---
    function updatePlayerProfileUI() {
        if (!playerProfileDisplay) return;
        playerLevelDisplay.textContent = playerProfile.level;
        playerXpDisplay.textContent = `${playerProfile.xp} / ${playerProfile.xpToNextLevel}`;
        playerCurrencyDisplay.textContent = playerProfile.currency;
    }

    function updatePlayerStatsUI() {
        if (!playerStatusSide) return;
        const player = battleState.player;
        playerHealthDisplay.textContent = player.health;
        playerMaxHealthDisplay.textContent = player.maxHealth;
        playerHealthBarFill.style.width = `${Math.max(0, (player.health / player.maxHealth) * 100)}%`;
        playerChakraDisplay.textContent = player.chakra;
        playerMaxChakraDisplay.textContent = player.maxChakra;
        playerChakraBarFill.style.width = `${Math.max(0, (player.chakra / player.maxChakra) * 100)}%`;
        updateStatusEffectsUI(player, playerStatusEffectsDisplay);
        updateTempStatsUI(player, playerTempStatsDisplay);
    }

    function updateOpponentStatsUI() {
        if (!opponentStatusSide) return;
        const opponent = battleState.opponent;
        opponentHealthDisplay.textContent = opponent.health;
        opponentMaxHealthDisplay.textContent = opponent.maxHealth;
        opponentHealthBarFill.style.width = `${Math.max(0, (opponent.health / opponent.maxHealth) * 100)}%`;
        opponentChakraDisplay.textContent = opponent.chakra;
        opponentMaxChakraDisplay.textContent = opponent.maxChakra;
        opponentChakraBarFill.style.width = `${Math.max(0, (opponent.chakra / opponent.maxChakra) * 100)}%`;
        updateStatusEffectsUI(opponent, opponentStatusEffectsDisplay);
        updateTempStatsUI(opponent, opponentTempStatsDisplay);
    }

    function updateStatusEffectsUI(target, displayElement) {
        if (!displayElement) return;
        displayElement.innerHTML = ""; 
        target.statusEffects.forEach(effect => {
            const effectElement = document.createElement("span");
            effectElement.classList.add("status-effect-icon", `effect-${effect.type}`);
            
            let effectText = effect.name.substring(0, 3).toUpperCase();
            if (effect.type === "buff") effectText = "BUF";
            if (effect.type === "debuff") effectText = "DEB";
            if (effect.type === "dot") effectText = "DoT"; 
            if (effect.type === "hot") effectText = "HoT"; 
            if (effect.type === "stun") effectText = "STN";
            if (effect.type === "defense_percent") effectText = "D%"; 

            effectElement.textContent = `${effectText}(${effect.duration})`;
            displayElement.appendChild(effectElement);

            // ADIÇÃO UI/UX: Tooltip para status effects
            effectElement.addEventListener("mouseenter", (event) => {
                let effectDesc = cardDatabase[effect.sourceCardId]?.description || effect.name;
                if (effect.type === "dot" || effect.type === "hot" || effect.type === "summon_dot") {
                    effectDesc += ` Valor: ${effect.value}/turno.`;
                } else if (effect.value && typeof effect.value === "number" && effect.value !== 0) {
                    effectDesc += ` Valor: ${effect.value}.`;
                } else if (typeof effect.value === "object" && effect.value !== null) {
                    effectDesc += ` Detalhes: ${JSON.stringify(effect.value)}`;
                }
                effectDesc += ` Duração restante: ${effect.duration}t.`;
                showTooltip(event, effect.name, effectDesc);
            });
            effectElement.addEventListener("mouseleave", hideTooltip);
            effectElement.addEventListener("mousemove", moveTooltip);
            // FIM ADIÇÃO UI/UX
        });
    }

    function updateTempStatsUI(target, displayElement) {
        if (!displayElement) return;
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
        const player = battleState[playerType];
        if (!handElement) return;
        handElement.innerHTML = ""; 

        if (player.hand.length === 0) {
            handElement.innerHTML = `<p>Mão ${playerType === "player" ? "Jogador" : "Oponente"} Vazia</p>`;
            return;
        }

        player.hand.forEach((cardInstance, index) => {
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
        if (!turnCounterDisplay) return;
        turnCounterDisplay.textContent = battleState.turn;
    }

    // --- Lógica de Abas (Inventário, Loja, Equipamentos, Crafting, Baús) ---
    function displayInventory() {
        if (!inventoryDisplay) return;
        inventoryDisplay.innerHTML = "";
        logMessage("Exibindo inventário...");

        const categories = { "Jutsu": [], "Taijutsu": [], "Defesa": [], "Item": [], "Buff": [], "Debuff": [], "Modo": [], "Armadura": [], "Arma": [], "Invocação": [], "Material": [] };

        for (const cardId in playerProfile.cardCollection) {
            const cardData = cardDatabase[cardId];
            const collectionInfo = playerProfile.cardCollection[cardId];
            if (cardData && collectionInfo.quantity > 0) {
                if (categories[cardData.type]) {
                    categories[cardData.type].push({ id: cardId, data: cardData, info: collectionInfo });
                } else {
                    console.warn(`Tipo de carta desconhecido no inventário: ${cardData.type}`);
                }
            }
        }

        for (const categoryName in categories) {
            if (categories[categoryName].length > 0) {
                const categoryContainer = document.createElement("div");
                categoryContainer.classList.add("inventory-category");
                categoryContainer.innerHTML = `<h3>${categoryName}</h3>`;
                const itemsContainer = document.createElement("div");
                itemsContainer.classList.add("inventory-items");
                categoryContainer.appendChild(itemsContainer);

                categories[categoryName].sort((a, b) => a.data.name.localeCompare(b.data.name));

                categories[categoryName].forEach(item => {
                    const cardInstance = createCardInstance(item.id, item.info.level, item.info.xp);
                    const cardElement = cardInstance.getHTMLElement();
                    cardElement.onclick = null; 
                    const quantityDisplay = document.createElement("div");
                    quantityDisplay.classList.add("card-quantity");
                    quantityDisplay.textContent = `x${item.info.quantity}`;
                    cardElement.appendChild(quantityDisplay);
                    itemsContainer.appendChild(cardElement);
                });
                inventoryDisplay.appendChild(categoryContainer);
            }
        }
        if (inventoryDisplay.innerHTML === "") {
            inventoryDisplay.innerHTML = "<p>Seu inventário está vazio.</p>";
        }
    }

    function displayShop() {
        if (!shopDisplay) return;
        shopDisplay.innerHTML = "";
        logMessage("Exibindo loja...");
        updateShopCurrencyDisplay();

        const availableItems = [];
        for (const cardId in cardDatabase) {
            const cardData = cardDatabase[cardId];
            if (cardData.price && cardData.price > 0 && cardData.type !== "Material") { // Materiais não são vendidos por padrão
                availableItems.push({ id: cardId, data: cardData });
            }
        }
        availableItems.sort((a,b) => a.data.name.localeCompare(b.data.name));

        availableItems.forEach(item => {
            const cardInstance = createCardInstance(item.id);
            const shopItemElement = document.createElement("div");
            shopItemElement.classList.add("shop-item");

            const cardElement = cardInstance.getHTMLElement();
            cardElement.onclick = null; // Remover listener de jogar carta
            // Adicionar listener para tooltip na loja
            cardElement.addEventListener("mouseenter", (event) => {
                const cInst = cardInstance; // Captura a instância correta
                const levelMultiplierDetailed = 1 + (cInst.level - 1) * 0.05;
                const currentAttackDetailed = cInst.attack > 0 ? Math.round(cInst.attack * levelMultiplierDetailed) : 0;
                const currentDefenseDetailed = cInst.defenseBuff > 0 ? Math.round(cInst.defenseBuff * levelMultiplierDetailed) : 0;
                const currentDefensePercentDetailed = cInst.defensePercent > 0 ? Math.round(cInst.defensePercent * 100 * levelMultiplierDetailed) : 0;
                const currentSummonDotDetailed = cInst.summonDotDamage > 0 ? Math.round(cInst.summonDotDamage * levelMultiplierDetailed) : 0;
                let detailedStatsHTML = "";
                if (currentAttackDetailed > 0) detailedStatsHTML += `<span>Ataque: ${currentAttackDetailed}${cInst.critChance > 0 ? ` (Crítico: ${Math.round(cInst.critChance * 100)}%)` : ""}</span>`;
                if (currentDefenseDetailed > 0) detailedStatsHTML += `<span>Defesa Fixa: ${currentDefenseDetailed} (Duração: ${cInst.duration}t)</span>`;
                if (currentDefensePercentDetailed > 0) detailedStatsHTML += `<span>Defesa %: ${currentDefensePercentDetailed}% (Duração: ${cInst.duration}t)</span>`;
                if (cInst.effectValue > 0 && (cInst.type === "Jutsu" || cInst.type === "Item" || cInst.type === "Buff" || cInst.type === "Debuff")) detailedStatsHTML += `<span>Valor Efeito: ${cInst.effectValue} (Duração: ${cInst.duration}t)</span>`;
                if (currentSummonDotDetailed > 0) detailedStatsHTML += `<span>Dano Invocação: ${currentSummonDotDetailed}/turno (Duração: ${cInst.duration}t)</span>`;
                showTooltip(event, `${cInst.name}`, cInst.description, cInst.cost, detailedStatsHTML);
            });
            cardElement.addEventListener("mouseleave", hideTooltip);
            cardElement.addEventListener("mousemove", moveTooltip);

            const priceElement = document.createElement("p");
            priceElement.classList.add("shop-item-price");
            priceElement.textContent = `${item.data.price} Moedas`;

            const buyButton = document.createElement("button");
            buyButton.classList.add("game-button", "buy-button");
            buyButton.textContent = "Comprar";
            buyButton.onclick = () => addItemToCart(item.id);

            shopItemElement.appendChild(cardElement);
            shopItemElement.appendChild(priceElement);
            shopItemElement.appendChild(buyButton);
            shopDisplay.appendChild(shopItemElement);
        });

        if (shopDisplay.innerHTML === "") {
            shopDisplay.innerHTML = "<p>A loja está vazia no momento.</p>";
        }
        updateCartUI(); // Atualiza o carrinho ao exibir a loja
    }

    function updateShopCurrencyDisplay() {
        const shopCurrencyElement = document.getElementById("shop-currency");
        if (shopCurrencyElement) {
            shopCurrencyElement.textContent = `Moedas: ${playerProfile.currency}`;
        } else {
            // Criar o elemento se não existir (para garantir)
            const currencyP = document.createElement("p");
            currencyP.id = "shop-currency";
            currencyP.textContent = `Moedas: ${playerProfile.currency}`;
            const shopContainer = document.getElementById("shop-container");
            if (shopContainer) {
                shopContainer.insertBefore(currencyP, shopContainer.firstChild);
            }
        }
    }

    function addItemToCart(cardId) {
        const cardData = cardDatabase[cardId];
        if (!cardData) {
            logMessage("Erro: Carta não encontrada na loja.");
            return;
        }
        // Limitar a 1 item por vez no carrinho para simplificar, ou implementar quantidade
        if (shoppingCart.includes(cardId)) {
            logMessage(`${cardData.name} já está no carrinho.`);
            return;
        }
        shoppingCart.push(cardId);
        logMessage(`${cardData.name} adicionado ao carrinho.`);
        updateCartUI();
    }

    function removeItemFromCart(cardId) {
        const index = shoppingCart.indexOf(cardId);
        if (index > -1) {
            const cardData = cardDatabase[cardId];
            shoppingCart.splice(index, 1);
            logMessage(`${cardData.name} removido do carrinho.`);
            updateCartUI();
        }
    }

    function updateCartUI() {
        if (!cartItemsElement || !cartTotalElement) return;
        cartItemsElement.innerHTML = "";
        let totalCost = 0;

        if (shoppingCart.length === 0) {
            cartItemsElement.innerHTML = "<p>Seu carrinho está vazio.</p>";
        } else {
            shoppingCart.forEach(cardId => {
                const cardData = cardDatabase[cardId];
                if (cardData) {
                    const cartItemDiv = document.createElement("div");
                    cartItemDiv.classList.add("cart-item");
                    cartItemDiv.innerHTML = `
                        <span>${cardData.name}</span>
                        <span>${cardData.price} Moedas</span>
                    `;
                    const removeBtn = document.createElement("button");
                    removeBtn.classList.add("remove-cart-item-btn");
                    removeBtn.textContent = "X";
                    removeBtn.title = "Remover do carrinho";
                    removeBtn.onclick = () => removeItemFromCart(cardId);
                    cartItemDiv.appendChild(removeBtn);
                    cartItemsElement.appendChild(cartItemDiv);
                    totalCost += cardData.price;
                }
            });
        }
        cartTotalElement.textContent = `Total: ${totalCost} Moedas`;
        finalizePurchaseButton.disabled = shoppingCart.length === 0 || totalCost > playerProfile.currency;
    }

    function finalizePurchase() {
        let totalCost = 0;
        shoppingCart.forEach(cardId => {
            const cardData = cardDatabase[cardId];
            if (cardData) totalCost += cardData.price;
        });

        if (totalCost > playerProfile.currency) {
            logMessage("Moedas insuficientes para finalizar a compra.");
            return;
        }
        if (shoppingCart.length === 0) {
            logMessage("Carrinho vazio.");
            return;
        }

        playerProfile.currency -= totalCost;
        shoppingCart.forEach(cardId => {
            if (!playerProfile.cardCollection[cardId]) {
                playerProfile.cardCollection[cardId] = { quantity: 0, level: 1, xp: 0 };
            }
            playerProfile.cardCollection[cardId].quantity++;
            logMessage(`Você comprou ${cardDatabase[cardId].name}!`);
        });

        shoppingCart = [];
        updateCartUI();
        updatePlayerProfileUI();
        updateShopCurrencyDisplay();
        logMessage("Compra finalizada com sucesso!");
        initializePlayerDeck(); // Atualiza o deck caso novas cartas sejam compradas
    }

    function displayEquipment() {
        const equipmentContent = document.getElementById("equipment-content") || createSectionContent("equipment-area", "equipment-content");
        equipmentContent.innerHTML = ""; // Limpa conteúdo anterior
        logMessage("Exibindo equipamentos...");

        const slotsContainer = document.createElement("div");
        slotsContainer.id = "equipment-slots";
        slotsContainer.innerHTML = "<h4>Equipado</h4>";

        // Slots de Armadura
        for (const slot in playerProfile.equippedArmor) {
            const slotDiv = document.createElement("div");
            slotDiv.classList.add("equipment-slot-display");
            let cardElement = "<span>Vazio</span>";
            const equippedCardId = playerProfile.equippedArmor[slot];
            if (equippedCardId && cardDatabase[equippedCardId]) {
                const cardInstance = createCardInstance(equippedCardId, playerProfile.cardCollection[equippedCardId]?.level || 1);
                cardElement = cardInstance.getHTMLElement();
                cardElement.onclick = () => unequipItem("armor", slot);
                cardElement.style.cursor = "pointer";
            }
            slotDiv.innerHTML = `<b>${slot}:</b>`;
            slotDiv.appendChild(typeof cardElement === "string" ? document.createRange().createContextualFragment(cardElement) : cardElement);
            slotsContainer.appendChild(slotDiv);
        }

        // Slots de Ferramentas/Armas
        for (const slot in playerProfile.equippedTools) {
            const slotDiv = document.createElement("div");
            slotDiv.classList.add("equipment-slot-display");
            let cardElement = "<span>Vazio</span>";
            const equippedCardId = playerProfile.equippedTools[slot];
            if (equippedCardId && cardDatabase[equippedCardId]) {
                const cardInstance = createCardInstance(equippedCardId, playerProfile.cardCollection[equippedCardId]?.level || 1);
                cardElement = cardInstance.getHTMLElement();
                cardElement.onclick = () => unequipItem("tool", slot);
                cardElement.style.cursor = "pointer";
            }
            slotDiv.innerHTML = `<b>${slot}:</b>`;
            slotDiv.appendChild(typeof cardElement === "string" ? document.createRange().createContextualFragment(cardElement) : cardElement);
            slotsContainer.appendChild(slotDiv);
        }

        const inventoryContainer = document.createElement("div");
        inventoryContainer.id = "equipment-inventory";
        inventoryContainer.innerHTML = "<h4>Inventário de Equipáveis</h4>";
        const equippableItemsDiv = document.createElement("div");

        for (const cardId in playerProfile.cardCollection) {
            const cardData = cardDatabase[cardId];
            const collectionInfo = playerProfile.cardCollection[cardId];
            if (cardData && (cardData.type === "Armadura" || cardData.type === "Arma") && collectionInfo.quantity > 0) {
                // Verifica se o item já está equipado
                let isEquipped = false;
                for(const slot in playerProfile.equippedArmor) {
                    if(playerProfile.equippedArmor[slot] === cardId) isEquipped = true;
                }
                for(const slot in playerProfile.equippedTools) {
                    if(playerProfile.equippedTools[slot] === cardId) isEquipped = true;
                }
                // Só mostra no inventário de equipáveis se não estiver equipado ou se tiver mais de 1
                if (!isEquipped || collectionInfo.quantity > Object.values(playerProfile.equippedArmor).filter(id => id === cardId).length + Object.values(playerProfile.equippedTools).filter(id => id === cardId).length ) {
                    const cardInstance = createCardInstance(cardId, collectionInfo.level, collectionInfo.xp);
                    const cardElement = cardInstance.getHTMLElement();
                    cardElement.onclick = () => equipItem(cardId);
                    cardElement.style.cursor = "pointer";
                    equippableItemsDiv.appendChild(cardElement);
                }
            }
        }
        if(equippableItemsDiv.innerHTML === "") equippableItemsDiv.innerHTML = "<p>Nenhum item equipável disponível.</p>";
        inventoryContainer.appendChild(equippableItemsDiv);

        equipmentContent.appendChild(slotsContainer);
        equipmentContent.appendChild(inventoryContainer);
    }

    function equipItem(cardId) {
        const cardData = cardDatabase[cardId];
        if (!cardData || (cardData.type !== "Armadura" && cardData.type !== "Arma")) return;

        const targetSlotType = cardData.type === "Armadura" ? playerProfile.equippedArmor : playerProfile.equippedTools;
        const slotName = cardData.slot; // Ex: "Peito", "Ferramenta1"

        if (targetSlotType.hasOwnProperty(slotName)) {
            if (targetSlotType[slotName] === cardId) {
                logMessage(`${cardData.name} já está equipado neste slot.`);
                return;
            }
            // Desequipa item antigo, se houver
            if (targetSlotType[slotName]) {
                unequipItem(cardData.type.toLowerCase(), slotName, false); // false para não dar refresh duplo
            }
            targetSlotType[slotName] = cardId;
            logMessage(`${cardData.name} equipado no slot ${slotName}.`);
            applyEquipmentEffects();
            displayEquipment(); // Refresh UI
            updatePlayerStatsUI(); // Atualiza stats de combate
        } else {
            logMessage(`Slot ${slotName} inválido para ${cardData.name}.`);
        }
    }

    function unequipItem(type, slotName, refreshUI = true) {
        const targetSlotType = type === "armor" ? playerProfile.equippedArmor : playerProfile.equippedTools;
        if (targetSlotType.hasOwnProperty(slotName) && targetSlotType[slotName]) {
            const cardId = targetSlotType[slotName];
            const cardData = cardDatabase[cardId];
            targetSlotType[slotName] = null;
            logMessage(`${cardData.name} desequipado do slot ${slotName}.`);
            applyEquipmentEffects(); // Recalcula efeitos
            if (refreshUI) {
                displayEquipment();
                updatePlayerStatsUI();
            }
        }
    }

    function applyEquipmentEffects() {
        // Reseta bônus de equipamento antes de recalcular
        battleState.player.maxHealth -= battleState.player.equipmentHealthBonus || 0;
        battleState.player.health = Math.min(battleState.player.health, battleState.player.maxHealth);
        battleState.player.equipmentHealthBonus = 0;
        battleState.player.equipmentAttackBonus = 0;
        battleState.player.equipmentDefenseBonus = 0;
        battleState.player.equipmentDefensePercentBonus = 0;

        let totalHealthBonus = 0;
        let totalAttackBonus = 0;
        let totalDefenseBonus = 0;
        let totalDefensePercentBonus = 0;

        const processEquip = (cardId) => {
            const cardData = cardDatabase[cardId];
            if (cardData && cardData.effect === "equip_passive" && cardData.equip_effect) {
                switch (cardData.equip_effect) {
                    case "increase_max_health_and_defense_percent":
                        if (cardData.effectValue.health) totalHealthBonus += cardData.effectValue.health;
                        if (cardData.effectValue.defensePercent) totalDefensePercentBonus += cardData.effectValue.defensePercent;
                        break;
                    case "increase_base_defense":
                        if (cardData.effectValue) totalDefenseBonus += cardData.effectValue;
                        break;
                    case "increase_base_attack":
                        if (cardData.effectValue) totalAttackBonus += cardData.effectValue;
                        break;
                    // Adicionar mais casos conforme necessário
                }
            }
        };

        for (const slot in playerProfile.equippedArmor) {
            if (playerProfile.equippedArmor[slot]) processEquip(playerProfile.equippedArmor[slot]);
        }
        for (const slot in playerProfile.equippedTools) {
            if (playerProfile.equippedTools[slot]) processEquip(playerProfile.equippedTools[slot]);
        }

        battleState.player.equipmentHealthBonus = totalHealthBonus;
        battleState.player.maxHealth += totalHealthBonus;
        battleState.player.health += totalHealthBonus; // Aumenta vida atual também, ou apenas maxHealth?
        battleState.player.equipmentAttackBonus = totalAttackBonus;
        battleState.player.equipmentDefenseBonus = totalDefenseBonus;
        battleState.player.equipmentDefensePercentBonus = totalDefensePercentBonus;

        // Atualiza stats base do jogador para combate
        battleState.player.maxHealth = 100 + (battleState.player.equipmentHealthBonus || 0); // Assumindo 100 base
        battleState.player.health = Math.min(battleState.player.health, battleState.player.maxHealth);
        // Os bônus de ataque e defesa serão somados aos buffs temporários durante o cálculo de dano/defesa

        console.log("Efeitos de equipamento aplicados:", battleState.player);
        updatePlayerStatsUI();
        updatePlayerProfileUI();
    }

    function displayCrafting() {
        const craftContent = document.getElementById("craft-content") || createSectionContent("craft-area", "craft-content");
        craftContent.innerHTML = "";
        logMessage("Exibindo área de Crafting...");

        // Exemplo de receita (placeholder)
        const recipeExample = {
            id: "recipe001",
            resultCardId: "item006", // Bandagem
            resultQuantity: 2,
            materialsNeeded: { "material001": 3 }, // 3 Ervas Medicinais
            description: "Cria 2 Bandagens usando 3 Ervas Medicinais."
        };

        const recipeElement = document.createElement("div");
        recipeElement.classList.add("crafting-recipe");
        const resultCardInstance = createCardInstance(recipeExample.resultCardId);
        let materialsHtml = "<ul>";
        for (const matId in recipeExample.materialsNeeded) {
            materialsHtml += `<li>${recipeExample.materialsNeeded[matId]}x ${cardDatabase[matId].name}</li>`;
        }
        materialsHtml += "</ul>";

        recipeElement.innerHTML = `
            <h4>Criar: ${resultCardInstance.name} (x${recipeExample.resultQuantity})</h4>
            <div class="card-display-craft"></div>
            <p>Materiais Necessários:</p>
            ${materialsHtml}
            <p>${recipeExample.description}</p>
            <button class="game-button craft-button" data-recipe-id="${recipeExample.id}">Criar</button>
        `;
        recipeElement.querySelector(".card-display-craft").appendChild(resultCardInstance.getHTMLElement());
        craftContent.appendChild(recipeElement);

        // Mostrar materiais do jogador
        const playerMatsDiv = document.createElement("div");
        playerMatsDiv.id = "player-materials";
        playerMatsDiv.innerHTML = "<h4>Seus Materiais</h4><ul>";
        for (const matId in playerProfile.materials) {
            if (playerProfile.materials[matId] > 0) {
                playerMatsDiv.innerHTML += `<li>${cardDatabase[matId].name}: ${playerProfile.materials[matId]}</li>`;
            }
        }
        if (Object.keys(playerProfile.materials).every(k => playerProfile.materials[k] === 0)) {
            playerMatsDiv.innerHTML += "<li>Nenhum material.</li>";
        }
        playerMatsDiv.innerHTML += "</ul>";
        craftContent.appendChild(playerMatsDiv);

        craftContent.querySelectorAll(".craft-button").forEach(button => {
            button.addEventListener("click", (e) => {
                const recipeId = e.target.dataset.recipeId;
                // Lógica de craft (placeholder)
                if (recipeId === "recipe001") {
                    if (playerProfile.materials["material001"] >= 3) {
                        playerProfile.materials["material001"] -= 3;
                        if (!playerProfile.cardCollection["item006"]) {
                            playerProfile.cardCollection["item006"] = { quantity: 0, level: 1, xp: 0 };
                        }
                        playerProfile.cardCollection["item006"].quantity += 2;
                        logMessage("Você criou 2x Bandagem!");
                        displayCrafting(); // Refresh UI
                        initializePlayerDeck();
                    } else {
                        logMessage("Materiais insuficientes para criar Bandagem.");
                    }
                }
            });
        });

        if (craftContent.innerHTML.includes("crafting-recipe") === false) {
             craftContent.innerHTML = "<p>Nenhuma receita de craft disponível no momento.</p>";
        }
    }

    function displayChests() {
        const chestsContent = document.getElementById("chests-content") || createSectionContent("chests-area", "chests-content");
        chestsContent.innerHTML = "";
        logMessage("Exibindo Baús...");

        if (Object.keys(playerProfile.chests).every(key => playerProfile.chests[key] === 0)) {
            chestsContent.innerHTML = "<p>Você não possui baús.</p>";
            return;
        }

        for (const chestId in playerProfile.chests) {
            if (playerProfile.chests[chestId] > 0) {
                const chestData = { // Placeholder de dados do baú
                    name: "Baú Comum",
                    description: "Contém cartas e itens comuns.",
                    id: "common_chest"
                };
                const chestElement = document.createElement("div");
                chestElement.classList.add("chest-item");
                chestElement.innerHTML = `
                    <h4>${chestData.name} (x${playerProfile.chests[chestId]})</h4>
                    <p>${chestData.description}</p>
                    <button class="game-button open-chest-button" data-chest-id="${chestId}">Abrir 1</button>
                `;
                chestsContent.appendChild(chestElement);
            }
        }

        chestsContent.querySelectorAll(".open-chest-button").forEach(button => {
            button.addEventListener("click", (e) => {
                const chestId = e.target.dataset.chestId;
                if (playerProfile.chests[chestId] > 0) {
                    playerProfile.chests[chestId]--;
                    // Lógica de recompensa (placeholder)
                    const rewardCardId = Object.keys(cardDatabase)[Math.floor(Math.random() * 5)]; // Pega uma das 5 primeiras cartas
                    const rewardCardData = cardDatabase[rewardCardId];
                    if (!playerProfile.cardCollection[rewardCardId]) {
                        playerProfile.cardCollection[rewardCardId] = { quantity: 0, level: 1, xp: 0 };
                    }
                    playerProfile.cardCollection[rewardCardId].quantity++;
                    logMessage(`Você abriu um Baú Comum e encontrou: ${rewardCardData.name}!`);
                    displayChests(); // Refresh UI
                    initializePlayerDeck();
                } else {
                    logMessage("Você não tem mais deste baú.");
                }
            });
        });
    }

    // Helper para criar conteúdo de seção se não existir
    function createSectionContent(areaId, contentId) {
        const area = document.getElementById(areaId);
        if (!area) return null;
        let content = document.getElementById(contentId);
        if (!content) {
            content = document.createElement("div");
            content.id = contentId;
            // Adiciona estilos básicos se necessário, ou assume que o CSS já cobre
            if (areaId === "equipment-area") content.style.display = "flex"; // Exemplo
            area.appendChild(content);
        }
        return content;
    }

    // --- Lógica de Navegação entre Abas ---
    const navButtons = document.querySelectorAll(".nav-button");
    const gameSections = document.querySelectorAll(".game-section");

    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            navButtons.forEach(btn => btn.classList.remove("active"));
            gameSections.forEach(section => section.classList.remove("active-section"));

            button.classList.add("active");
            const targetSectionId = button.id.replace("nav-", "") + "-area";
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add("active-section");
                // Carrega conteúdo dinâmico da aba
                if (targetSectionId === "inventory-area") displayInventory();
                if (targetSectionId === "shop-area") displayShop();
                if (targetSectionId === "equipment-area") displayEquipment();
                if (targetSectionId === "craft-area") displayCrafting();
                if (targetSectionId === "chests-area") displayChests();
            }
        });
    });

    // --- Lógica Principal do Jogo (Combate) ---
    function startGame() {
        logMessage("Novo jogo iniciado! Preparando o combate...");
        battleState.turn = 1;
        battleState.currentPlayer = "player";
        battleState.gamePhase = "player_turn";

        // Resetar e configurar jogador
        battleState.player.maxHealth = 100; // Base
        battleState.player.health = battleState.player.maxHealth;
        battleState.player.maxChakra = 50; // Base
        battleState.player.chakra = battleState.player.maxChakra;
        battleState.player.defense = 0;
        battleState.player.defensePercent = 0;
        battleState.player.attackBoost = 0;
        battleState.player.critChanceBoost = 0;
        battleState.player.statusEffects = [];
        battleState.player.deck = [...playerProfile.deck];
        shuffleArray(battleState.player.deck);
        battleState.player.hand = [];
        battleState.player.discardPile = [];
        applyEquipmentEffects(); // Aplica bônus de equipamento no início

        // Configurar oponente (IA simples)
        battleState.opponent.maxHealth = 100;
        battleState.opponent.health = battleState.opponent.maxHealth;
        battleState.opponent.maxChakra = 50;
        battleState.opponent.chakra = battleState.opponent.maxChakra;
        battleState.opponent.defense = 0;
        battleState.opponent.defensePercent = 0;
        battleState.opponent.attackBoost = 0;
        battleState.opponent.critChanceBoost = 0;
        battleState.opponent.statusEffects = [];
        // Oponente com deck simples de cartas básicas
        battleState.opponent.deck = ["jutsu004", "taijutsu001", "item001", "jutsu001", "taijutsu002", "item003", "jutsu004", "taijutsu001", "item001", "jutsu001", "taijutsu002", "item003", "jutsu004", "taijutsu001", "item001", "jutsu001", "taijutsu002", "item003", "jutsu004", "taijutsu001"];
        shuffleArray(battleState.opponent.deck);
        battleState.opponent.hand = [];
        battleState.opponent.discardPile = [];

        // Comprar cartas iniciais
        drawCards("player", 5);
        drawCards("opponent", 5);

        updateAllUI();
        logMessage(`Turno ${battleState.turn} - Vez do Jogador.`);
        endTurnButton.disabled = false;
        removeRestartButton();
    }

    function drawCards(playerType, count) {
        const player = battleState[playerType];
        for (let i = 0; i < count; i++) {
            if (player.deck.length === 0) {
                if (player.discardPile.length === 0) {
                    logMessage(`${playerType === "player" ? "Jogador" : "Oponente"} não tem mais cartas para comprar.`);
                    break;
                }
                logMessage(`${playerType === "player" ? "Jogador" : "Oponente"} embaralhou o descarte no deck.`);
                player.deck = [...player.discardPile];
                player.discardPile = [];
                shuffleArray(player.deck);
            }
            if (player.deck.length > 0) {
                const cardId = player.deck.pop();
                const cardInstance = createCardInstance(cardId, playerProfile.cardCollection[cardId]?.level || 1, playerProfile.cardCollection[cardId]?.xp || 0);
                if (cardInstance) {
                    player.hand.push(cardInstance);
                }
            }
        }
        if (playerType === "player") updateHandUI("player");
        else updateHandUI("opponent"); // Atualiza a contagem de cartas do oponente (verso)
    }

    function playCardFromHand(cardId, handIndex) {
        if (battleState.currentPlayer !== "player" || battleState.gamePhase !== "player_turn") {
            logMessage("Não é sua vez de jogar cartas.");
            return;
        }

        const cardInstance = battleState.player.hand.find(c => c.id === cardId && battleState.player.hand.indexOf(c) === handIndex);
        if (!cardInstance) {
            logMessage("Carta não encontrada na mão.");
            return;
        }

        if (battleState.player.chakra < cardInstance.cost) {
            logMessage("Chakra insuficiente para jogar esta carta.");
            return;
        }

        battleState.player.chakra -= cardInstance.cost;
        logMessage(`Jogador usou ${cardInstance.name}.`);
        applyCardEffect(cardInstance, "player", "opponent"); 

        // Mover carta da mão para o descarte
        battleState.player.hand.splice(handIndex, 1);
        battleState.player.discardPile.push(cardInstance.id); // Salva ID no descarte

        // Adicionar XP à carta jogada
        if (playerProfile.cardCollection[cardInstance.id]) {
            playerProfile.cardCollection[cardInstance.id].xp += 10; // Ex: 10 XP por uso
            const currentCardInfo = playerProfile.cardCollection[cardInstance.id];
            const xpToNextLevel = currentCardInfo.level * 100;
            if (currentCardInfo.xp >= xpToNextLevel) {
                currentCardInfo.level++;
                currentCardInfo.xp -= xpToNextLevel;
                logMessage(`Sua carta ${cardInstance.name} subiu para o nível ${currentCardInfo.level}!`);
            }
        }

        updateAllUI();
        checkGameOver();
    }

    function applyCardEffect(cardInstance, casterType, targetType) {
        const caster = battleState[casterType];
        const target = battleState[targetType];
        let damageDealt = 0;
        let actualCritChance = (cardInstance.critChance || 0) + caster.critChanceBoost;
        let isCrit = Math.random() < actualCritChance;

        // Bônus de ataque de equipamento e buffs temporários
        let totalAttackBonus = (caster.equipmentAttackBonus || 0) + caster.attackBoost;
        if (cardInstance.type === "Taijutsu" && caster.statusEffects.some(e => e.effect === "buff_next_taijutsu")) {
            const buff = caster.statusEffects.find(e => e.effect === "buff_next_taijutsu");
            totalAttackBonus += buff.value;
            removeStatusEffect(caster, buff.id);
        }

        let finalAttack = cardInstance.attack ? cardInstance.attack + totalAttackBonus : 0;
        if (isCrit && finalAttack > 0) {
            finalAttack = Math.round(finalAttack * 1.5); // Dano crítico +50%
            logMessage("Acerto Crítico!");
        }

        // Aplica ataque da carta, se houver
        if (finalAttack > 0) {
            let defenseToConsider = target.defense + (target.equipmentDefenseBonus || 0);
            let defensePercentToConsider = target.defensePercent + (target.equipmentDefensePercentBonus || 0);
            let damageReduction = defenseToConsider;
            let damageAfterFixedDefense = Math.max(0, finalAttack - damageReduction);
            let finalDamage = Math.max(0, Math.round(damageAfterFixedDefense * (1 - defensePercentToConsider)));

            if (cardInstance.effect === "ignore_defense") {
                finalDamage = finalAttack;
                logMessage("Ataque ignorou a defesa!");
            } else if (cardInstance.effect === "ignore_defense_value") {
                defenseToConsider = Math.max(0, defenseToConsider - cardInstance.effectValue);
                damageReduction = defenseToConsider;
                damageAfterFixedDefense = Math.max(0, finalAttack - damageReduction);
                finalDamage = Math.max(0, Math.round(damageAfterFixedDefense * (1 - defensePercentToConsider)));
                logMessage(`Ataque ignorou ${cardInstance.effectValue} de defesa!`);
            }
            
            // Efeito de Bomba de Fumaça
            const smokeBombEffect = target.statusEffects.find(e => e.effect === "reduce_next_enemy_attack_percent" && e.sourcePlayer !== casterType);
            if (smokeBombEffect) {
                logMessage(`Ataque reduzido em ${smokeBombEffect.value * 100}% pela Bomba de Fumaça!`);
                finalDamage = Math.round(finalDamage * (1 - smokeBombEffect.value));
                removeStatusEffect(target, smokeBombEffect.id);
            }

            target.health -= finalDamage;
            damageDealt = finalDamage;
            logMessage(`${cardInstance.name} causou ${finalDamage} de dano em ${targetType === "player" ? "Jogador" : "Oponente"}.`);
        }

        // Aplica outros efeitos da carta
        if (cardInstance.effect) {
            switch (cardInstance.effect) {
                case "heal":
                    caster.health = Math.min(caster.maxHealth, caster.health + cardInstance.effectValue);
                    logMessage(`${casterType === "player" ? "Jogador" : "Oponente"} recuperou ${cardInstance.effectValue} de Vida.`);
                    break;
                case "recover_chakra":
                    caster.chakra = Math.min(caster.maxChakra, caster.chakra + cardInstance.effectValue);
                    logMessage(`${casterType === "player" ? "Jogador" : "Oponente"} recuperou ${cardInstance.effectValue} de Chakra.`);
                    break;
                case "draw_card":
                    logMessage(`${casterType === "player" ? "Jogador" : "Oponente"} comprou ${cardInstance.effectValue} carta(s).`);
                    drawCards(casterType, cardInstance.effectValue);
                    break;
                case "buff_next_taijutsu":
                case "reduce_next_jutsu_cost":
                case "increase_crit_chance":
                    addStatusEffect(caster, cardInstance.name, "buff", cardInstance.effect, cardInstance.effectValue, cardInstance.duration, cardInstance.id);
                    break;
                case "reduce_defense":
                case "opponent_draw_less":
                case "enemy_attack_fail_chance":
                    addStatusEffect(target, cardInstance.name, "debuff", cardInstance.effect, cardInstance.effectValue, cardInstance.duration, cardInstance.id);
                    break;
                case "burn":
                case "poison":
                    addStatusEffect(target, cardInstance.name, "dot", cardInstance.effect, cardInstance.effectValue, cardInstance.duration, cardInstance.id);
                    break;
                case "summon_dot": // Para invocações que causam dano por turno
                    addStatusEffect(target, cardInstance.name, "summon_dot", cardInstance.effect, cardInstance.summonDotDamage, cardInstance.duration, cardInstance.id);
                    break;
                case "block_all_damage":
                    addStatusEffect(caster, cardInstance.name, "buff", cardInstance.effect, 1, cardInstance.duration, cardInstance.id);
                    break;
                case "opponent_discard":
                    if (target.hand.length > 0) {
                        const discardedIndex = Math.floor(Math.random() * target.hand.length);
                        const discardedCard = target.hand.splice(discardedIndex, 1)[0];
                        target.discardPile.push(discardedCard.id);
                        logMessage(`${targetType === "player" ? "Jogador" : "Oponente"} descartou ${discardedCard.name}.`);
                        if (targetType === "player") updateHandUI("player"); else updateHandUI("opponent");
                    }
                    break;
                case "self_damage":
                    caster.health -= cardInstance.effectValue;
                    logMessage(`${casterType === "player" ? "Jogador" : "Oponente"} sofreu ${cardInstance.effectValue} de dano colateral.`);
                    break;
                case "stat_boost_regen":
                case "stat_boost_self_dmg":
                case "stat_boost":
                case "reveal_hand_accuracy_boost":
                    addStatusEffect(caster, cardInstance.name, "buff", cardInstance.effect, cardInstance.boost || {}, cardInstance.duration, cardInstance.id, { regen: cardInstance.regen, self_dmg: cardInstance.self_dmg });
                    break;
                case "stun":
                    addStatusEffect(target, cardInstance.name, "stun", cardInstance.effect, 1, cardInstance.duration, cardInstance.id);
                    break;
                case "remove_debuffs":
                    caster.statusEffects = caster.statusEffects.filter(se => se.type === "buff" || (se.type === "dot" && se.sourcePlayer === casterType)); // Remove debuffs e DoTs inimigos
                    logMessage(`${casterType === "player" ? "Jogador" : "Oponente"} removeu efeitos negativos.`);
                    break;
                case "reduce_next_enemy_attack_percent": // Bomba de Fumaça
                    addStatusEffect(target, cardInstance.name, "debuff", cardInstance.effect, cardInstance.effectValue, cardInstance.duration, cardInstance.id, { sourcePlayer: casterType });
                    break;
            }
        }

        // Aplica defesa da carta, se houver (efeito temporário)
        if (cardInstance.defenseBuff > 0 || cardInstance.defensePercent > 0) {
            const effectType = cardInstance.defensePercent > 0 ? "defense_percent" : "defense_fixed";
            const effectValue = cardInstance.defensePercent > 0 ? cardInstance.defensePercent : cardInstance.defenseBuff;
            addStatusEffect(caster, cardInstance.name, effectType, "temp_defense", effectValue, cardInstance.duration, cardInstance.id);
        }
    }

    function addStatusEffect(target, name, type, effect, value, duration, sourceCardId, extraParams = {}) {
        const existingEffect = target.statusEffects.find(e => e.effect === effect && e.sourceCardId === sourceCardId);
        if (existingEffect && (type === "dot" || type === "hot" || type === "summon_dot")) { // Stack duration for DoTs/HoTs from same source
            existingEffect.duration += duration;
            logMessage(`Efeito ${name} em ${target === battleState.player ? "Jogador" : "Oponente"} teve duração estendida.`);
        } else {
            const newEffect = {
                id: `status_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                name: name,
                type: type, // buff, debuff, dot, hot, stun, defense_percent, defense_fixed, summon_dot
                effect: effect,
                value: value,
                duration: duration,
                sourceCardId: sourceCardId,
                initialDuration: duration,
                ...extraParams // regen, self_dmg, sourcePlayer
            };
            target.statusEffects.push(newEffect);
            logMessage(`Efeito ${name} aplicado em ${target === battleState.player ? "Jogador" : "Oponente"} por ${duration} turno(s).`);
        }
        // Aplicar imediatamente bônus de stats de modos ou buffs diretos
        applyInstantStatBoostsFromStatus(target, effect, value);
    }

    function applyInstantStatBoostsFromStatus(target, effectKey, boostValue) {
        if (effectKey === "stat_boost" || effectKey === "stat_boost_regen" || effectKey === "stat_boost_self_dmg" || effectKey === "reveal_hand_accuracy_boost") {
            if (boostValue.attack) target.attackBoost += boostValue.attack;
            if (boostValue.defense) target.defense += boostValue.defense; // Defesa fixa
            if (boostValue.taijutsu_attack) target.attackBoost += boostValue.taijutsu_attack; // Assumindo que se aplica ao attackBoost geral por simplicidade
            if (boostValue.accuracy) target.critChanceBoost += boostValue.accuracy; // Usando critChanceBoost para "acerto"
        }
        if (effectKey === "increase_crit_chance") {
            target.critChanceBoost += boostValue;
        }
        if (effectKey === "temp_defense") {
            if (typeof boostValue === "number" && boostValue < 1) { // Percentual
                target.defensePercent = Math.min(0.95, target.defensePercent + boostValue); // Cap em 95%
            } else { // Fixo
                target.defense += boostValue;
            }
        }
    }

    function removeInstantStatBoostsFromStatus(target, effectKey, boostValue) {
        if (effectKey === "stat_boost" || effectKey === "stat_boost_regen" || effectKey === "stat_boost_self_dmg" || effectKey === "reveal_hand_accuracy_boost") {
            if (boostValue.attack) target.attackBoost -= boostValue.attack;
            if (boostValue.defense) target.defense -= boostValue.defense;
            if (boostValue.taijutsu_attack) target.attackBoost -= boostValue.taijutsu_attack;
            if (boostValue.accuracy) target.critChanceBoost -= boostValue.accuracy;
        }
        if (effectKey === "increase_crit_chance") {
            target.critChanceBoost -= boostValue;
        }
        if (effectKey === "temp_defense") {
             if (typeof boostValue === "number" && boostValue < 1) { // Percentual
                target.defensePercent = Math.max(0, target.defensePercent - boostValue);
            } else { // Fixo
                target.defense = Math.max(0, target.defense - boostValue);
            }
        }
        // Garante que não fiquem negativos por algum erro
        target.attackBoost = Math.max(0, target.attackBoost);
        target.defense = Math.max(0, target.defense);
        target.defensePercent = Math.max(0, target.defensePercent);
        target.critChanceBoost = Math.max(0, target.critChanceBoost);
    }

    function processStatusEffects(playerType) {
        const player = battleState[playerType];
        const opponent = playerType === "player" ? battleState.opponent : battleState.player;
        const effectsToRemove = [];

        player.statusEffects.forEach(effect => {
            // Aplicar DoTs, HoTs, Self Damage, Regen
            if (effect.type === "dot" || effect.effect === "burn" || effect.effect === "poison") {
                player.health -= effect.value;
                logMessage(`${playerType === "player" ? "Jogador" : "Oponente"} sofreu ${effect.value} de dano de ${effect.name}.`);
            }
            if (effect.type === "summon_dot") { // Dano de invocação
                player.health -= effect.value;
                logMessage(`${playerType === "player" ? "Jogador" : "Oponente"} sofreu ${effect.value} de dano da invocação ${effect.name}.`);
            }
            if (effect.type === "hot") {
                player.health = Math.min(player.maxHealth, player.health + effect.value);
                logMessage(`${playerType === "player" ? "Jogador" : "Oponente"} recuperou ${effect.value} de Vida de ${effect.name}.`);
            }
            if (effect.effect === "stat_boost_self_dmg" && effect.self_dmg) {
                player.health -= effect.self_dmg;
                logMessage(`${playerType === "player" ? "Jogador" : "Oponente"} sofreu ${effect.self_dmg} de dano de ${effect.name}.`);
            }
            if (effect.effect === "stat_boost_regen" && effect.regen && effect.regen.chakra) {
                player.chakra = Math.min(player.maxChakra, player.chakra + effect.regen.chakra);
                logMessage(`${playerType === "player" ? "Jogador" : "Oponente"} regenerou ${effect.regen.chakra} de Chakra de ${effect.name}.`);
            }

            effect.duration--;
            if (effect.duration <= 0) {
                effectsToRemove.push(effect.id);
                logMessage(`Efeito ${effect.name} terminou para ${playerType === "player" ? "Jogador" : "Oponente"}.`);
                // Remover bônus de stats se o efeito terminou
                removeInstantStatBoostsFromStatus(player, effect.effect, effect.value);
            }
        });

        effectsToRemove.forEach(id => removeStatusEffect(player, id));
    }

    function removeStatusEffect(target, effectId) {
        const index = target.statusEffects.findIndex(e => e.id === effectId);
        if (index > -1) {
            const effect = target.statusEffects[index];
            // Se era um buff/debuff de stat que não foi removido na expiração (ex: stun), remove agora
            if (effect.duration > 0) { // Garante que só removemos o bônus se não foi por expiração
                 removeInstantStatBoostsFromStatus(target, effect.effect, effect.value);
            }
            target.statusEffects.splice(index, 1);
        }
    }

    function endTurn() {
        if (battleState.gamePhase === "game_over") return;

        logMessage(`Turno do ${battleState.currentPlayer === "player" ? "Jogador" : "Oponente"} finalizado.`);
        processStatusEffects(battleState.currentPlayer); // Processa efeitos no final do turno do jogador atual

        if (checkGameOver()) return;

        if (battleState.currentPlayer === "player") {
            battleState.currentPlayer = "opponent";
            battleState.gamePhase = "opponent_turn";
            logMessage(`Turno ${battleState.turn} - Vez do Oponente.`);
            // Lógica da IA do oponente
            setTimeout(opponentTurn, 1000); // Pequeno delay para simular pensamento
        } else {
            battleState.currentPlayer = "player";
            battleState.gamePhase = "player_turn";
            battleState.turn++;
            // Regeneração passiva de chakra no início do turno do jogador (exemplo)
            battleState.player.chakra = Math.min(battleState.player.maxChakra, battleState.player.chakra + 5);
            battleState.opponent.chakra = Math.min(battleState.opponent.maxChakra, battleState.opponent.chakra + 5);
            logMessage(`Turno ${battleState.turn} - Vez do Jogador.`);
            let cardsToDraw = 1;
            // Efeito de lentidão
            const slowEffect = battleState.player.statusEffects.find(e => e.effect === "opponent_draw_less");
            if (slowEffect) {
                cardsToDraw = Math.max(0, cardsToDraw - slowEffect.value);
                // Não remove o efeito aqui, ele é baseado em duração
            }
            drawCards("player", cardsToDraw);
        }
        updateAllUI();
    }

    function opponentTurn() {
        if (battleState.gamePhase === "game_over") return;
        logMessage("Oponente está pensando...");

        // IA Simples: Tenta jogar a primeira carta jogável da mão
        let cardPlayed = false;
        for (let i = 0; i < battleState.opponent.hand.length; i++) {
            const cardInstance = battleState.opponent.hand[i];
            if (battleState.opponent.chakra >= cardInstance.cost) {
                // Lógica de alvo simples: sempre o jogador
                logMessage(`Oponente usou ${cardInstance.name}.`);
                battleState.opponent.chakra -= cardInstance.cost;
                applyCardEffect(cardInstance, "opponent", "player");
                
                battleState.opponent.hand.splice(i, 1);
                battleState.opponent.discardPile.push(cardInstance.id);
                cardPlayed = true;
                break; 
            }
        }

        if (!cardPlayed) {
            logMessage("Oponente não jogou nenhuma carta.");
        }

        updateAllUI();
        if (checkGameOver()) return;

        // Oponente compra 1 carta
        let cardsToDrawOpponent = 1;
        const slowEffectOpponent = battleState.opponent.statusEffects.find(e => e.effect === "opponent_draw_less");
        if (slowEffectOpponent) {
            cardsToDrawOpponent = Math.max(0, cardsToDrawOpponent - slowEffectOpponent.value);
        }
        drawCards("opponent", cardsToDrawOpponent);
        
        endTurn(); // Oponente finaliza o turno
    }

    function checkGameOver() {
        if (battleState.player.health <= 0) {
            logMessage("Jogador foi derrotado! Fim de jogo.");
            battleState.gamePhase = "game_over";
            endTurnButton.disabled = true;
            addRestartButton();
            return true;
        }
        if (battleState.opponent.health <= 0) {
            logMessage("Oponente foi derrotado! Você venceu!");
            playerProfile.currency += 50; // Recompensa por vitória
            playerProfile.xp += 100;
            checkPlayerLevelUp();
            updatePlayerProfileUI();
            battleState.gamePhase = "game_over";
            endTurnButton.disabled = true;
            addRestartButton();
            return true;
        }
        return false;
    }

    function checkPlayerLevelUp() {
        if (playerProfile.xp >= playerProfile.xpToNextLevel) {
            playerProfile.level++;
            playerProfile.xp -= playerProfile.xpToNextLevel;
            playerProfile.xpToNextLevel = playerProfile.level * 100; // Próximo nível
            logMessage(`Parabéns! Você subiu para o Nível ${playerProfile.level}!`);
            // Poderia adicionar recompensas por level up aqui
        }
    }

    function addRestartButton() {
        removeRestartButton(); // Garante que não haja duplicatas
        const restartButton = document.createElement("button");
        restartButton.textContent = "Reiniciar Jogo";
        restartButton.classList.add("game-button", "restart-button");
        restartButton.onclick = startGame;
        gameBoardElement.appendChild(restartButton);
    }
    function removeRestartButton(){
        const existingRestartButton = gameBoardElement.querySelector(".restart-button");
        if(existingRestartButton) existingRestartButton.remove();
    }

    function updateAllUI() {
        updatePlayerStatsUI();
        updateOpponentStatsUI();
        updateHandUI("player");
        updateHandUI("opponent");
        updateTurnUI();
        updatePlayerProfileUI();
    }

    // --- Inicialização ---
    if (endTurnButton) endTurnButton.addEventListener("click", endTurn);
    if (finalizePurchaseButton) finalizePurchaseButton.addEventListener("click", finalizePurchase);
    
    // Exibe a seção de combate por padrão e inicia o jogo
    const combatNavButton = document.getElementById("nav-combat");
    if (combatNavButton) combatNavButton.click(); // Simula clique para mostrar a seção correta
    startGame();

}); // Fim do DOMContentLoaded

