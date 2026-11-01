import os
import math
from PIL import Image, ImageDraw

OUTPUT_DIR = "/home/paulo/projects/forgepoint-desktop/src/assets/mechanics"
OBSIDIAN_GIFS_DIR = "/mnt/c/Users/paulo/OneDrive/Obsidian/Areas/Game Dev/mechanics_gifs"
WIDTH, HEIGHT = 360, 220
DURATION = 55  # ms per frame

os.makedirs(OUTPUT_DIR, exist_ok=True)
if os.path.exists("/mnt/c/Users/paulo/OneDrive/Obsidian/Areas/Game Dev"):
    os.makedirs(OBSIDIAN_GIFS_DIR, exist_ok=True)


def save_gif(frames, filename, duration=DURATION):
    out_path = os.path.join(OUTPUT_DIR, filename)
    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        duration=duration,
        loop=0,
    )
    if os.path.exists(OBSIDIAN_GIFS_DIR):
        obs_path = os.path.join(OBSIDIAN_GIFS_DIR, filename)
        frames[0].save(
            obs_path,
            save_all=True,
            append_images=frames[1:],
            duration=duration,
            loop=0,
        )


def draw_background(draw, title="", floor=True):
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill=(11, 15, 23))
    for x in range(0, WIDTH, 20):
        draw.line([x, 0, x, HEIGHT], fill=(18, 25, 38), width=1)
    for y in range(0, HEIGHT, 20):
        draw.line([0, y, WIDTH, y], fill=(18, 25, 38), width=1)

    if floor:
        floor_y = 182
        draw.rectangle([0, floor_y, WIDTH, HEIGHT], fill=(20, 27, 43))
        draw.line([0, floor_y, WIDTH, floor_y], fill=(99, 102, 241), width=2)
        for x in range(0, WIDTH, 16):
            draw.line([x, floor_y + 4, x + 8, floor_y + 12], fill=(30, 41, 65), width=1)

    if title:
        w_box = min(WIDTH - 20, len(title) * 6 + 24)
        draw.rounded_rectangle(
            [10, 8, 10 + w_box, 28],
            radius=5,
            fill=(19, 24, 38),
            outline=(139, 92, 246),
            width=1,
        )
        draw.text((18, 12), title, fill=(196, 181, 253))


# ==========================================
# OS 5 GIFS ORIGINAIS DO CATÁLOGO PADRÃO
# ==========================================
def generate_jump_gif():
    frames = []
    total_frames = 28
    floor_y = 182
    char_w, char_h = 24, 32
    traj_points = []
    for f in range(total_frames):
        t = f / (total_frames - 1)
        x = 40 + t * 280
        h_jump = 95 * math.sin(t * math.pi)
        y = floor_y - char_h - h_jump
        traj_points.append((x, y + char_h))

    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "PULO & GRAVIDADE")
        for i in range(0, len(traj_points) - 1, 2):
            draw.line([traj_points[i], traj_points[i + 1]], fill=(56, 189, 248), width=1)
        t = f / (total_frames - 1)
        x = 40 + t * 280
        h_jump = 95 * math.sin(t * math.pi)
        y = floor_y - char_h - h_jump
        draw.rounded_rectangle(
            [x, y, x + char_w, y + char_h],
            radius=4,
            fill=(6, 182, 212),
            outline=(165, 243, 252),
            width=2,
        )
        frames.append(im)
    save_gif(frames, "pulo_gravidade.gif")


def generate_fsm_gif():
    frames = []
    total_frames = 32
    states = ["IDLE", "RUN", "JUMP", "ATK"]
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "STATE MACHINE (FSM)")
        idx = (f // 8) % 4
        for i, s in enumerate(states):
            nx = 50 + i * 82
            act = i == idx
            draw.rounded_rectangle(
                [nx - 28, 52, nx + 28, 78],
                radius=6,
                fill=(139, 92, 246) if act else (24, 30, 44),
                outline=(216, 180, 254) if act else (51, 65, 85),
                width=2 if act else 1,
            )
            draw.text((nx - 14, 60), s, fill=(255, 255, 255) if act else (148, 163, 184))
            if i < 3:
                draw.line([nx + 28, 65, nx + 54, 65], fill=(100, 116, 139), width=2)
        cols = [(16, 185, 129), (59, 130, 246), (245, 158, 11), (239, 68, 68)]
        cy = 135 if idx == 2 else 150
        draw.rounded_rectangle(
            [168, cy, 192, cy + 32], radius=4, fill=cols[idx], outline=(255, 255, 255), width=2
        )
        frames.append(im)
    save_gif(frames, "state_machine.gif")


def generate_dash_gif():
    frames = []
    total_frames = 24
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "DASH & I-FRAMES")
        x = 50 + (f / total_frames) * 240
        if 6 <= f <= 16:
            for off in [30, 15]:
                draw.rounded_rectangle(
                    [x - off, 150, x - off + 24, 182],
                    radius=4,
                    fill=(14, 116, 144),
                    outline=(34, 211, 238),
                )
        draw.rounded_rectangle(
            [x, 150, x + 24, 182],
            radius=4,
            fill=(255, 255, 255) if f % 2 == 0 and 6 <= f <= 16 else (14, 165, 233),
            outline=(56, 189, 248),
            width=2,
        )
        frames.append(im)
    save_gif(frames, "dash_esquiva.gif")


