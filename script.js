// Game State
const state = {
    coins: 0,
    inventory: [], // IDs of owned wankos
    team: [], // IDs of wankos in team
    unlockedStages: 1
};

// Wanko Database
const WANKO_DB = [
    { id: 0, name: "基本ワンコ", icon: "🐶", type: "melee", desc: "普通のワンコ。噛みつく。", cost: 100 },
    { id: 1, name: "空飛ぶワンコ", icon: "🛸", type: "air", desc: "空から爆撃する。", cost: 200 },
    { id: 2, name: "タンクワンコ", icon: "🐕", type: "tank", desc: "体力が高い守り神。", cost: 300 },
    { id: 3, name: "忍者ワンコ", icon: "🥷", type: "speed", desc: "足が速い。", cost: 150 },
    { id: 4, name: "魔法ワンコ", icon: "🧙‍♂️", type: "magic", desc: "遠くから魔法を撃つ。", cost: 400 },
    { id: 5, name: "侍ワンコ", icon: "🐺", type: "melee", desc: "刀で斬る。", cost: 250 },
    { id: 6, name: "ロボワンコ", icon: "🤖", type: "tank", desc: "硬い。", cost: 500 }
];

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadGame();
    showTitleScreen();
});

// Helper: Save/Load
function saveGame() {
    localStorage.setItem('wankoWarsState', JSON.stringify(state));
}

function loadGame() {
    const saved = localStorage.getItem('wankoWarsState');
    if (saved) {
        Object.assign(state, JSON.parse(saved));
    } else {
        if (state.inventory.length === 0) {
            state.inventory.push(0); // Get basic wanko
            state.team.push(0);
            state.coins = 10;
        }
    }
}

// Navigation Functions
function showTitleScreen() {
    render(`
        <div id="title-screen" class="screen">
            <h1>ワンコ大戦争</h1>
            <p style="font-size: 24px; animation: blink 1s infinite;">クリックしてスタート！</p>
        </div>
    `);

    document.getElementById('title-screen').addEventListener('click', () => {
        showMainMenu();
    });
}

function showMainMenu() {
    render(`
        <div id="menu-screen" class="screen">
            <h1>メニュー</h1>
            <div style="font-size: 24px; margin-bottom: 20px;">🪙 コイン: <span id="coin-display">${state.coins}</span></div>
            <div style="display: flex; flex-wrap: wrap; justify-content: center;">
                <button onclick="showMap()">⚔️ 出撃</button>
                <button onclick="showGacha()">🎰 ガチャガチャ</button>
                <button onclick="showEncyclopedia()">📖 図鑑</button>
                <button onclick="showFormation()">🐕 ワンコ編成</button>
            </div>
        </div>
    `);
}

// Screen Rendering Helper
function render(html) {
    document.getElementById('game-container').innerHTML = html;
}

// =======================
// GACHA SYSTEM
// =======================
function showGacha() {
    render(`
        <div id="gacha-screen" class="screen">
            <h2>ガチャガチャ (2コイン)</h2>
            <div style="margin: 20px;">所持コイン: ${state.coins}</div>
            <div id="capsule">💊</div>
            <div id="gacha-result"></div>
            <button id="pull-btn" onclick="pullGacha()">ガチャを回す</button>
            <button class="back-btn" onclick="showMainMenu()">戻る</button>
        </div>
    `);
}

