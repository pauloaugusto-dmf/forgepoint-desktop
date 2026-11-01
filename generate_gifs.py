import os
import math
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = "/home/paulo/projects/forgepoint-desktop/src/assets/mechanics"
WIDTH, HEIGHT = 360, 220
FPS = 25
DURATION = 50  # ms per frame

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Helper para desenhar grid de fundo estilo game dev retro
def draw_background(draw, title=""):
    # Fundo escuro com degradê suave ou blocos
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill=(11, 15, 23))
    
    # Grid de desenvolvimento (linhas suaves)
    for x in range(0, WIDTH, 20):
        draw.line([x, 0, x, HEIGHT], fill=(18, 25, 38), width=1)
    for y in range(0, HEIGHT, 20):
        draw.line([0, y, WIDTH, y], fill=(18, 25, 38), width=1)
        
    # Chão
    floor_y = 180
    draw.rectangle([0, floor_y, WIDTH, HEIGHT], fill=(22, 30, 48))
    draw.line([0, floor_y, WIDTH, floor_y], fill=(59, 130, 246), width=2)
    # Detalhes no chão
    for x in range(0, WIDTH, 16):
        draw.line([x, floor_y+4, x+8, floor_y+12], fill=(30, 41, 65), width=1)
        
    # Badge do topo
    if title:
        draw.rounded_rectangle([12, 10, 12 + len(title)*8 + 18, 30], radius=5, fill=(19, 24, 38), outline=(139, 92, 246), width=1)
        draw.text((20, 14), title, fill=(167, 139, 250))