def generate_wall_jump_gif():
    frames = []
    total_frames = 28
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "WALL JUMP & SLIDE")
        draw.rectangle([0, 40, 65, 182], fill=(24, 30, 44), outline=(59, 130, 246), width=2)
        draw.rectangle([295, 40, WIDTH, 182], fill=(24, 30, 44), outline=(59, 130, 246), width=2)
        t = f / (total_frames - 1)
        cx = 65 + math.sin(t * math.pi) * 208
        cy = 140 - abs(math.cos(t * math.pi * 2)) * 55
        draw.rounded_rectangle(
            [cx, cy, cx + 22, cy + 28],
            radius=4,
            fill=(168, 85, 247),
            outline=(216, 180, 254),
            width=2,
        )
        frames.append(im)
    save_gif(frames, "wall_jump.gif")


def generate_shooting_gif():
    frames = []
    total_frames = 24
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "SISTEMA DE PROJETEIS")
        draw.rounded_rectangle(
            [50, 150, 74, 182], radius=4, fill=(16, 185, 129), outline=(110, 231, 183), width=2
        )
        draw.rounded_rectangle(
            [295, 140, 320, 182], radius=4, fill=(185, 28, 28), outline=(239, 68, 68), width=2
        )
        bx = 80 + ((f * 14) % 215)
        draw.ellipse([bx - 5, 160, bx + 5, 168], fill=(250, 204, 21))
        frames.append(im)
    save_gif(frames, "tiro_projeteis.gif")


# =========================================================
# AS 18 MECÂNICAS DO SPELLCHEMY (DARKEST DUNGEON + ALQUIMIA)
# =========================================================

# 1. State Machine de Turnos (FSM Combate)
def generate_1_fsm_turnos():
    frames = []
    total_frames = 35
    phases = ["COMPRA", "MANA", "JOGADOR", "REACOES", "INIMIGO"]
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "1. FSM DE TURNOS (CICLO DE BATALHA)")

        active = (f // 7) % 5
        for i, p in enumerate(phases):
            nx = 38 + i * 68
            ny = 58
            is_act = i == active
            bg = (124, 58, 237) if is_act else (24, 32, 50)
            bd = (221, 214, 254) if is_act else (51, 65, 85)
            draw.rounded_rectangle(
                [nx - 29, ny - 13, nx + 29, ny + 13],
                radius=5,
                fill=bg,
                outline=bd,
                width=2 if is_act else 1,
            )
            draw.text((nx - 22, ny - 5), p, fill=(255, 255, 255) if is_act else (148, 163, 184))
            if i < 4:
                draw.line([nx + 29, ny, nx + 39, ny], fill=(99, 102, 241), width=2)

        # Arena preview abaixo
        draw.rounded_rectangle(
            [60, 125, 110, 178], radius=6, fill=(16, 185, 129), outline=(110, 231, 183), width=2
        )
        draw.text((68, 146), "ALIADO", fill=(255, 255, 255))

        draw.rounded_rectangle(
            [250, 125, 300, 178], radius=6, fill=(225, 29, 72), outline=(253, 164, 175), width=2
        )
        draw.text((256, 146), "HORDA", fill=(255, 255, 255))

        status_msgs = [
            "Comprando 5 cartas do deck...",
            "Mago gerando +4 Cristais de Mana!",
            "Jogando carta: Garras de Magma!",
            "Reacao Elemental: VAPOR ATIVADO!",
            "Turno da Horda: Inimigo ataca!",
        ]
        draw.rounded_rectangle(
            [65, 88, 295, 112], radius=6, fill=(15, 23, 42), outline=(56, 189, 248), width=1
        )
        draw.text((80, 95), status_msgs[active], fill=(125, 211, 252))

        if active == 2:
            draw.line([112, 150, 248, 150], fill=(251, 146, 60), width=3)
        elif active == 3:
            draw.ellipse([235, 110, 315, 180], outline=(56, 189, 248), width=2)
        elif active == 4:
            draw.line([248, 150, 112, 150], fill=(244, 63, 94), width=3)

        frames.append(im)
    save_gif(frames, "fsm_turnos.gif")


# 2. Sistema de Ranks & Posições 1D (Darkest Dungeon)
def generate_2_ranks_posicoes():
    frames = []
    total_frames = 30
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "2. RANKS & POSICOES 1D (DARKEST DUNGEON)")

        # Divisória central da linha de frente
        draw.line([162, 42, 162, 182], fill=(245, 158, 11), width=2)
        draw.text((146, 32), "FRONT", fill=(251, 191, 36))

        # Swapping animation entre Rank 1 e Rank 2 aliados
        t = 0.0
        if 10 <= f <= 20:
            t = (f - 10) / 10.0
        elif f > 20:
            t = 1.0

        # Aliados Ranks 3, 2, 1 (x: 20, 68, 116)
        r3_x = 18
        r2_x = 64 + int(t * 48)
        r1_x = 112 - int(t * 48)

        # Slots base
        for idx, sx in enumerate([18, 64, 112]):
            rank_num = 3 - idx
            draw.rectangle([sx, 174, sx + 38, 181], fill=(30, 58, 138), outline=(96, 165, 250))
            draw.text((sx + 10, 185), f"R{rank_num}", fill=(147, 197, 253))

        # Monstro Rank 3 (Suporte)
        draw.rounded_rectangle(
            [r3_x + 4, 122, r3_x + 34, 172],
            radius=5,
            fill=(14, 165, 233),
            outline=(186, 230, 253),
            width=2,
        )
        # Monstro Rank 2 (Dano)
        draw.rounded_rectangle(
            [r2_x + 4, 115, r2_x + 34, 172],
            radius=5,
            fill=(168, 85, 247),
            outline=(233, 213, 255),
            width=2,
        )
        # Monstro Rank 1 (Tank)
        draw.rounded_rectangle(
            [r1_x + 4, 108, r1_x + 34, 172],
            radius=5,
            fill=(16, 185, 129),
            outline=(167, 243, 208),
            width=2,
        )

        if 8 <= f <= 22:
            draw.arc([68, 82, 144, 115], start=180, end=0, fill=(250, 204, 21), width=2)
            draw.text((82, 70), "SWAP POS!", fill=(250, 204, 21))

        # Inimigos Ranks 1, 2, 3, 4 (x: 174, 218, 262, 306)
        for idx, ex in enumerate([174, 218, 262, 306]):
            rank_num = idx + 1
            draw.rectangle([ex, 174, ex + 36, 181], fill=(127, 29, 29), outline=(248, 113, 113))
            draw.text((ex + 10, 185), f"R{rank_num}", fill=(252, 165, 165))
            eh = 115 + (idx % 2) * 10
            draw.rounded_rectangle(
                [ex + 4, eh, ex + 32, 172],
                radius=4,
                fill=(190, 18, 60),
                outline=(251, 113, 133),
                width=2,
            )

        frames.append(im)
    save_gif(frames, "ranks_posicoes.gif")