function pullGacha() {
    const btn = document.getElementById('pull-btn');
    const resultDiv = document.getElementById('gacha-result');
    const capsule = document.getElementById('capsule');

    if (state.coins < 2) {
        resultDiv.innerHTML = "コインが足りません！";
        return;
    }

    // Deduct coins
    state.coins -= 2;
    saveGame();

    // UI Update
    btn.disabled = true;
    resultDiv.innerHTML = "";
    capsule.classList.add('shake');

    // Animation delay
    setTimeout(() => {
        capsule.classList.remove('shake');

        // Pick random wanko
        const randomIndex = Math.floor(Math.random() * WANKO_DB.length);
        const wanko = WANKO_DB[randomIndex];

        // Add to inventory if not already owned (or just log it)
        // Prompt says "accumulate". Let's verify if we want duplicates.
        // Usually unlocking is once. Let's handle duplicate gracefully.
        let isNew = false;
        if (!state.inventory.includes(wanko.id)) {
            state.inventory.push(wanko.id);
            isNew = true;
        }
        saveGame();

        resultDiv.innerHTML = `
            <div style="color: #fff;">
                <div class="wanko-icon" style="font-size: 80px;">${wanko.icon}</div>
                <div>${wanko.name}をゲット！</div>
                ${isNew ? '<div style="color: yellow;">New!</div>' : '<div style="color: #aaa;">(既に持っています)</div>'}
            </div>
        `;

        btn.disabled = false;
        // Update coin display if needed (but we are redrawing it anyway if we go back)
        // But let's update the text in this screen
        const coinDisplay = document.querySelector('#gacha-screen div:nth-child(2)');
        if (coinDisplay) coinDisplay.innerText = `所持コイン: ${state.coins}`;

    }, 1000);
}

// =======================
// ENCYCLOPEDIA SYSTEM
// =======================
function showEncyclopedia() {
    let gridHtml = '';

    WANKO_DB.forEach(wanko => {
        const owned = state.inventory.includes(wanko.id);
        gridHtml += `
            <div class="wanko-card ${owned ? 'owned' : ''}" style="opacity: ${owned ? 1 : 0.5}">
                <div class="wanko-icon">${owned ? wanko.icon : '❓'}</div>
                <div class="wanko-name">${owned ? wanko.name : '???'}</div>
                ${owned ? `<div style="font-size:10px;">${wanko.desc}</div>` : ''}
            </div>
        `;
    });

    render(`
        <div id="encyclopedia-screen" class="screen">
            <h2>ワンコ図鑑</h2>
            <div class="grid-container">
                ${gridHtml}
            </div>
            <button class="back-btn" onclick="showMainMenu()">戻る</button>
        </div>
    `);
}

// =======================
// FORMATION SYSTEM
// =======================
function showFormation() {
    render(`
        <div id="formation-screen" class="screen">
            <h2>ワンコ編成</h2>
            <div class="formation-container">
                <div class="formation-list">
                    <h3>チーム</h3>
                    <div id="team-list" class="grid-container" style="width:auto; height: 40vh;"></div>
                </div>
                <div class="formation-list">
                    <h3>待機中</h3>
                    <div id="inventory-list" class="grid-container" style="width:auto; height: 40vh;"></div>
                </div>
            </div>
            <div style="margin: 10px;">ワンコをクリックして入れ替え</div>
            <button class="back-btn" onclick="showMainMenu()">保存して戻る</button>
        </div>
    `);
    updateFormationUI();
}

function updateFormationUI() {
    const teamList = document.getElementById('team-list');
    const inventoryList = document.getElementById('inventory-list');

    // Render Team
    teamList.innerHTML = state.team.map(id => {
        const w = WANKO_DB.find(x => x.id === id);
        return createFormationCard(w, true);
    }).join('');

    // Render Inventory (excluding team members)
    // Actually prompt says "move from encyclopedia to team".
    // Usually you can have duplicates in team if you have duplicates in inventory, but we enforced unique inventory.
    // So we show items in inventory that are NOT in team.
    const available = state.inventory.filter(id => !state.team.includes(id));

    inventoryList.innerHTML = available.map(id => {
        const w = WANKO_DB.find(x => x.id === id);
        return createFormationCard(w, false);
    }).join('');
}

function createFormationCard(wanko, isTeam) {
    return `
        <div class="wanko-card owned" onclick="toggleTeam(${wanko.id}, ${isTeam})">
            <div class="wanko-icon">${wanko.icon}</div>
            <div class="wanko-name">${wanko.name}</div>
        </div>
    `;
}

function toggleTeam(id, isTeam) {
    if (isTeam) {
        // Remove from team
        if (state.team.length <= 1) {
            alert("チームには最低1匹必要です！");
            return;
        }
        state.team = state.team.filter(x => x !== id);
    } else {
        // Add to team
        if (state.team.length >= 5) {
            alert("チームは最大5匹までです！");
            return;
        }
        state.team.push(id);
    }
    saveGame();
    updateFormationUI();
}

