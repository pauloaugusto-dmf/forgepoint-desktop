// src/main/sqlite.js
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const { app } = require('electron');

const userDataPath =
  app && typeof app.getPath === 'function'
    ? app.getPath('userData')
    : path.join(process.env.HOME || '.', '.config', 'forgepoint-desktop');
const dbPath = path.join(userDataPath, 'forgepoint.sqlite');

console.log('[Forgepoint DB] Database path:', dbPath);

let dbInstance = null;

async function initDatabase() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await dbInstance.exec('PRAGMA foreign_keys = ON;');

  // 1. Tabela de Mecânicas Reutilizáveis
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS mechanics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      gif_url TEXT,
      is_implemented INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // 2. Tabela de Ideias / Projetos de Jogos
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS game_ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      gdd_data TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // Migração segura: garante que a coluna gdd_data existe em bancos existentes
  try {
    await dbInstance.exec(`ALTER TABLE game_ideas ADD COLUMN gdd_data TEXT;`);
  } catch (e) {
    // Coluna já existe
  }

  // 3. Tabela Pivô (N:N) com estado local no jogo
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS game_idea_mechanics (
      game_idea_id INTEGER NOT NULL REFERENCES game_ideas(id) ON DELETE CASCADE,
      mechanic_id INTEGER NOT NULL REFERENCES mechanics(id) ON DELETE CASCADE,
      is_integrated INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      PRIMARY KEY (game_idea_id, mechanic_id)
    );
  `);

  // Seed inicial caso o catálogo esteja vazio
  const countRow = await dbInstance.get('SELECT COUNT(*) as count FROM mechanics;');
  if (countRow && countRow.count === 0) {
    const defaultMechanics = [
      ['Pulo & Gravidade', 'Cálculo de salto com curva parabólica e tempo de sustentação no ar.', 'src/assets/mechanics/pulo_gravidade.gif', 1],
      ['State Machine (FSM)', 'Máquina de estados finitos para controlar Idle, Run, Jump, Attack e Hurt.', 'src/assets/mechanics/state_machine.gif', 1],
      ['Dash / Esquiva', 'Impulso rápido com frames de invulnerabilidade (i-frames) e cooldown.', 'src/assets/mechanics/dash_esquiva.gif', 0],
      ['Wall Jump & Slide', 'Mecânica de deslizar na parede e saltar na direção oposta.', 'src/assets/mechanics/wall_jump.gif', 0],
      ['Sistema de Tiro / Projéteis', 'Disparo com pooling de entidades e detecção de colisões rápida.', 'src/assets/mechanics/tiro_projeteis.gif', 0],
    ];

    for (const [name, desc, gif, implemented] of defaultMechanics) {
      await dbInstance.run(
        `INSERT INTO mechanics (name, description, gif_url, is_implemented) VALUES (?, ?, ?, ?)`,
        [name, desc, gif, implemented]
      );
    }
  }

  // Garante atualização dos GIFs para o catálogo padrão
  await dbInstance.run(`
    UPDATE mechanics SET gif_url = 'src/assets/mechanics/pulo_gravidade.gif'
    WHERE name = 'Pulo & Gravidade' AND (gif_url IS NULL OR gif_url = '');
  `);
  await dbInstance.run(`
    UPDATE mechanics SET gif_url = 'src/assets/mechanics/state_machine.gif'
    WHERE name = 'State Machine (FSM)' AND (gif_url IS NULL OR gif_url = '');
  `);
  await dbInstance.run(`
    UPDATE mechanics SET gif_url = 'src/assets/mechanics/dash_esquiva.gif'
    WHERE name = 'Dash / Esquiva' AND (gif_url IS NULL OR gif_url = '');
  `);
  await dbInstance.run(`
    UPDATE mechanics SET gif_url = 'src/assets/mechanics/wall_jump.gif'
    WHERE name = 'Wall Jump & Slide' AND (gif_url IS NULL OR gif_url = '');
  `);
  await dbInstance.run(`
    UPDATE mechanics SET gif_url = 'src/assets/mechanics/tiro_projeteis.gif'
    WHERE name = 'Sistema de Tiro / Projéteis' AND (gif_url IS NULL OR gif_url = '');
  `);

  // Garante seed de GDD para o projeto de exemplo Neon Protocol se estiver sem GDD
  const neonRow = await dbInstance.get(`SELECT id, gdd_data FROM game_ideas WHERE title LIKE '%Neon Protocol%' LIMIT 1;`);
  if (neonRow && (!neonRow.gdd_data || neonRow.gdd_data === '{}')) {
    const sampleGdd = {
      genre: 'Metroidvania / Ação Cyberpunk 2D',
      target_platforms: 'PC (Steam), Nintendo Switch',
      target_audience: 'Fãs de Katana Zero, Dead Cells e Ghostrunner',
      usp: 'Movimentação acrobática com alternância de nós de rede e parry via firewall.',
      references: 'Katana Zero, Dead Cells, Celeste, Ghostrunner',
      core_loop: 'Infiltrar setor -> Parkour vertical e esquivas -> Combate tático em tempo real -> Hackear mainframe -> Obter upgrades de chip.',
      win_loss_conditions: 'Vitória: Sobrecargar o núcleo da IA central. Derrota: Barra de integridade zerar ou firewall isolar o setor.',
      progression_systems: 'Módulos passivos de overclock, expansão de slots de memória e upgrades na cadência de plasma.',
      art_style: 'Pixel Art 16-bit com iluminação dinâmica neon volumétrica e alto contraste.',
      audio_style: 'Trilha sonora darksynth/synthwave agressiva com SFX digitais e mecânicos imersivos.',
      narrative_setting: 'Megacidade subterrânea gerida por uma IA tirânica que desativou os últimos humanos orgânicos.',
      engine: 'Godot 4.3',
      mvp_scope: '1 setor com 4 salas interligadas, 2 tipos de sentinelas, 1 miniboss e as 5 mecânicas essenciais conectadas.'
    };
    await dbInstance.run(`UPDATE game_ideas SET gdd_data = ? WHERE id = ?`, [JSON.stringify(sampleGdd), neonRow.id]);
  }

  return dbInstance;
}

// ==================== MECÂNICAS ====================

async function getMechanics() {
  const db = await initDatabase();
  const mechanics = await db.all(`
    SELECT id, name, description, gif_url, is_implemented, created_at, updated_at
    FROM mechanics
    ORDER BY name COLLATE NOCASE ASC
  `);

  // Carrega em quais jogos cada mecânica é utilizada
  const gameRefs = await db.all(`
    SELECT gim.mechanic_id, gi.id AS game_idea_id, gi.title, gim.is_integrated, gim.notes
    FROM game_ideas gi
    JOIN game_idea_mechanics gim ON gi.id = gim.game_idea_id
    ORDER BY gi.title COLLATE NOCASE ASC
  `);

  const refsByMechanic = {};
  for (const ref of gameRefs) {
    if (!refsByMechanic[ref.mechanic_id]) {
      refsByMechanic[ref.mechanic_id] = [];
    }
    refsByMechanic[ref.mechanic_id].push({
      game_idea_id: ref.game_idea_id,
      title: ref.title,
      is_integrated: Boolean(ref.is_integrated),
      notes: ref.notes,
    });
  }

  return mechanics.map((m) => ({
    ...m,
    is_implemented: Boolean(m.is_implemented),
    used_in_games: refsByMechanic[m.id] || [],
  }));
}

async function addMechanic(mechanic) {
  const db = await initDatabase();
  const res = await db.run(
    `INSERT INTO mechanics (name, description, gif_url, is_implemented)
     VALUES (?, ?, ?, ?)`,
    [
      mechanic.name.trim(),
      mechanic.description ? mechanic.description.trim() : null,
      mechanic.gif_url ? mechanic.gif_url.trim() : null,
      mechanic.is_implemented ? 1 : 0,
    ]
  );
  return {
    id: res.lastID,
    name: mechanic.name.trim(),
    description: mechanic.description || null,
    gif_url: mechanic.gif_url || null,
    is_implemented: Boolean(mechanic.is_implemented),
    used_in_games: [],
  };
}

async function updateMechanic(id, mechanic) {
  const db = await initDatabase();
  await db.run(
    `UPDATE mechanics
     SET name = ?, description = ?, gif_url = ?, is_implemented = ?, updated_at = datetime('now', 'localtime')
     WHERE id = ?`,
    [
      mechanic.name.trim(),
      mechanic.description ? mechanic.description.trim() : null,
      mechanic.gif_url ? mechanic.gif_url.trim() : null,
      mechanic.is_implemented ? 1 : 0,
      id,
    ]
  );
  const updated = await db.get(`SELECT * FROM mechanics WHERE id = ?`, [id]);
  return {
    ...updated,
    is_implemented: Boolean(updated.is_implemented),
  };
}

async function toggleMechanicImplemented(id, isImplemented) {
  const db = await initDatabase();
  await db.run(
    `UPDATE mechanics
     SET is_implemented = ?, updated_at = datetime('now', 'localtime')
     WHERE id = ?`,
    [isImplemented ? 1 : 0, id]
  );
  return true;
}

async function deleteMechanic(id) {
  const db = await initDatabase();
  await db.run(`DELETE FROM mechanics WHERE id = ?`, [id]);
  return true;
}

// ==================== IDEIAS DE JOGOS ====================

async function getGameIdeas() {
  const db = await initDatabase();
  const ideas = await db.all(`
    SELECT id, title, description, image_url, gdd_data, created_at, updated_at
    FROM game_ideas
    ORDER BY created_at DESC
  `);

  const linkedMechanics = await db.all(`
    SELECT 
      gim.game_idea_id,
      m.id,
      m.name,
      m.description,
      m.gif_url,
      m.is_implemented,
      gim.is_integrated,
      gim.notes
    FROM game_idea_mechanics gim
    JOIN mechanics m ON gim.mechanic_id = m.id
    ORDER BY m.name COLLATE NOCASE ASC
  `);

  const mechsByIdea = {};
  for (const m of linkedMechanics) {
    if (!mechsByIdea[m.game_idea_id]) {
      mechsByIdea[m.game_idea_id] = [];
    }
    mechsByIdea[m.game_idea_id].push({
      id: m.id,
      name: m.name,
      description: m.description,
      gif_url: m.gif_url,
      is_implemented: Boolean(m.is_implemented),
      is_integrated: Boolean(m.is_integrated),
      notes: m.notes,
    });
  }

  return ideas.map((idea) => {
    let parsedGdd = {};
    if (idea.gdd_data) {
      try {
        parsedGdd = JSON.parse(idea.gdd_data);
      } catch (e) {
        parsedGdd = {};
      }
    }
    return {
      ...idea,
      gdd: parsedGdd,
      mechanics: mechsByIdea[idea.id] || [],
    };
  });
}

async function getGameIdeaById(id) {
  const db = await initDatabase();
  const idea = await db.get(`SELECT * FROM game_ideas WHERE id = ?`, [id]);
  if (!idea) return null;

  const mechanics = await db.all(
    `SELECT 
      m.id,
      m.name,
      m.description,
      m.gif_url,
      m.is_implemented,
      gim.is_integrated,
      gim.notes
    FROM game_idea_mechanics gim
    JOIN mechanics m ON gim.mechanic_id = m.id
    WHERE gim.game_idea_id = ?
    ORDER BY m.name COLLATE NOCASE ASC`,
    [id]
  );

  let parsedGdd = {};
  if (idea.gdd_data) {
    try {
      parsedGdd = JSON.parse(idea.gdd_data);
    } catch (e) {
      parsedGdd = {};
    }
  }

  return {
    ...idea,
    gdd: parsedGdd,
    mechanics: mechanics.map((m) => ({
      ...m,
      is_implemented: Boolean(m.is_implemented),
      is_integrated: Boolean(m.is_integrated),
    })),
  };
}

async function addGameIdea(idea, mechanicsLinks = []) {
  const db = await initDatabase();
  await db.exec('BEGIN TRANSACTION;');
  try {
    const gddString = idea.gdd_data
      ? (typeof idea.gdd_data === 'string' ? idea.gdd_data : JSON.stringify(idea.gdd_data))
      : (idea.gdd ? JSON.stringify(idea.gdd) : null);

    const res = await db.run(
      `INSERT INTO game_ideas (title, description, image_url, gdd_data) VALUES (?, ?, ?, ?)`,
      [
        idea.title.trim(),
        idea.description ? idea.description.trim() : null,
        idea.image_url ? idea.image_url.trim() : null,
        gddString,
      ]
    );
    const ideaId = res.lastID;

    if (Array.isArray(mechanicsLinks) && mechanicsLinks.length > 0) {
      for (const link of mechanicsLinks) {
        await db.run(
          `INSERT INTO game_idea_mechanics (game_idea_id, mechanic_id, is_integrated, notes)
           VALUES (?, ?, ?, ?)`,
          [
            ideaId,
            link.mechanic_id,
            link.is_integrated ? 1 : 0,
            link.notes ? link.notes.trim() : null,
          ]
        );
      }
    }

    await db.exec('COMMIT;');
    return await getGameIdeaById(ideaId);
  } catch (err) {
    await db.exec('ROLLBACK;');
    throw err;
  }
}

async function updateGameIdea(id, idea, mechanicsLinks = []) {
  const db = await initDatabase();
  await db.exec('BEGIN TRANSACTION;');
  try {
    const gddString = idea.gdd_data
      ? (typeof idea.gdd_data === 'string' ? idea.gdd_data : JSON.stringify(idea.gdd_data))
      : (idea.gdd ? JSON.stringify(idea.gdd) : null);

    await db.run(
      `UPDATE game_ideas
       SET title = ?, description = ?, image_url = ?, gdd_data = ?, updated_at = datetime('now', 'localtime')
       WHERE id = ?`,
      [
        idea.title.trim(),
        idea.description ? idea.description.trim() : null,
        idea.image_url ? idea.image_url.trim() : null,
        gddString,
        id,
      ]
    );

    // Remove vínculos existentes e recria
    await db.run(`DELETE FROM game_idea_mechanics WHERE game_idea_id = ?`, [id]);

    if (Array.isArray(mechanicsLinks) && mechanicsLinks.length > 0) {
      for (const link of mechanicsLinks) {
        await db.run(
          `INSERT INTO game_idea_mechanics (game_idea_id, mechanic_id, is_integrated, notes)
           VALUES (?, ?, ?, ?)`,
          [
            id,
            link.mechanic_id,
            link.is_integrated ? 1 : 0,
            link.notes ? link.notes.trim() : null,
          ]
        );
      }
    }

    await db.exec('COMMIT;');
    return await getGameIdeaById(id);
  } catch (err) {
    await db.exec('ROLLBACK;');
    throw err;
  }
}

async function patchIntegration(ideaId, mechanicId, isIntegrated, notes = null) {
  const db = await initDatabase();
  if (notes !== null) {
    await db.run(
      `UPDATE game_idea_mechanics
       SET is_integrated = ?, notes = ?
       WHERE game_idea_id = ? AND mechanic_id = ?`,
      [isIntegrated ? 1 : 0, notes ? notes.trim() : null, ideaId, mechanicId]
    );
  } else {
    await db.run(
      `UPDATE game_idea_mechanics
       SET is_integrated = ?
       WHERE game_idea_id = ? AND mechanic_id = ?`,
      [isIntegrated ? 1 : 0, ideaId, mechanicId]
    );
  }
  return await getGameIdeaById(ideaId);
}

async function deleteGameIdea(id) {
  const db = await initDatabase();
  await db.run(`DELETE FROM game_ideas WHERE id = ?`, [id]);
  return true;
}

// ==================== DASHBOARD / OVERVIEW ====================

async function getOverview() {
  const db = await initDatabase();

  const ideasCount = (await db.get('SELECT COUNT(*) as c FROM game_ideas;'))?.c || 0;
  const mechsCount = (await db.get('SELECT COUNT(*) as c FROM mechanics;'))?.c || 0;
  const implementedCount =
    (await db.get('SELECT COUNT(*) as c FROM mechanics WHERE is_implemented = 1;'))?.c || 0;
  const pendingCount = mechsCount - implementedCount;

  // Top 5 mecânicas mais reaproveitadas
  const topReused = await db.all(`
    SELECT m.name, COUNT(gim.game_idea_id) as games_count
    FROM mechanics m
    JOIN game_idea_mechanics gim ON m.id = gim.mechanic_id
    GROUP BY m.id
    ORDER BY games_count DESC
    LIMIT 5;
  `);

  return {
    totalIdeas: ideasCount,
    totalMechanics: mechsCount,
    implementedMechanics: implementedCount,
    pendingMechanics: pendingCount,
    topReused,
  };
}

// ==================== BACKUP & RESTORE ====================

async function getAllData() {
  const db = await initDatabase();
  const mechanics = await db.all('SELECT * FROM mechanics;');
  const gameIdeas = await db.all('SELECT * FROM game_ideas;');
  const links = await db.all('SELECT * FROM game_idea_mechanics;');

  return {
    app: 'forgepoint-desktop',
    version: app && typeof app.getVersion === 'function' ? app.getVersion() : '1.3.0',
    exported_at: new Date().toISOString(),
    data: {
      mechanics,
      game_ideas: gameIdeas,
      game_idea_mechanics: links,
    },
  };
}

async function importData(backup) {
  if (!backup || !backup.data) {
    throw new Error('Arquivo de backup inválido.');
  }

  const db = await initDatabase();
  await db.exec('BEGIN TRANSACTION;');
  try {
    // Limpa dados atuais
    await db.run('DELETE FROM game_idea_mechanics;');
    await db.run('DELETE FROM game_ideas;');
    await db.run('DELETE FROM mechanics;');

    // Restaura mecânicas
    if (Array.isArray(backup.data.mechanics)) {
      for (const m of backup.data.mechanics) {
        await db.run(
          `INSERT INTO mechanics (id, name, description, gif_url, is_implemented, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            m.id,
            m.name,
            m.description || null,
            m.gif_url || null,
            m.is_implemented ? 1 : 0,
            m.created_at,
            m.updated_at,
          ]
        );
      }
    }

    // Restaura ideias
    if (Array.isArray(backup.data.game_ideas)) {
      for (const g of backup.data.game_ideas) {
        const gddVal = g.gdd_data || (g.gdd ? JSON.stringify(g.gdd) : null);
        await db.run(
          `INSERT INTO game_ideas (id, title, description, image_url, gdd_data, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [g.id, g.title, g.description || null, g.image_url || null, gddVal, g.created_at, g.updated_at]
        );
      }
    }

    // Restaura vínculos
    if (Array.isArray(backup.data.game_idea_mechanics)) {
      for (const link of backup.data.game_idea_mechanics) {
        await db.run(
          `INSERT INTO game_idea_mechanics (game_idea_id, mechanic_id, is_integrated, notes)
           VALUES (?, ?, ?, ?)`,
          [link.game_idea_id, link.mechanic_id, link.is_integrated ? 1 : 0, link.notes || null]
        );
      }
    }

    await db.exec('COMMIT;');
    return true;
  } catch (err) {
    await db.exec('ROLLBACK;');
    throw err;
  }
}

module.exports = {
  initDatabase,
  getMechanics,
  addMechanic,
  updateMechanic,
  toggleMechanicImplemented,
  deleteMechanic,
  getGameIdeas,
  getGameIdeaById,
  addGameIdea,
  updateGameIdea,
  patchIntegration,
  deleteGameIdea,
  getOverview,
  getAllData,
  importData,
};