# 3. Mecânica de Alvos Restritos por Posição
def generate_3_alvos_restritos():
    frames = []
    total_frames = 28
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "3. ALVOS RESTRITOS POR POSICAO")

        # HUD de restrição de rank no topo (estilo bolinhas do Darkest Dungeon)
        draw.rounded_rectangle(
            [70, 38, 290, 68], radius=6, fill=(19, 24, 38), outline=(71, 85, 105)
        )
        draw.text((80, 47), "POS:", fill=(250, 204, 21))
        # Posições válidas de disparo: R1 e R2
        for i, valid in enumerate([False, True, True]):
            cx = 118 + i * 16
            draw.ellipse(
                [cx, 47, cx + 10, 57],
                fill=(250, 204, 21) if valid else (51, 65, 85),
                outline=(254, 240, 138),
            )

        draw.text((178, 47), "ALVO:", fill=(244, 63, 94))
        # Alvos válidos: R1 e R2 inimigos
        for i, valid in enumerate([True, True, False, False]):
            cx = 220 + i * 15
            draw.ellipse(
                [cx, 47, cx + 10, 57],
                fill=(244, 63, 94) if valid else (51, 65, 85),
                outline=(253, 164, 175),
            )

        # Monstro Atacante no Rank 1 (x=115)
        draw.rounded_rectangle(
            [110, 112, 144, 178], radius=5, fill=(16, 185, 129), outline=(250, 204, 21), width=2
        )

        # 4 Inimigos
        for idx, ex in enumerate([180, 224, 268, 312]):
            in_range = idx < 2
            col = (225, 29, 72) if in_range else (51, 65, 85)
            out = (251, 113, 133) if in_range else (100, 116, 139)
            draw.rounded_rectangle([ex, 118, ex + 32, 178], radius=4, fill=col, outline=out, width=2)
            if in_range and f % 6 < 4:
                # Mira pulsante nos ranks válidos
                draw.ellipse([ex + 4, 130, ex + 28, 154], outline=(254, 202, 202), width=2)
            elif not in_range:
                # X de fora de alcance
                draw.line([ex + 8, 135, ex + 24, 151], fill=(148, 163, 184), width=2)
                draw.line([ex + 24, 135, ex + 8, 151], fill=(148, 163, 184), width=2)

        # Arco de ataque conectando Rank 1 aliado aos Ranks 1 e 2 inimigos
        target_ex = 196 if f < 14 else 240
        draw.arc([127, 75, target_ex, 135], start=180, end=0, fill=(244, 63, 94), width=2)

        frames.append(im)
    save_gif(frames, "alvos_restritos.gif")