// =======================
// MAP & BATTLE (Placeholders)
// =======================
function showMap() {
    // Generate stages
    let stagesHtml = '';
    for (let i = 1; i <= 5; i++) {
        const unlocked = i <= state.unlockedStages;
        stagesHtml += `
            <button
                onclick="startBattle(${i})"
                ${unlocked ? '' : 'disabled'}
                style="display:block; width: 80%; margin: 10px auto; background-color: ${unlocked ? '#ff9900' : '#555'};"
            >
                ステージ ${i} ${unlocked ? '' : '🔒'}
            </button>
        `;
    }

    render(`
        <div id="map-screen" class="screen">
            <h2>出撃マップ</h2>
            <div style="width: 100%; max-width: 400px;">
                ${stagesHtml}
            </div>
            <button class="back-btn" onclick="showMainMenu()">戻る</button>
        </div>
    `);
}

// =======================
// BATTLE SYSTEM
// =======================
let battleInterval;
let battleState = {
    money: 0,
    maxMoney: 1000,
    wankos: [],
    enemies: [],
    projectiles: [],
    baseHP: 1000,
    enemyBaseHP: 1000,
    stage: 1,
    lastTime: 0,
    spawnCooldowns: {}
};

const ENEMY_TYPES = [
    { name: "Snake", icon: "🐍", hp: 50, dmg: 5, speed: 2, range: 0, attackRate: 1000 },
    { name: "Boar", icon: "🐗", hp: 150, dmg: 15, speed: 3, range: 0, attackRate: 1500 },
    { name: "Alien", icon: "👽", hp: 300, dmg: 30, speed: 1, range: 100, attackRate: 2000 }
];

function startBattle(stageNum) {
    // Reset Battle State
    battleState = {
        money: 0,
        maxMoney: 1000 + (stageNum * 200),
        wankos: [],
        enemies: [],
        projectiles: [],
        baseHP: 1000,
        enemyBaseHP: 1000 * stageNum,
        stage: stageNum,
        lastTime: performance.now(),
        spawnCooldowns: {}
    };

    render(`
        <div id="battle-screen" class="screen">
            <div id="battle-ui">
                <div style="color: white; font-weight: bold;">
                    <div>💰 <span id="battle-money">0</span> / ${battleState.maxMoney}</div>
                    <div style="font-size: 12px;">Base HP: <span id="player-hp">1000</span></div>
                </div>
                <button onclick="endBattle(false)" style="padding: 5px 10px; font-size: 14px;">撤退</button>
                <div style="color: white; text-align: right;">
                    <div>Stage ${stageNum}</div>
                    <div style="font-size: 12px;">Enemy Base: <span id="enemy-hp">${battleState.enemyBaseHP}</span></div>
                </div>
            </div>

            <div id="battle-field">
                <div class="base player">🏰</div>
                <div class="base enemy">🏯</div>
            </div>

            <div id="unit-spawner"></div>
        </div>
    `);

    // Render Spawn Buttons
    const spawner = document.getElementById('unit-spawner');
    state.team.forEach(id => {
        const w = WANKO_DB.find(x => x.id === id);
        // Cost adjusted for battle money (scaled down for faster gameplay)
        const battleCost = Math.floor(w.cost / 2);

        const btn = document.createElement('div');
        btn.className = 'spawn-btn';
        btn.id = `btn-${id}`;
        btn.innerHTML = `
            <div class="cost">${battleCost}</div>
            <div style="font-size: 30px;">${w.icon}</div>
        `;
        btn.onclick = () => spawnWanko(w, battleCost);
        spawner.appendChild(btn);
    });

    // Start Loop
    cancelAnimationFrame(battleInterval); // Just in case
    battleLoop();
}