# ==========================================
# 1. PULO & GRAVIDADE (Parabola Arc & Land)
# ==========================================
def generate_jump_gif():
    frames = []
    total_frames = 30
    floor_y = 180
    char_w, char_h = 24, 32
    
    # Trajetória parabólica
    traj_points = []
    for f in range(total_frames):
        t = f / (total_frames - 1)
        # Movimento em X: vai de 40 a 320
        x = 40 + t * 280
        # Movimento em Y: arco parabólico
        # apex no meio
        h_jump = 100 * math.sin(t * math.pi)
        y = floor_y - char_h - h_jump
        traj_points.append((x, y + char_h))

    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "MECÂNICA: PULO & GRAVIDADE")
        
        # Desenha a linha de trajetória pontilhada
        for i in range(0, len(traj_points)-1, 2):
            draw.line([traj_points[i], traj_points[i+1]], fill=(56, 189, 248), width=1)
            
        t = f / (total_frames - 1)
        x = 40 + t * 280
        h_jump = 100 * math.sin(t * math.pi)
        y = floor_y - char_h - h_jump
        
        # Sombra no chão
        shadow_w = max(10, char_w - int(h_jump * 0.15))
        draw.ellipse([x - shadow_w//2 + char_w//2, floor_y - 3, x + shadow_w//2 + char_w//2, floor_y + 3], fill=(8, 11, 18))
        
        # Squash & Stretch
        scale_y = 1.0
        scale_x = 1.0
        if t < 0.1:  # Preparação / Takeoff
            scale_y = 0.8
            scale_x = 1.2
        elif t > 0.4 and t < 0.6:  # Ápice
            scale_y = 1.15
            scale_x = 0.9
        elif t > 0.9:  # Pouso
            scale_y = 0.75
            scale_x = 1.3
            
        cw = int(char_w * scale_x)
        ch = int(char_h * scale_y)
        cx = x + (char_w - cw)//2
        cy = y + (char_h - ch)
        
        # Corpo do personagem (estilo pixel cyan/violet)
        draw.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=4, fill=(6, 182, 212), outline=(165, 243, 252), width=2)
        # Olho / viseira
        draw.rectangle([cx + cw - 8, cy + 6, cx + cw - 2, cy + 12], fill=(255, 255, 255))
        
        # Efeito de poeira no pouso ou subida
        if t < 0.15 or t > 0.88:
            dust_radius = 4
            draw.ellipse([cx - 8, floor_y - 6, cx - 2, floor_y], fill=(148, 163, 184))
            draw.ellipse([cx + cw + 2, floor_y - 6, cx + cw + 8, floor_y], fill=(148, 163, 184))

        frames.append(im)
        
    frames[0].save(
        os.path.join(OUTPUT_DIR, "pulo_gravidade.gif"),
        save_all=True,
        append_images=frames[1:],
        duration=DURATION,
        loop=0
    )


# ==========================================
# 2. STATE MACHINE (FSM States Diagram)
# ==========================================
def generate_fsm_gif():
    frames = []
    total_frames = 36
    
    states = ["IDLE", "RUN", "JUMP", "ATTACK"]
    num_states = len(states)
    
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "FINITE STATE MACHINE (FSM)")
        
        current_state_idx = (f // 9) % num_states
        
        # Desenha nós dos estados no topo
        node_y = 65
        for i, s in enumerate(states):
            nx = 45 + i * 78
            is_active = (i == current_state_idx)
            
            # Caixa do nó de estado
            bg_col = (139, 92, 246) if is_active else (24, 30, 44)
            border_col = (216, 180, 254) if is_active else (51, 65, 85)
            text_col = (255, 255, 255) if is_active else (148, 163, 184)
            
            draw.rounded_rectangle([nx - 28, node_y - 14, nx + 28, node_y + 14], radius=6, fill=bg_col, outline=border_col, width=2 if is_active else 1)
            draw.text((nx - 14, node_y - 6), s, fill=text_col)
            
            # Seta para o próximo
            if i < num_states - 1:
                draw.line([nx + 30, node_y, nx + 48, node_y], fill=(100, 116, 139), width=2)
                draw.polygon([(nx + 48, node_y), (nx + 43, node_y - 4), (nx + 43, node_y + 4)], fill=(100, 116, 139))
                
        # Personagem central exibindo a pose de acordo com o estado
        cx, cy = 180, 148
        char_w, char_h = 24, 32
        
        if states[current_state_idx] == "IDLE":
            breathe = int(math.sin(f * 0.4) * 2)
            draw.rounded_rectangle([cx - 12, cy - 16 + breathe, cx + 12, cy + 16], radius=4, fill=(16, 185, 129), outline=(110, 231, 183), width=2)
            draw.rectangle([cx + 2, cy - 10 + breathe, cx + 8, cy - 4 + breathe], fill=(255, 255, 255))
        elif states[current_state_idx] == "RUN":
            leg_offset = int(math.sin(f * 1.2) * 8)
            draw.rounded_rectangle([cx - 12 + (f%4)*2 - 4, cy - 16, cx + 12 + (f%4)*2 - 4, cy + 16], radius=4, fill=(59, 130, 246), outline=(147, 197, 253), width=2)
            draw.rectangle([cx + 4, cy - 10, cx + 10, cy - 4], fill=(255, 255, 255))
            # Linhas de movimento
            draw.line([cx - 24, cy, cx - 16, cy], fill=(96, 165, 250), width=2)
            draw.line([cx - 28, cy + 8, cx - 18, cy + 8], fill=(96, 165, 250), width=2)
        elif states[current_state_idx] == "JUMP":
            jump_y = cy - 20
            draw.rounded_rectangle([cx - 12, jump_y - 16, cx + 12, jump_y + 16], radius=4, fill=(245, 158, 11), outline=(252, 211, 77), width=2)
            draw.rectangle([cx + 2, jump_y - 10, cx + 8, jump_y - 4], fill=(255, 255, 255))
            draw.ellipse([cx - 8, cy + 14, cx + 8, cy + 18], fill=(8, 11, 18))
        elif states[current_state_idx] == "ATTACK":
            draw.rounded_rectangle([cx - 12, cy - 16, cx + 12, cy + 16], radius=4, fill=(239, 68, 68), outline=(252, 165, 165), width=2)
            draw.rectangle([cx + 2, cy - 10, cx + 8, cy - 4], fill=(255, 255, 255))
            # Slash arc
            draw.arc([cx + 8, cy - 22, cx + 46, cy + 18], start=-45, end=65, fill=(254, 202, 202), width=3)
            draw.polygon([(cx + 42, cy - 5), (cx + 48, cy), (cx + 40, cy + 5)], fill=(239, 68, 68))

        frames.append(im)
        
    frames[0].save(
        os.path.join(OUTPUT_DIR, "state_machine.gif"),
        save_all=True,
        append_images=frames[1:],
        duration=70,
        loop=0
    )


# ==========================================
# 3. DASH / ESQUIVA (Ghosting Trail + I-Frames)
# ==========================================
def generate_dash_gif():
    frames = []
    total_frames = 28
    floor_y = 180
    char_w, char_h = 24, 32
    
    positions = []
    for f in range(total_frames):
        if f < 8:
            # Caminhando devagar
            x = 50 + f * 4
            is_dashing = False
        elif f < 18:
            # DASH rápido!
            dash_progress = (f - 8) / 10
            x = 82 + dash_progress * 180
            is_dashing = True
        else:
            # Freando após o dash
            x = 262 + (f - 18) * 3
            is_dashing = False
        positions.append((x, is_dashing))
        
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "MECÂNICA: DASH & I-FRAMES")
        
        x, is_dashing = positions[f]
        y = floor_y - char_h
        
        # Se estiver no dash, desenha trails (rastros anteriores / ghosting)
        if is_dashing:
            for trail_offset in [3, 2, 1]:
                prev_idx = max(0, f - trail_offset)
                px, _ = positions[prev_idx]
                alpha_col = (14, 116, 144) if trail_offset == 3 else (6, 182, 212)
                draw.rounded_rectangle([px, y, px + char_w, y + char_h], radius=4, fill=alpha_col, outline=(34, 211, 238), width=1)
                
            # Speed lines neon
            for ly in range(y + 6, y + char_h, 8):
                draw.line([x - 50, ly, x - 10, ly], fill=(56, 189, 248), width=2)
                
        # Personagem com flash de invulnerabilidade (i-frames)
        fill_col = (255, 255, 255) if (is_dashing and (f % 2 == 0)) else (14, 165, 233)
        outline_col = (56, 189, 248)
        
        draw.rounded_rectangle([x, y, x + char_w, y + char_h], radius=4, fill=fill_col, outline=outline_col, width=2)
        draw.rectangle([x + char_w - 7, y + 6, x + char_w - 2, y + 12], fill=(15, 23, 42))
        
        # Indicador de Cooldown no canto direito
        cd_x, cd_y = 310, 45
        draw.ellipse([cd_x - 12, cd_y - 12, cd_x + 12, cd_y + 12], outline=(51, 65, 85), width=2)
        cd_angle = (f / total_frames) * 360
        draw.pieslice([cd_x - 12, cd_y - 12, cd_x + 12, cd_y + 12], start=-90, end=-90 + cd_angle, fill=(56, 189, 248))
        draw.text((290, 62), "COOLDOWN", fill=(148, 163, 184))

        frames.append(im)
        
    frames[0].save(
        os.path.join(OUTPUT_DIR, "dash_esquiva.gif"),
        save_all=True,
        append_images=frames[1:],
        duration=DURATION,
        loop=0
    )