# 4. Câmera & Animação de Impacto (Darkest Dungeon Punch)
def generate_4_camera_impacto():
    frames = []
    total_frames = 26
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)

        is_punch = 8 <= f <= 18
        shake_x = ((f % 3) - 1) * 4 if 10 <= f <= 15 else 0
        shake_y = ((f % 2) * 2 - 1) * 3 if 10 <= f <= 15 else 0

        # Fundo com flash dramático no impacto
        bg_col = (45, 12, 22) if 10 <= f <= 13 else (11, 15, 23)
        draw.rectangle([0, 0, WIDTH, HEIGHT], fill=bg_col)

        if is_punch:
            # Speed lines dramáticas no fundo
            for y_line in range(45, 175, 18):
                draw.line(
                    [0, y_line + shake_y, WIDTH, y_line + shake_y], fill=(71, 25, 42), width=2
                )
            # Letterbox cinematográfico (barras pretas topo e base)
            draw.rectangle([0, 0, WIDTH, 34], fill=(0, 0, 0))
            draw.rectangle([0, 186, WIDTH, HEIGHT], fill=(0, 0, 0))
            draw.text((16, 10), "DARKEST IMPACT CAMERA (ZOOM + SHAKE)", fill=(251, 191, 36))
        else:
            draw_background(draw, "4. CAMERA & IMPACTO (DD PUNCH)")

        # Posição e escala do atacante e defensor (Zoom in no impacto)
        atk_x = 115 if is_punch else 60
        def_x = 195 + shake_x if is_punch else 255
        scale = 1.35 if is_punch else 1.0
        w = int(38 * scale)
        h = int(58 * scale)

        # Atacante dando lunge
        draw.rounded_rectangle(
            [atk_x, 178 - h + shake_y, atk_x + w, 178 + shake_y],
            radius=6,
            fill=(16, 185, 129),
            outline=(167, 243, 208),
            width=3 if is_punch else 2,
        )

        # Inimigo recebendo golpe
        hit_col = (255, 255, 255) if 10 <= f <= 12 else (225, 29, 72)
        draw.rounded_rectangle(
            [def_x, 178 - h + shake_y, def_x + w, 178 + shake_y],
            radius=6,
            fill=hit_col,
            outline=(253, 164, 175),
            width=3 if is_punch else 2,
        )

        if is_punch:
            # Slash & Crit Text
            draw.line(
                [def_x - 10, 100 + shake_y, def_x + w + 10, 170 + shake_y],
                fill=(254, 240, 138),
                width=4,
            )
            draw.text((def_x - 12, 68 + shake_y), "CRIT! -48", fill=(250, 204, 21))

        frames.append(im)
    save_gif(frames, "camera_impacto.gif")


# 5. Deck Dinâmico Multi-Monstro (Aggregate Deck)
def generate_5_deck_multimonstro():
    frames = []
    total_frames = 30
    cols = [(16, 185, 129), (59, 130, 246), (244, 63, 94)]
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "5. DECK DINAMICO MULTI-MONSTRO (3x10=30)", floor=False)

        # 3 Monstros no topo enviando 10 cartas cada
        for i, col in enumerate(cols):
            mx = 45 + i * 110
            draw.rounded_rectangle(
                [mx, 42, mx + 60, 82], radius=6, fill=col, outline=(255, 255, 255), width=2
            )
            draw.text((mx + 8, 56), "10 CARTAS", fill=(255, 255, 255))

            # Cartinhas voando para o deck central (180, 145)
            prog = ((f + i * 4) % 15) / 14.0
            cx = int((mx + 30) * (1 - prog) + 170 * prog)
            cy = int(82 * (1 - prog) + 145 * prog)
            draw.rounded_rectangle(
                [cx - 8, cy - 11, cx + 8, cy + 11], radius=2, fill=col, outline=(255, 255, 255)
            )

        # Deck Central Agregado (30 Cartas)
        draw.rounded_rectangle(
            [135, 135, 225, 195],
            radius=8,
            fill=(30, 41, 59),
            outline=(168, 85, 247),
            width=2,
        )
        draw.text((146, 152), "DECK UNIDO", fill=(216, 180, 254))
        draw.text((148, 170), "30 CARTAS", fill=(255, 255, 255))

        frames.append(im)
    save_gif(frames, "deck_multimonstro.gif")


# 6. Purga de Cartas por Queda (Card Purge on Knockout)
def generate_6_purga_cartas():
    frames = []
    total_frames = 30
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "6. PURGA DE CARTAS POR QUEDA (KO)", floor=False)

        is_ko = f >= 10

        # 3 Monstros no topo (o do meio leva KO no frame 10)
        m_cols = [(16, 185, 129), (239, 68, 68), (59, 130, 246)]
        for i, col in enumerate(m_cols):
            mx = 45 + i * 105
            dead = i == 1 and is_ko
            draw.rounded_rectangle(
                [mx, 42, mx + 60, 84],
                radius=6,
                fill=(30, 41, 59) if dead else col,
                outline=(100, 116, 139) if dead else (255, 255, 255),
                width=2,
            )
            draw.text(
                (mx + 10, 58), "0 HP (KO)" if dead else "VIVO", fill=(248, 113, 113) if dead else (255, 255, 255)
            )

        # Mão de 5 cartas embaixo (2 vermelhas são expurgadas quando o monstro 2 cai)
        hand_cols = [
            (16, 185, 129),
            (239, 68, 68),
            (59, 130, 246),
            (239, 68, 68),
            (16, 185, 129),
        ]
        for idx, c_col in enumerate(hand_cols):
            cx = 36 + idx * 60
            cy = 132
            is_red = idx in [1, 3]
            if is_red and is_ko:
                if f < 22:
                    # Desintegrando em partículas
                    fade = f - 10
                    draw.rounded_rectangle(
                        [cx, cy - fade, cx + 44, cy + 62 - fade],
                        radius=4,
                        outline=(244, 63, 94),
                        width=1,
                    )
                    draw.text((cx + 4, cy + 20 - fade), "PURGE", fill=(251, 113, 133))
            else:
                draw.rounded_rectangle(
                    [cx, cy, cx + 44, cy + 62],
                    radius=5,
                    fill=c_col,
                    outline=(255, 255, 255),
                    width=2,
                )

        deck_txt = "DECK: 20 CARTAS (-10 EXPURGADAS)" if is_ko else "DECK: 30 CARTAS ATIVAS"
        draw.text((75, 102), deck_txt, fill=(251, 113, 133) if is_ko else (148, 163, 184))

        frames.append(im)
    save_gif(frames, "purga_cartas.gif")