function spawnWanko(wanko, cost) {
    if (battleState.money < cost) return;
    if (battleState.spawnCooldowns[wanko.id] > Date.now()) return;

    battleState.money -= cost;
    battleState.spawnCooldowns[wanko.id] = Date.now() + 2000; // 2s cooldown

    // Cooldown UI visual
    const btn = document.getElementById(`btn-${wanko.id}`);
    if (btn) {
        btn.classList.add('cooldown');
        setTimeout(() => {
            const b = document.getElementById(`btn-${wanko.id}`);
            if (b) b.classList.remove('cooldown');
        }, 2000);
    }

    battleState.wankos.push({
        id: Date.now() + Math.random(),
        type: wanko,
        x: 60, // Start near base
        hp: getWankoStats(wanko).hp,
        maxHp: getWankoStats(wanko).hp,
        lastAttack: 0
    });
}

function getWankoStats(wanko) {
    // Define stats based on type
    switch(wanko.type) {
        case 'tank': return { hp: 500, dmg: 10, speed: 1, range: 0, attackRate: 1000 };
        case 'speed': return { hp: 100, dmg: 20, speed: 4, range: 0, attackRate: 500 };
        case 'magic': return { hp: 80, dmg: 40, speed: 1.5, range: 150, attackRate: 2000 };
        case 'air': return { hp: 150, dmg: 50, speed: 2, range: 50, attackRate: 3000, isAir: true };
        default: return { hp: 200, dmg: 20, speed: 2, range: 0, attackRate: 1000 };
    }
}

function battleLoop() {
    if (!document.getElementById('battle-screen')) return; // Exit if screen changed

    const now = performance.now();
    const dt = (now - battleState.lastTime) / 1000; // Delta time in seconds
    battleState.lastTime = now;

    // 1. Resources
    battleState.money = Math.min(battleState.maxMoney, battleState.money + (100 * dt)); // 100 money per second
    document.getElementById('battle-money').innerText = Math.floor(battleState.money);

    // 2. Enemy Spawning Logic
    if (Math.random() < 0.01 + (battleState.stage * 0.005)) { // Chance increases with stage
        const enemyType = ENEMY_TYPES[Math.floor(Math.random() * Math.min(ENEMY_TYPES.length, battleState.stage))];
        battleState.enemies.push({
            id: Date.now() + Math.random(),
            type: enemyType,
            x: document.getElementById('battle-field').offsetWidth - 60,
            hp: enemyType.hp,
            maxHp: enemyType.hp,
            lastAttack: 0
        });
    }

    // 3. Movement & Combat
    updateEntities(dt, now);
    renderEntities();

    // 4. Win/Loss Check
    if (battleState.baseHP <= 0) {
        endBattle(false);
        return;
    }
    if (battleState.enemyBaseHP <= 0) {
        endBattle(true);
        return;
    }

    battleInterval = requestAnimationFrame(battleLoop);
}

function updateEntities(dt, now) {
    const fieldWidth = document.getElementById('battle-field').offsetWidth;

    // --- Wankos ---
    battleState.wankos.forEach(w => {
        const stats = getWankoStats(w.type);
        // Find target
        let target = null;
        // Closest enemy within range
        let closestDist = Infinity;

        // Check enemies
        battleState.enemies.forEach(e => {
            const dist = e.x - w.x;
            if (dist > 0 && dist < closestDist) {
                closestDist = dist;
                target = e;
            }
        });

        // Check Enemy Base
        if (!target) {
            const distToBase = (fieldWidth - 50) - w.x;
            if (distToBase < closestDist) {
                closestDist = distToBase;
                target = { isBase: true, x: fieldWidth - 50 };
            }
        }

        const range = stats.range || 30; // 30 is melee range
        if (target && closestDist <= range) {
            // Attack
            if (now - w.lastAttack > stats.attackRate) {
                w.lastAttack = now;
                createProjectile(w.x + 20, w.y || 20, 'right', w.type.icon); // Visual

                // Deal Damage
                if (target.isBase) {
                    battleState.enemyBaseHP -= stats.dmg;
                    document.getElementById('enemy-hp').innerText = battleState.enemyBaseHP;
                } else {
                    target.hp -= stats.dmg;
                }

                // Special Skill Effect (e.g. Air drops bomb)
                if (w.type.type === 'air') {
                     // Add simple explosion visual later
                }
            }
        } else {
            // Move
            w.x += stats.speed;
        }
    });

    // --- Enemies ---
    battleState.enemies.forEach(e => {
        const stats = e.type;
        let target = null;
        let closestDist = Infinity;

        // Check Wankos
        battleState.wankos.forEach(w => {
            const dist = e.x - w.x;
            if (dist > 0 && dist < closestDist) {
                closestDist = dist;
                target = w;
            }
        });

        // Check Player Base
        if (!target) {
            const distToBase = e.x - 50;
            if (distToBase < closestDist) {
                closestDist = distToBase;
                target = { isBase: true, x: 50 };
            }
        }

        const range = stats.range || 30;
        if (target && closestDist <= range) {
             if (now - e.lastAttack > stats.attackRate) {
                e.lastAttack = now;
                if (target.isBase) {
                    battleState.baseHP -= stats.dmg;
                    document.getElementById('player-hp').innerText = battleState.baseHP;
                } else {
                    target.hp -= stats.dmg;
                }
             }
        } else {
            e.x -= stats.speed;
        }
    });

    // Cleanup dead units
    battleState.wankos = battleState.wankos.filter(w => w.hp > 0);
    battleState.enemies = battleState.enemies.filter(e => e.hp > 0);

    // Cleanup projectiles
    const nowTime = Date.now();
    battleState.projectiles = battleState.projectiles.filter(p => nowTime < p.expiresAt);
}

