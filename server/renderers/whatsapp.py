from PIL import Image, ImageDraw, ImageFont
import textwrap
import os
import json


def load_icon(path, size):
    icon = Image.open(path).convert("RGBA")
    return icon.resize(size, Image.Resampling.LANCZOS)


def make_circle(image, size):
    image = image.resize(size).convert("RGBA")
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size[0], size[1]), fill=255)

    final = Image.new("RGBA", size)
    final.paste(image, (0, 0), mask)
    return final


def render_whatsapp(chat, participants, messages):
    chat_id = chat[0]
    title = chat[2]
    subtitle = chat[3]

    width = 1080
    height = 2000
    padding = 20

    BASE = "server/utils/assets/whatsapp"
    FONT = "server/static/fonts/Roboto-Regular.ttf"
    OUTPUT_DIR = "server/output"
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    wallpaper = Image.open(f"{BASE}/wallpaper.png").resize((width, height))
    img = Image.new("RGB", (width, height))
    img.paste(wallpaper, (0, 0))

    draw = ImageDraw.Draw(img)

    name_font = ImageFont.truetype(FONT, 48)
    status_font = ImageFont.truetype(FONT, 32)
    msg_font = ImageFont.truetype(FONT, 42)
    time_font = ImageFont.truetype(FONT, 24)

    wa_green = (7, 94, 84)
    header_h = 200
    draw.rectangle((0, 0, width, header_h), fill=wa_green)

    back = load_icon(f"{BASE}/icons/back.png", (110, 110))
    img.paste(back, (5, 50), back)

    dp_path = None
    for p in participants:
        if p[2] != "me" and p[4]:
            dp_path = p[4]
            break

    if dp_path and os.path.exists(dp_path):
        dp = Image.open(dp_path).convert("RGB").resize((130, 130))
        mask = Image.new("L", (130, 130), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, 130, 130), fill=255)
        img.paste(dp, (100, 35), mask)

    draw.text((260, 55), title, fill="white", font=name_font)
    draw.text((260, 125), subtitle, fill=(220, 240, 220), font=status_font)

    video = load_icon(f"{BASE}/icons/video.png", (120, 120))
    call = load_icon(f"{BASE}/icons/call.png", (110, 110))
    menu = load_icon(f"{BASE}/icons/menu.png", (115, 115))

    img.paste(video, (width - 330, 45), video)
    img.paste(call, (width - 210, 45), call)
    img.paste(menu, (width - 110, 45), menu)

    y = header_h + 20
    max_w = int(width * 0.80)

    bubble_in = (255, 255, 255)
    bubble_out = (220, 248, 198)

    for m in messages:
        _, chat_id, sender_id, mtype, content, time, direction, _, meta = m

        if mtype != "text":
            continue

        wrapped = textwrap.fill(content, width=26)
        bbox = draw.textbbox((0, 0), wrapped, font=msg_font)

        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]

        # Measure actual timestamp width
        time_bbox = draw.textbbox((0, 0), time, font=time_font)
        time_w = time_bbox[2] - time_bbox[0]
        time_h = time_bbox[3] - time_bbox[1]

        line_count = wrapped.count("\n") + 1
        h_pad = 24  # top & bottom padding inside bubble
        text_left = 30
        time_gap = 20  # gap between text and timestamp when inline

        if line_count == 1:
            # Short message: timestamp sits inline, right of text
            bubble_w = min(text_left + text_w + time_gap + time_w + 30, max_w)
            bubble_h = text_h + h_pad * 2
        else:
            # Multi-line: timestamp goes below the text
            bubble_w = min(max(text_w + 60, time_w + 60), max_w)
            bubble_h = text_h + time_h + h_pad * 2 + 10

        if direction == "outbound":
            x = width - bubble_w - padding
            color = bubble_out
        else:
            x = padding
            color = bubble_in

        draw.rounded_rectangle(
            (x, y, x + bubble_w, y + bubble_h),
            radius=25,
            fill=color
        )
        if line_count == 1:
            # Center text vertically in the bubble
            text_y = y + (bubble_h - text_h) // 2
        else:
            # Center text in the area above the timestamp
            text_area_h = bubble_h - time_h - 10
            text_y = y + (text_area_h - text_h) // 2

        draw.text((x + text_left, text_y), wrapped, font=msg_font, fill="black")

        if line_count == 1:
            # Inline: timestamp vertically centered, to the right of text
            draw.text(
                (x + bubble_w - time_w - 18, y + bubble_h - time_h - 10),
                time,
                font=time_font,
                fill=(80, 80, 80)
            )
        else:
            # Below: timestamp bottom-right
            draw.text(
                (x + bubble_w - time_w - 18, y + bubble_h - time_h - 12),
                time,
                font=time_font,
                fill=(80, 80, 80)
            )

        y += bubble_h + 15

    bar_top = height - 150
    bar_bottom = height - 20

    draw.rounded_rectangle(
        (20, bar_top + 10, width - 170, bar_bottom - 10),
        radius=45,
        fill="white"
    )

    emoji = load_icon(f"{BASE}/icons/emoji.png", (70, 70))
    attach = load_icon(f"{BASE}/icons/attach.png", (80, 80))
    camera = load_icon(f"{BASE}/icons/camera.png", (90, 90))
    mic = load_icon(f"{BASE}/icons/mic.png", (100, 100))

    img.paste(emoji, (40, bar_top + 30), emoji)
    img.paste(attach, (110, bar_top + 30), attach)
    img.paste(camera, (width - 280, bar_top + 20), camera)

    mic_circle = make_circle(mic, (90, 90))
    img.paste(mic_circle, (width - 140, bar_top + 15), mic_circle)

    out_path = f"{OUTPUT_DIR}/chat_{chat_id}.png"
    img.save(out_path)
    return out_path