# 7. Sistema de Mana do Comandante (Mago Externo)
def generate_7_mana_comandante():
    frames = []
    total_frames = 28
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "7. MANA DO COMANDANTE (MAGO EXTERNO)")

        # Mago fora da linha na esquerda em moldura arcana
        draw.rounded_rectangle(
            [16, 48, 86, 135], radius=8, fill=(46, 16, 101), outline=(192, 132, 252), width=2
        )
        draw.text((28, 56), "MAGO", fill=(233, 213, 255))
        draw.ellipse([36, 75, 66, 105], fill=(139, 92, 246), outline=(255, 255, 255))

        # Cristais de Mana (4 cristais que vão sendo gastos nos frames)
        mana_left = 4 - (f // 7)
        draw.text((105, 46), f"MANA DO TURNO: {mana_left}/4", fill=(56, 189, 248))
        for m in range(4):
            mx = 108 + m * 28
            active = m < mana_left
            draw.polygon(
                [(mx + 8, 64), (mx + 16, 74), (mx + 8, 84), (mx, 74)],
                fill=(14, 165, 233) if active else (30, 41, 59),
                outline=(186, 230, 253) if active else (71, 85, 105),
            )

        # Feixe de mana canalizando do Mago para os monstros na linha de frente
        target_m = (f // 7) % 3
        tx = 135 + target_m * 65
        draw.line([86, 95, tx + 18, 135], fill=(56, 189, 248), width=3)

        for i in range(3):
            bx = 135 + i * 65
            glow = i == target_m
            draw.rounded_rectangle(
                [bx, 128, bx + 38, 178],
                radius=5,
                fill=(16, 185, 129) if glow else (30, 58, 138),
                outline=(125, 211, 252) if glow else (96, 165, 250),
                width=2,
            )

        frames.append(im)
    save_gif(frames, "mana_comandante.gif")


# 8. Telegrafo de Intenção Inimiga (Enemy Intent System)
def generate_8_intencao_inimiga():
    frames = []
    total_frames = 28
    intents = [
        ("ATK 18", (239, 68, 68)),
        ("VENENO", (168, 85, 247)),
        ("DEF +12", (59, 130, 246)),
    ]
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "8. TELEGRAFO DE INTENCAO INIMIGA")

        bob = int(math.sin(f * 0.45) * 4)

        # Monstro aliado na esquerda (alvo)
        draw.rounded_rectangle(
            [35, 120, 75, 178], radius=5, fill=(16, 185, 129), outline=(167, 243, 208), width=2
        )
        draw.text((38, 145), "ALVO", fill=(255, 255, 255))

        # 3 Inimigos na direita com balão de intenção flutuando acima
        for i, (label, col) in enumerate(intents):
            ex = 145 + i * 70
            # Balão de intenção
            draw.rounded_rectangle(
                [ex - 8, 62 + bob, ex + 48, 88 + bob],
                radius=6,
                fill=(15, 23, 42),
                outline=col,
                width=2,
            )
            draw.text((ex - 2, 70 + bob), label, fill=col)

            # Corpo do inimigo
            draw.rounded_rectangle(
                [ex + 2, 118, ex + 38, 178],
                radius=5,
                fill=(159, 18, 57),
                outline=(251, 113, 133),
                width=2,
            )

        # Linha pontilhada de previsão de ataque do inimigo 1 para o aliado
        if f % 4 < 3:
            draw.line([145, 135, 75, 145], fill=(239, 68, 68), width=2)

        frames.append(im)
    save_gif(frames, "intencao_inimiga.gif")


# 9. Matriz de Reações Elementais Emergentes
def generate_9_reacoes_elementais():
    frames = []
    total_frames = 30
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "9. MATRIZ DE REACOES ELEMENTAIS")

        # Equação no topo
        draw.rounded_rectangle(
            [40, 42, 110, 68], radius=6, fill=(14, 116, 144), outline=(56, 189, 248), width=2
        )
        draw.text((54, 50), "AGUA", fill=(255, 255, 255))

        draw.text((120, 50), "+", fill=(255, 255, 255))

        draw.rounded_rectangle(
            [138, 42, 208, 68], radius=6, fill=(194, 65, 12), outline=(251, 146, 60), width=2
        )
        draw.text((154, 50), "FOGO", fill=(255, 255, 255))

        draw.text((218, 50), "=", fill=(255, 255, 255))

        reac_active = f >= 14
        draw.rounded_rectangle(
            [235, 42, 325, 68],
            radius=6,
            fill=(109, 40, 217) if reac_active else (30, 41, 59),
            outline=(216, 180, 254),
            width=2,
        )
        draw.text((246, 50), "VAPOR (CEGA)", fill=(255, 255, 255))

        # Alvo no centro-direita
        tx, ty = 220, 115
        draw.rounded_rectangle(
            [tx, ty, tx + 44, ty + 62],
            radius=6,
            fill=(185, 28, 28),
            outline=(252, 165, 165),
            width=2,
        )

        if f < 14:
            # Alvo com status ÁGUA e projétil de FOGO chegando
            draw.ellipse([tx + 12, ty - 18, tx + 32, ty - 4], fill=(56, 189, 248))
            fx = 60 + int((f / 13.0) * 155)
            draw.ellipse([fx - 10, ty + 20, fx + 10, ty + 40], fill=(249, 115, 22))
        else:
            # Explosão de nuvem de Vapor!
            rad = (f - 14) * 3 + 18
            for ox, oy in [(-12, -8), (15, -5), (0, 12), (-8, 15)]:
                draw.ellipse(
                    [tx + 22 + ox - rad, ty + 25 + oy - rad, tx + 22 + ox + rad, ty + 25 + oy + rad],
                    fill=(203, 213, 225),
                    outline=(248, 250, 252),
                )
            draw.text((tx - 25, ty - 22), "REACAO: VAPOR!", fill=(250, 204, 21))

        frames.append(im)
    save_gif(frames, "reacoes_elementais.gif")