function createProjectile(x, y, dir, icon) {
    // Add to state instead of manipulating DOM directly to avoid being cleared
    let visual = '💥';
    let bottom = '20px';
    let animClass = 'shoot-right';

    if (icon === '🛸') {
        visual = '💣';
        bottom = '150px';
        animClass = 'drop-down';
    }
    if (icon === '🧙‍♂️') visual = '✨';

    battleState.projectiles.push({
        id: Math.random(),
        x: x,
        bottom: bottom,
        visual: visual,
        animClass: animClass,
        expiresAt: Date.now() + 500
    });
}

function renderEntities() {
    const field = document.getElementById('battle-field');
    // Keep bases, remove dynamic entities
    const bases = field.querySelectorAll('.base');
    field.innerHTML = '';
    bases.forEach(b => field.appendChild(b));

    // Render Projectiles
    battleState.projectiles.forEach(p => {
        const div = document.createElement('div');
        div.className = `projectile ${p.animClass}`;
        div.innerText = p.visual;
        div.style.left = `${p.x}px`;
        div.style.bottom = p.bottom;
        field.appendChild(div);
    });

    // Render Wankos
    battleState.wankos.forEach(w => {
        const stats = getWankoStats(w.type);
        const div = document.createElement('div');
        div.className = `entity wanko ${stats.isAir ? 'air' : ''}`;
        div.style.left = `${w.x}px`;
        div.innerHTML = `
            ${w.type.icon}
            <div class="hp-bar"><div class="hp-bar-inner" style="width: ${(w.hp/w.maxHp)*100}%"></div></div>
        `;
        field.appendChild(div);
    });

    // Render Enemies
    battleState.enemies.forEach(e => {
        const div = document.createElement('div');
        div.className = 'entity enemy';
        div.style.left = `${e.x}px`;
        div.innerHTML = `
            ${e.type.icon}
            <div class="hp-bar"><div class="hp-bar-inner" style="width: ${(e.hp/e.maxHp)*100}%"></div></div>
        `;
        field.appendChild(div);
    });
}

function endBattle(victory) {
    cancelAnimationFrame(battleInterval);
    if (victory) {
        const reward = 10;
        state.coins += reward;
        if (battleState.stage === state.unlockedStages) {
            state.unlockedStages++;
        }
        saveGame();
        render(`
            <div class="screen" style="background: rgba(0,0,0,0.8); color: gold;">
                <h1>VICTORY!</h1>
                <p>コインを ${reward} 枚ゲット！</p>
                <button onclick="showMainMenu()">メニューへ</button>
            </div>
        `);
    } else {
        render(`
            <div class="screen" style="background: rgba(50,0,0,0.8); color: red;">
                <h1>DEFEAT...</h1>
                <button onclick="showMainMenu()">メニューへ</button>
            </div>
        `);
    }
}
