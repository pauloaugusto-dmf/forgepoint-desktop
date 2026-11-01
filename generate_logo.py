import os
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = "/home/paulo/projects/forgepoint-desktop/src/assets"
SIZE = 1024  # Render em alta resolução 1024x1024 e depois downscale para 512x512

im = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(im)

# 1. Base Squircle com Gradiente e Sombra
padding = 48
r = 220
# Sombra externa
for offset in range(24, 0, -4):
    alpha = int((24 - offset) * 3)
    draw.rounded_rectangle(
        [padding + 8, padding + 16, SIZE - padding - 8, SIZE - padding + 24],
        radius=r,
        fill=(0, 0, 0, alpha)
    )

# Fundo escuro Obsidian
draw.rounded_rectangle(
    [padding, padding, SIZE - padding, SIZE - padding],
    radius=r,
    fill=(14, 18, 28, 255)
)

# Borda externa Neon Violet & Cyan
draw.rounded_rectangle(
    [padding, padding, SIZE - padding, SIZE - padding],
    radius=r,
    outline=(139, 92, 246, 255),
    width=14
)
draw.rounded_rectangle(
    [padding + 10, padding + 10, SIZE - padding - 10, SIZE - padding - 10],
    radius=r - 10,
    outline=(6, 182, 212, 160),
    width=6
)