# 10. Transmutação Alquímica de Cartas
def generate_10_transmutacao_cartas():
    frames = []
    total_frames = 30
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "10. TRANSMUTACAO ALQUIMICA DE CARTAS", floor=False)

        # Carta base na esquerda
        draw.rounded_rectangle(
            [26, 62, 116, 185], radius=8, fill=(30, 41, 59), outline=(148, 163, 184), width=2
        )
        draw.text((36, 75), "GARRA BASE", fill=(226, 232, 240))
        draw.rectangle([38, 95, 104, 138], fill=(51, 65, 85))
        draw.text((42, 152), "FISICO: 8", fill=(148, 163, 184))

        # Mutágeno no centro
        angle = f * 12
        draw.ellipse([155, 95, 205, 145], outline=(249, 115, 22), width=2)
        draw.text((162, 114), "+FOGO", fill=(251, 146, 60))
        draw.line([122, 120, 150, 120], fill=(249, 115, 22), width=2)
        draw.line([210, 120, 238, 120], fill=(249, 115, 22), width=2)

        # Carta transmutada na direita
        glow = (f % 6 < 3)
        draw.rounded_rectangle(
            [244, 58, 336, 188],
            radius=8,
            fill=(124, 45, 18),
            outline=(250, 204, 21) if glow else (249, 115, 22),
            width=3,
        )
        draw.text((252, 72), "GARRA MAGMA", fill=(254, 240, 138))
        draw.rectangle([256, 95, 324, 138], fill=(234, 88, 12))
        draw.text((254, 148), "FOGO: 18", fill=(255, 255, 255))
        draw.text((254, 164), "+QUEIMA (3T)", fill=(253, 186, 116))

        frames.append(im)
    save_gif(frames, "transmutacao_cartas.gif")


# 11. Caldeirão & Síntese Alquímica (Crafting Bench)
def generate_11_caldeirao_sintese():
    frames = []
    total_frames = 30
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "11. CALDEIRAO & SINTESE ALQUIMICA")

        # Caldeirão no centro
        draw.pieslice([125, 105, 235, 185], start=0, end=180, fill=(30, 41, 59), outline=(148, 163, 184), width=3)
        draw.ellipse([128, 130, 232, 152], fill=(16, 185, 129), outline=(110, 231, 183), width=2)

        if f < 16:
            # 3 Ingredientes caindo no caldeirão
            prog = f / 15.0
            for idx, (ix, col) in enumerate([(100, (34, 197, 94)), (180, (56, 189, 248)), (260, (244, 63, 94))]):
                cx = int(ix * (1 - prog) + 180 * prog)
                cy = int(50 * (1 - prog) + 138 * prog)
                draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=col, outline=(255, 255, 255))
        else:
            # Bolhas subindo e Poção pronta brilhando!
            rise = (f - 16) * 3
            draw.rounded_rectangle(
                [162, 75 - min(25, rise), 198, 115 - min(25, rise)],
                radius=8,
                fill=(168, 85, 247),
                outline=(250, 204, 21),
                width=2,
            )
            draw.text((135, 40), "ELIXIR SINTETIZADO!", fill=(250, 204, 21))

        frames.append(im)
    save_gif(frames, "caldeirao_sintese.gif")


# 12. Incubadora de Monstros Arcanos
def generate_12_incubadora_monstros():
    frames = []
    total_frames = 30
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "12. INCUBADORA DE MONSTROS ARCANOS")

        # Câmara de vidro da incubadora
        draw.rounded_rectangle(
            [130, 48, 230, 178],
            radius=12,
            fill=(14, 116, 144),
            outline=(103, 232, 249),
            width=3,
        )
        draw.rectangle([122, 42, 238, 54], fill=(51, 65, 85), outline=(148, 163, 184))
        draw.rectangle([122, 170, 238, 182], fill=(51, 65, 85), outline=(148, 163, 184))

        # Tubos de catalisador elemental nas laterais
        draw.line([65, 115, 130, 115], fill=(249, 115, 22), width=4)
        draw.text((25, 95), "CATALISADOR", fill=(251, 146, 60))

        if f < 18:
            # Ovo vibrando dentro da incubadora
            shake = ((f % 3) - 1) * 3 if f > 10 else 0
            draw.ellipse(
                [154 + shake, 92, 206 + shake, 158],
                fill=(254, 243, 199),
                outline=(245, 158, 11),
                width=2,
            )
        else:
            # Criatura elemental recém-nascida!
            draw.rounded_rectangle(
                [152, 96, 208, 156],
                radius=10,
                fill=(249, 115, 22),
                outline=(254, 240, 138),
                width=2,
            )
            draw.ellipse([164, 110, 172, 118], fill=(255, 255, 255))
            draw.ellipse([188, 110, 196, 118], fill=(255, 255, 255))
            draw.text((246, 108), "NOVO MONSTRO!", fill=(250, 204, 21))

        frames.append(im)
    save_gif(frames, "incubadora_monstros.gif")