# ==========================================
# 4. WALL JUMP & SLIDE
# ==========================================
def generate_wall_jump_gif():
    frames = []
    total_frames = 34
    
    wall_left_x = 70
    wall_right_x = 290
    
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "MECÂNICA: WALL SLIDE & JUMP")
        
        # Paredes verticais
        draw.rectangle([0, 40, wall_left_x, 180], fill=(24, 30, 44), outline=(59, 130, 246), width=2)
        draw.rectangle([wall_right_x, 40, WIDTH, 180], fill=(24, 30, 44), outline=(59, 130, 246), width=2)
        
        # Trajetória do personagem
        # 0..10: pulando na parede esquerda e deslizando
        # 11..22: pulo da parede esquerda para a direita
        # 23..34: desliza na direita e salta para cima
        char_w, char_h = 22, 28
        
        if f <= 10:
            # Desliza parede esquerda
            cx = wall_left_x
            cy = 80 + f * 5
            is_sliding = True
            slide_wall = "left"
        elif f <= 22:
            # Salta em arco para parede direita
            prog = (f - 11) / 11
            cx = wall_left_x + prog * (wall_right_x - char_w - wall_left_x)
            cy = 130 - math.sin(prog * math.pi) * 60
            is_sliding = False
            slide_wall = None
        else:
            # Desliza na direita
            cx = wall_right_x - char_w
            cy = 80 + (f - 23) * 4
            is_sliding = True
            slide_wall = "right"
            
        # Faíscas de fricção na parede
        if is_sliding:
            spark_x = wall_left_x + 1 if slide_wall == "left" else wall_right_x - 2
            for s in range(3):
                sy = cy + 10 + (f * 5 + s * 7) % 15
                draw.point((spark_x, sy), fill=(251, 191, 36))
                draw.point((spark_x + (-2 if slide_wall == "right" else 2), sy + 2), fill=(245, 158, 11))

        # Personagem
        draw.rounded_rectangle([cx, cy, cx + char_w, cy + char_h], radius=4, fill=(168, 85, 247), outline=(216, 180, 254), width=2)
        draw.rectangle([cx + (char_w - 6 if slide_wall != "left" else 2), cy + 5, cx + (char_w - 2 if slide_wall != "left" else 6), cy + 10], fill=(255, 255, 255))
        
        frames.append(im)
        
    frames[0].save(
        os.path.join(OUTPUT_DIR, "wall_jump.gif"),
        save_all=True,
        append_images=frames[1:],
        duration=65,
        loop=0
    )


