/** Draws one reflection onto a soft card and downloads it. Made on this device; nothing is uploaded. */
export async function saveReflectionImage(text: string, dateLabel: string) {
  const serif =
    getComputedStyle(document.documentElement).getPropertyValue("--font-fraunces").trim() || "Georgia, serif";
  try {
    await document.fonts.load(`48px ${serif}`);
  } catch {
    // Fall back to the default serif if the font isn't ready.
  }
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#2f6fd0");
  sky.addColorStop(0.5, "#4a3fc4");
  sky.addColorStop(1, "#26207c");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#f4f6ff";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 60px ${serif}`;
  const maxWidth = width - 200;
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);

  const lineHeight = 84;
  let y = (height - lines.length * lineHeight) / 2 + 40;
  for (const l of lines) {
    ctx.fillText(l, width / 2, y);
    y += lineHeight;
  }

  ctx.font = `400 34px ${serif}`;
  ctx.globalAlpha = 0.8;
  ctx.fillText(dateLabel, width / 2, height - 190);
  ctx.font = `600 44px ${serif}`;
  ctx.fillText("Still", width / 2, height - 120);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "still-reflection.png";
  link.click();
  URL.revokeObjectURL(url);
}