# Brilho radial no centro (glow de forja)
glow_center = (SIZE // 2, SIZE // 2 - 30)
for radius in range(320, 40, -20):
    intensity = int((320 - radius) / 320 * 65)
    draw.ellipse(
        [glow_center[0] - radius, glow_center[1] - radius,
         glow_center[0] + radius, glow_center[1] + radius],
        fill=(139, 92, 246, intensity)
    )

# 2. A BIGORNA (The Anvil of Game Dev)
# Base e corpo da bigorna
anvil_color = (28, 36, 54)
anvil_highlight = (79, 70, 229)
anvil_hot = (245, 158, 11)

# Base da bigorna
draw.polygon([
    (300, 780),
    (724, 780),
    (670, 710),
    (354, 710)
], fill=(22, 28, 42))
draw.line([(300, 780), (724, 780)], fill=(139, 92, 246), width=8)

# Coluna / Cintura da bigorna
draw.polygon([
    (360, 710),
    (664, 710),
    (620, 580),
    (404, 580)
], fill=(30, 39, 58))

# Topo da bigorna (Platô largo com chifre esquerdo pontiagudo)
draw.polygon([
    (180, 500),  # Ponta do chifre
    (270, 460),
    (770, 460),  # Lado direito
    (790, 500),
    (750, 580),
    (400, 580),
    (270, 580)
], fill=(38, 48, 72))

# Face superior metálica iluminada
draw.polygon([
    (180, 500),
    (270, 460),
    (770, 460),
    (790, 500),
    (730, 515),
    (250, 515)
], fill=(67, 56, 202))

# 3. GAME CONTROLLER FLUTUANDO / FORJADO ACIMA DA BIGORNA
# Controle de videogame com corpo estilizado em Violet / Cyan
pad_x, pad_y = 512, 340
pad_w, pad_h = 460, 240

# Silhueta do controle
# Asas esquerda e direita
left_grip = [
    (pad_x - 220, pad_y + 110),
    (pad_x - 140, pad_y - 80),
    (pad_x - 40, pad_y - 80),
    (pad_x, pad_y - 40),
    (pad_x + 40, pad_y - 80),
    (pad_x + 140, pad_y - 80),
    (pad_x + 220, pad_y + 110),
    (pad_x + 160, pad_y + 150),
    (pad_x + 80, pad_y + 70),
    (pad_x - 80, pad_y + 70),
    (pad_x - 160, pad_y + 150)
]

draw.polygon(left_grip, fill=(20, 24, 38))
draw.line(left_grip + [left_grip[0]], fill=(167, 139, 250), width=10)

# Face interna do controle
inner_grip = [
    (pad_x - 200, pad_y + 95),
    (pad_x - 130, pad_y - 65),
    (pad_x - 35, pad_y - 65),
    (pad_x, pad_y - 30),
    (pad_x + 35, pad_y - 65),
    (pad_x + 130, pad_y - 65),
    (pad_x + 200, pad_y + 95),
    (pad_x + 150, pad_y + 130),
    (pad_x + 75, pad_y + 60),
    (pad_x - 75, pad_y + 60),
    (pad_x - 150, pad_y + 130)
]
draw.polygon(inner_grip, fill=(124, 58, 237))

# D-PAD (Cruz na esquerda)
dpad_cx, dpad_cy = pad_x - 110, pad_y + 15
d_w, d_len = 18, 48
# Horizontal
draw.rounded_rectangle(
    [dpad_cx - d_len, dpad_cy - d_w, dpad_cx + d_len, dpad_cy + d_w],
    radius=6, fill=(15, 23, 42), outline=(56, 189, 248), width=4
)
# Vertical
draw.rounded_rectangle(
    [dpad_cx - d_w, dpad_cy - d_len, dpad_cx + d_w, dpad_cy + d_len],
    radius=6, fill=(15, 23, 42), outline=(56, 189, 248), width=4
)
# Centro do d-pad
draw.rectangle([dpad_cx - d_w, dpad_cy - d_w, dpad_cx + d_w, dpad_cy + d_w], fill=(15, 23, 42))
draw.ellipse([dpad_cx - 6, dpad_cy - 6, dpad_cx + 6, dpad_cy + 6], fill=(56, 189, 248))

# BOTÕES DE AÇÃO (4 botões de diamante na direita)
btn_cx, btn_cy = pad_x + 110, pad_y + 15
btn_r = 16
# Topo (Y)
draw.ellipse([btn_cx - btn_r, btn_cy - 34 - btn_r, btn_cx + btn_r, btn_cy - 34 + btn_r], fill=(234, 179, 8), outline=(254, 240, 138), width=3)
# Direita (B)
draw.ellipse([btn_cx + 34 - btn_r, btn_cy - btn_r, btn_cx + 34 + btn_r, btn_cy + btn_r], fill=(239, 68, 68), outline=(254, 202, 202), width=3)
# Baixo (A)
draw.ellipse([btn_cx - btn_r, btn_cy + 34 - btn_r, btn_cx + btn_r, btn_cy + 34 + btn_r], fill=(16, 185, 129), outline=(167, 243, 208), width=3)
# Esquerda (X)
draw.ellipse([btn_cx - 34 - btn_r, btn_cy - btn_r, btn_cx - 34 + btn_r, btn_cy + btn_r], fill=(59, 130, 246), outline=(191, 219, 254), width=3)

# CRISTAL / EMBLEMA DE FORJA NO CENTRO DO CONTROLE
# Losango de energia cyan/ouro com faíscas
core_y = pad_y - 5
draw.polygon([
    (pad_x, core_y - 28),
    (pad_x + 24, core_y),
    (pad_x, core_y + 28),
    (pad_x - 24, core_y)
], fill=(6, 182, 212), outline=(255, 255, 255), width=4)

# 4. MARTELO DE FORJA (Blacksmith Hammer) CRUZADO / EM AÇÃO
hammer_head = [
    (680, 180),
    (790, 230),
    (740, 310),
    (630, 260)
]
draw.polygon(hammer_head, fill=(51, 65, 85))
draw.line(hammer_head + [hammer_head[0]], fill=(148, 163, 184), width=6)
# Cabo do martelo de madeira/aço inclinado
draw.line([(690, 250), (840, 430)], fill=(180, 83, 9), width=18)
draw.line([(690, 250), (840, 430)], fill=(245, 158, 11), width=8)

# 5. FAÍSCAS DE FORJA E PIXELS (Game Dev Sparks)
sparks = [
    (pad_x - 60, pad_y - 120, 14, (250, 204, 21)),
    (pad_x + 70, pad_y - 110, 18, (56, 189, 248)),
    (pad_x - 130, pad_y - 90, 12, (244, 63, 94)),
    (pad_x + 140, pad_y - 130, 14, (168, 85, 247)),
    (pad_x + 10, pad_y - 160, 20, (255, 255, 255)),
    (pad_x - 170, pad_y + 190, 10, (56, 189, 248)),
    (pad_x + 180, pad_y + 190, 12, (250, 204, 21)),
    (480, 440, 16, (253, 224, 71)),
    (540, 430, 14, (56, 189, 248)),
]

for sx, sy, size_s, col in sparks:
    # Diamante / Pixel spark
    draw.polygon([
        (sx, sy - size_s),
        (sx + size_s, sy),
        (sx, sy + size_s),
        (sx - size_s, sy)
    ], fill=col)

# Redimensionamento suave com LANCZOS para 512x512
final_512 = im.resize((512, 512), Image.Resampling.LANCZOS)
final_512.save(os.path.join(OUTPUT_DIR, "icon.png"), "PNG")
print("icon.png (512x512) gerado com sucesso!")

# Gera o arquivo ICO com múltiplos tamanhos para Windows (NSIS, Executável, Barra de Tarefas)
ico_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
final_512.save(
    os.path.join(OUTPUT_DIR, "icon.ico"),
    format="ICO",
    sizes=ico_sizes
)
print("icon.ico (multi-size ICO) gerado com sucesso!")