# ==========================================
# 5. SISTEMA DE TIRO & PROJÉTEIS
# ==========================================
def generate_shooting_gif():
    frames = []
    total_frames = 30
    
    char_x, char_y = 60, 148
    char_w, char_h = 24, 32
    target_x = 300
    
    bullets = []
    # Cria ondas de projéteis
    for fire_frame in [0, 8, 16, 24]:
        bullets.append(fire_frame)
        
    for f in range(total_frames):
        im = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 23))
        draw = ImageDraw.Draw(im)
        draw_background(draw, "MECÂNICA: POOLING DE PROJÉTEIS")
        
        # Alvo / Dummy na direita
        draw.rounded_rectangle([target_x, 136, target_x + 26, 180], radius=5, fill=(185, 28, 28), outline=(239, 68, 68), width=2)
        draw.line([target_x + 5, 148, target_x + 21, 148], fill=(254, 202, 202), width=2)
        draw.line([target_x + 13, 140, target_x + 13, 156], fill=(254, 202, 202), width=2)
        
        # Personagem atirador
        recoil = 3 if any((f - bf) in [0, 1] for bf in bullets) else 0
        draw.rounded_rectangle([char_x - recoil, char_y, char_x + char_w - recoil, char_y + char_h], radius=4, fill=(16, 185, 129), outline=(110, 231, 183), width=2)
        # Arma / canhão
        draw.rectangle([char_x + char_w - recoil, char_y + 10, char_x + char_w + 12 - recoil, char_y + 16], fill=(51, 65, 85))
        
        # Muzzle flash
        if any(f == bf for bf in bullets):
            draw.polygon([
                (char_x + char_w + 12, char_y + 13),
                (char_x + char_w + 22, char_y + 7),
                (char_x + char_w + 18, char_y + 13),
                (char_x + char_w + 22, char_y + 19)
            ], fill=(250, 204, 21))
            
        # Projéteis voando e impactando
        for bf in bullets:
            bullet_age = (f - bf) % total_frames
            if bullet_age >= 0 and bullet_age < 15:
                # Projétil em voo
                prog = bullet_age / 14
                bx = (char_x + char_w + 14) + prog * (target_x - (char_x + char_w + 14))
                by = char_y + 13
                # Glow & Bullet
                draw.ellipse([bx - 6, by - 4, bx + 6, by + 4], fill=(253, 224, 71))
                draw.line([bx - 14, by, bx - 2, by], fill=(250, 204, 21), width=2)
                
            elif bullet_age == 15 or bullet_age == 16:
                # Impact spark no alvo
                ix, iy = target_x, char_y + 13
                draw.line([ix - 6, iy - 6, ix + 6, iy + 6], fill=(250, 204, 21), width=2)
                draw.line([ix - 6, iy + 6, ix + 6, iy - 6], fill=(250, 204, 21), width=2)
                draw.ellipse([ix - 4, iy - 4, ix + 4, iy + 4], fill=(254, 240, 138))

        frames.append(im)
        
    frames[0].save(
        os.path.join(OUTPUT_DIR, "tiro_projeteis.gif"),
        save_all=True,
        append_images=frames[1:],
        duration=50,
        loop=0
    )


if __name__ == "__main__":
    print("Gerando GIFs de demonstração...")
    generate_jump_gif()
    print("1/5 Pulo & Gravidade OK")
    generate_fsm_gif()
    print("2/5 State Machine OK")
    generate_dash_gif()
    print("3/5 Dash & Esquiva OK")
    generate_wall_jump_gif()
    print("4/5 Wall Jump OK")
    generate_shooting_gif()
    print("5/5 Sistema de Tiro OK")
    print("Concluído! GIFs salvos em:", OUTPUT_DIR)
