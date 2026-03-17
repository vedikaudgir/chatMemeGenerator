from pathlib import Path

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

    server_dir = Path(__file__).resolve().parents[1]
    BASE = server_dir / "utils" / "assets" / "whatsapp"
    FONT = server_dir / "static" / "fonts" / "Roboto-Regular.ttf"
    OUTPUT_DIR = server_dir / "output"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    wallpaper_path = BASE / "wallpaper.png"
    if not wallpaper_path.exists():
        img = Image.new("RGB", (width, height), (245, 245, 245))
        draw = ImageDraw.Draw(img)
        font = ImageFont.load_default()

        header_h = 160
        draw.rectangle((0, 0, width, header_h), fill=(7, 94, 84))
        draw.text((24, 30), title or "Chat", fill="white", font=font)
        if subtitle:
            draw.text((24, 70), subtitle, fill=(220, 240, 220), font=font)

        y = header_h + 30
        for m in messages[:25]:
            try:
                content = m[4]
            except Exception:
                continue
            if not content:
                continue
            wrapped = textwrap.fill(str(content), width=60)
            draw.text((24, y), wrapped, fill=(20, 20, 20), font=font)
            y += 20 * (wrapped.count("\n") + 2)

        out_path = (OUTPUT_DIR / f"chat_{chat_id}.png").resolve()
        img.save(out_path)
        return str(out_path)

    wallpaper = Image.open(wallpaper_path).resize((width, height))
    img = Image.new("RGB", (width, height))
    img.paste(wallpaper, (0, 0))

    draw = ImageDraw.Draw(img)

    if FONT.exists():
        name_font = ImageFont.truetype(str(FONT), 48)
        status_font = ImageFont.truetype(str(FONT), 32)
        msg_font = ImageFont.truetype(str(FONT), 42)
        time_font = ImageFont.truetype(str(FONT), 24)
    else:
        name_font = ImageFont.load_default()
        status_font = ImageFont.load_default()
        msg_font = ImageFont.load_default()
        time_font = ImageFont.load_default()

    wa_green = (7, 94, 84)
    header_h = 200
    draw.rectangle((0, 0, width, header_h), fill=wa_green)

    back_path = BASE / "icons" / "back.png"
    if back_path.exists():
        back = load_icon(back_path, (110, 110))
        img.paste(back, (5, 50), back)

    dp_path = None
    for p in participants:
        if p[2] != "me" and p[4]:
            dp_path = p[4]
            break

    dp_candidate = None
    if dp_path:
        p = Path(dp_path)
        dp_candidate = p if p.is_absolute() else (server_dir.parent / p).resolve()

    if dp_candidate and dp_candidate.exists():
        dp = Image.open(dp_candidate).convert("RGB").resize((130, 130))
        mask = Image.new("L", (130, 130), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, 130, 130), fill=255)
        img.paste(dp, (100, 35), mask)

    draw.text((260, 55), title, fill="white", font=name_font)
    draw.text((260, 125), subtitle, fill=(220, 240, 220), font=status_font)

    video_path = BASE / "icons" / "video.png"
    call_path = BASE / "icons" / "call.png"
    menu_path = BASE / "icons" / "menu.png"
    if video_path.exists() and call_path.exists() and menu_path.exists():
        video = load_icon(video_path, (120, 120))
        call = load_icon(call_path, (110, 110))
        menu = load_icon(menu_path, (115, 115))

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

    emoji_path = BASE / "icons" / "emoji.png"
    attach_path = BASE / "icons" / "attach.png"
    camera_path = BASE / "icons" / "camera.png"
    mic_path = BASE / "icons" / "mic.png"
    if emoji_path.exists() and attach_path.exists() and camera_path.exists() and mic_path.exists():
        emoji = load_icon(emoji_path, (70, 70))
        attach = load_icon(attach_path, (80, 80))
        camera = load_icon(camera_path, (90, 90))
        mic = load_icon(mic_path, (100, 100))

        img.paste(emoji, (40, bar_top + 30), emoji)
        img.paste(attach, (110, bar_top + 30), attach)
        img.paste(camera, (width - 280, bar_top + 20), camera)

        mic_circle = make_circle(mic, (90, 90))
        img.paste(mic_circle, (width - 140, bar_top + 15), mic_circle)

    out_path = (OUTPUT_DIR / f"chat_{chat_id}.png").resolve()
    img.save(out_path)
    return str(out_path)