# 13. Sistema de Ferimento & Enfermaria
def generate_13_ferimento_enfermaria():
    frames = []
    total_frames = 28
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "13. SISTEMA DE FERIMENTO & ENFERMARIA")

        prog = min(1.0, f / 22.0)
        hp_pct = int(10 + prog * 90)
        healed = hp_pct >= 95

        # Cama/Slot de recuperação
        draw.rounded_rectangle(
            [110, 82, 250, 175],
            radius=10,
            fill=(19, 28, 46),
            outline=(16, 185, 129) if healed else (244, 63, 94),
            width=2,
        )

        # Monstro se recuperando
        m_col = (16, 185, 129) if healed else (127, 29, 29)
        draw.rounded_rectangle(
            [155, 105, 205, 158], radius=6, fill=m_col, outline=(255, 255, 255), width=2
        )

        # Barra de HP subindo
        draw.rectangle([110, 52, 250, 68], fill=(30, 41, 59), outline=(100, 116, 139))
        bar_w = int(140 * (hp_pct / 100.0))
        draw.rectangle(
            [110, 52, 110 + bar_w, 68],
            fill=(16, 185, 129) if hp_pct > 50 else (239, 68, 68),
        )
        draw.text(
            (132, 34),
            "PRONTO PARA LUTA!" if healed else f"FERIDO / INERTE ({hp_pct}%)",
            fill=(110, 231, 183) if healed else (252, 165, 165),
        )

        # Partículas de cura (+)
        if not healed and f % 3 == 0:
            draw.text((130, 110), "+ELIXIR", fill=(52, 211, 153))
            draw.text((215, 120), "+++", fill=(52, 211, 153))

        frames.append(im)
    save_gif(frames, "ferimento_enfermaria.gif")


# 14. Canil & Roster de Criaturas
def generate_14_canil_roster():
    frames = []
    total_frames = 28
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "14. CANIL & ROSTER DE CRIATURAS", floor=False)

        # Esquerda: Reserva do Canil (Grid 2x3)
        draw.text((24, 38), "RESERVA DO CANIL", fill=(148, 163, 184))
        for r in range(2):
            for c in range(3):
                gx = 22 + c * 46
                gy = 56 + r * 54
                sel = r == 0 and c == 2 and f < 14
                draw.rounded_rectangle(
                    [gx, gy, gx + 40, gy + 44],
                    radius=5,
                    fill=(30, 41, 59),
                    outline=(250, 204, 21) if sel else (71, 85, 105),
                    width=2 if sel else 1,
                )
                draw.ellipse([gx + 10, gy + 12, gx + 30, gy + 32], fill=(59, 130, 246))

        # Direita: Comitiva Ativa (3 Slots de Combate)
        draw.text((215, 38), "EQUIPE ATIVA (3)", fill=(110, 231, 183))
        for s in range(3):
            sy = 56 + s * 46
            active_swap = s == 1 and f >= 14
            draw.rounded_rectangle(
                [215, sy, 335, sy + 38],
                radius=6,
                fill=(6, 78, 59) if active_swap else (19, 28, 46),
                outline=(52, 211, 153) if active_swap else (59, 130, 246),
                width=2,
            )
            draw.text((228, sy + 12), f"RANK {s+1}: MONSTRO", fill=(255, 255, 255))

        # Seta de escalação
        draw.line([168, 95, 208, 95], fill=(250, 204, 21), width=3)

        frames.append(im)
    save_gif(frames, "canil_roster.gif")


# 15. Slots de Relíquias do Mago
def generate_15_reliquias_mago():
    frames = []
    total_frames = 27
    relics = [
        ("AMULETO SOLAR", "+1 MANA TURNO 1", (250, 204, 21)),
        ("CALICE VAPOR", "+25% DANO VAPOR", (56, 189, 248)),
        ("ANEL RUNICO", "+10 ESCUDO BASE", (168, 85, 247)),
    ]
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "15. SLOTS DE RELIQUIAS DO MAGO (3 PASSIVAS)", floor=False)

        active = (f // 9) % 3
        for i, (name, buff, col) in enumerate(relics):
            rx = 32 + i * 105
            is_act = i == active
            draw.rounded_rectangle(
                [rx, 52, rx + 88, 132],
                radius=10,
                fill=(30, 27, 46) if is_act else (19, 24, 38),
                outline=col if is_act else (71, 85, 105),
                width=3 if is_act else 1,
            )
            draw.ellipse([rx + 26, 68, rx + 62, 104], fill=col)
            draw.text((rx + 6, 112), name[:11], fill=(255, 255, 255))

        # Banner de efeito global ativo
        _, active_buff, active_col = relics[active]
        draw.rounded_rectangle(
            [55, 152, 305, 192], radius=8, fill=(15, 23, 42), outline=active_col, width=2
        )
        draw.text((85, 166), f"PASSIVA GLOBAL: {active_buff}", fill=active_col)

        frames.append(im)
    save_gif(frames, "reliquias_mago.gif")


# 16. Gerador de Mapa de Incursão em Nós
def generate_16_mapa_incursao():
    frames = []
    total_frames = 30
    nodes = [
        (45, 115, "BASE", (16, 185, 129)),
        (125, 72, "HORDA", (239, 68, 68)),
        (125, 155, "ERVAS", (34, 197, 94)),
        (215, 72, "ALTAR", (168, 85, 247)),
        (215, 155, "ELITE", (249, 115, 22)),
        (305, 115, "BOSS", (225, 29, 72)),
    ]
    edges = [(0, 1), (0, 2), (1, 3), (2, 4), (1, 4), (3, 5), (4, 5)]
    path_seq = [0, 1, 3, 5]

    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "16. MAPA DE INCURSAO EM NOS (EXPEDICAO)", floor=False)

        for a, b in edges:
            x1, y1, _, _ = nodes[a]
            x2, y2, _, _ = nodes[b]
            draw.line([x1, y1, x2, y2], fill=(71, 85, 105), width=2)

        step = path_seq[(f // 8) % len(path_seq)]
        for idx, (nx, ny, label, col) in enumerate(nodes):
            is_curr = idx == step
            rad = 18 if is_curr else 14
            draw.ellipse(
                [nx - rad, ny - rad, nx + rad, ny + rad],
                fill=col,
                outline=(255, 255, 255) if is_curr else (30, 41, 59),
                width=3 if is_curr else 1,
            )
            draw.text((nx - 16, ny + 20), label, fill=(255, 255, 255))

        frames.append(im)
    save_gif(frames, "mapa_incursao.gif")


# 17. Construção do Império Arcano (Base Building Meta-Hub)
def generate_17_construcao_imperio():
    frames = []
    total_frames = 30
    buildings = [
        ("CALDEIRAO MESTRE", (16, 185, 129), 35),
        ("TORRE DE CRISTAL", (56, 189, 248), 140),
        ("INCUBADORA REAL", (168, 85, 247), 245),
    ]
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "17. CONSTRUCAO DO IMPERIO ARCANO (HUB)")

        built_count = (f // 8) + 1
        for i, (bname, col, bx) in enumerate(buildings):
            if i < built_count:
                draw.rounded_rectangle(
                    [bx, 85, bx + 80, 180],
                    radius=6,
                    fill=col,
                    outline=(255, 255, 255),
                    width=2,
                )
                draw.polygon(
                    [(bx - 4, 85), (bx + 40, 52), (bx + 84, 85)],
                    fill=(30, 41, 59),
                    outline=col,
                )
                draw.text((bx + 6, 125), bname[:10], fill=(255, 255, 255))
            else:
                draw.rounded_rectangle(
                    [bx, 110, bx + 80, 180],
                    radius=6,
                    outline=(71, 85, 105),
                    width=1,
                )
                draw.text((bx + 14, 140), "SLOT BASE", fill=(100, 116, 139))

        frames.append(im)
    save_gif(frames, "construcao_imperio.gif")


# 18. Inventário de Reagentes & Essências
def generate_18_inventario_reagentes():
    frames = []
    total_frames = 28
    items = [
        ("ERVA", (34, 197, 94), 12),
        ("MANA", (56, 189, 248), 24),
        ("FOGO", (249, 115, 22), 8),
        ("RAIO", (250, 204, 21), 15),
        ("GELO", (125, 211, 252), 19),
        ("FRASCO", (168, 85, 247), 6),
        ("OVO", (253, 186, 116), 3),
        ("CINZAS", (148, 163, 184), 45),
    ]
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "18. INVENTARIO DE REAGENTES & ESSENCIAS", floor=False)

        highlight = (f // 4) % 8
        for idx, (name, col, qty) in enumerate(items):
            r = idx // 4
            c = idx % 4
            gx = 28 + c * 80
            gy = 48 + r * 76
            is_hi = idx == highlight
            draw.rounded_rectangle(
                [gx, gy, gx + 68, gy + 64],
                radius=8,
                fill=(30, 41, 59) if is_hi else (19, 24, 38),
                outline=(250, 204, 21) if is_hi else (51, 65, 85),
                width=2 if is_hi else 1,
            )
            draw.ellipse([gx + 20, gy + 10, gx + 48, gy + 38], fill=col)
            draw.text((gx + 8, gy + 44), f"{name} x{qty + (1 if is_hi else 0)}", fill=(255, 255, 255))

        frames.append(im)
    save_gif(frames, "inventario_reagentes.gif")


if __name__ == "__main__":
    print("Gerando os 5 GIFs originais + 18 GIFs das mecânicas do Spellchemy...")
    generate_jump_gif()
    generate_fsm_gif()
    generate_dash_gif()
    generate_wall_jump_gif()
    generate_shooting_gif()

    generate_1_fsm_turnos()
    generate_2_ranks_posicoes()
    generate_3_alvos_restritos()
    generate_4_camera_impacto()
    generate_5_deck_multimonstro()
    generate_6_purga_cartas()
    generate_7_mana_comandante()
    generate_8_intencao_inimiga()
    generate_9_reacoes_elementais()
    generate_10_transmutacao_cartas()
    generate_11_caldeirao_sintese()
    generate_12_incubadora_monstros()
    generate_13_ferimento_enfermaria()
    generate_14_canil_roster()
    generate_15_reliquias_mago()
    generate_16_mapa_incursao()
    generate_17_construcao_imperio()
    generate_18_inventario_reagentes()
    print("Sucesso! Todos os 23 GIFs foram gerados em:", OUTPUT_DIR)
    print("E copiados para o Obsidian em:", OBSIDIAN_GIFS_DIR)
