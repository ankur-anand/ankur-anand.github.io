import sharp from "sharp";
import { join } from "node:path";

export const SOCIAL_IMAGE_WIDTH = 1200;
export const SOCIAL_IMAGE_HEIGHT = 630;

export interface SocialCard {
  eyebrow?: string;
  title: string;
  footer?: string;
}

const TITLE_WIDTH = 1040;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function characterWidth(character: string): number {
  if (character === " ") return 0.3;
  if (".,:;!|'`ijlrtfI1".includes(character)) return 0.32;
  if ("MW@%&QGmwoO0".includes(character)) return 0.82;
  if (character === character.toUpperCase() && character !== character.toLowerCase()) return 0.66;
  return 0.55;
}

function textWidth(value: string): number {
  return [...value].reduce((width, character) => width + characterWidth(character), 0);
}

function wrapTitle(title: string, fontSize: number): string[] {
  const maxWidth = TITLE_WIDTH / fontSize;
  const words = title.trim().replace(/\s+/g, " ").split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (!line || textWidth(candidate) <= maxWidth) {
      line = candidate;
      continue;
    }

    lines.push(line);
    line = word;
  }

  if (line) lines.push(line);
  return lines;
}

function titleLayout(title: string): { fontSize: number; lines: string[] } {
  for (const fontSize of [86, 78, 70, 62, 56, 50, 46]) {
    const lines = wrapTitle(title, fontSize);
    if (lines.length <= 4) return { fontSize, lines };
  }

  const lines = wrapTitle(title, 44);
  const visible = lines.slice(0, 4);
  visible[3] = `${visible[3].replace(/[.,;:!?]?$/, "")}…`;
  return { fontSize: 44, lines: visible };
}

function fitSingleLine(value: string, maxWidth: number, fontSize: number): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  const maxUnits = maxWidth / fontSize;
  if (textWidth(normalized) <= maxUnits) return normalized;

  let fitted = normalized;
  while (fitted.length > 1 && textWidth(`${fitted}…`) > maxUnits) {
    fitted = fitted.slice(0, -1).trimEnd();
  }
  return `${fitted.replace(/[.,;:·-]?$/, "")}…`;
}

export async function renderSocialCard(card: SocialCard): Promise<ArrayBuffer> {
  const { fontSize, lines } = titleLayout(card.title);
  const lineHeight = Math.round(fontSize * 1.12);
  const blockHeight = lineHeight * lines.length;
  const titleRegionTop = card.eyebrow ? 185 : 140;
  const titleRegionBottom = card.footer ? 485 : 550;
  const titleRegionHeight = titleRegionBottom - titleRegionTop;
  const firstBaseline =
    titleRegionTop +
    Math.round((titleRegionHeight - blockHeight) / 2) +
    Math.round(fontSize * 0.82);
  const titleLines = lines
    .map(
      (line, index) =>
        `<tspan x="80" y="${firstBaseline + index * lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join("");
  const eyebrow = card.eyebrow
    ? `<text x="80" y="158" font-family="Avenir Next, Avenir, Helvetica Neue, Arial, sans-serif" font-size="23" fill="#6a7686">${escapeXml(fitSingleLine(card.eyebrow, 870, 23))}</text>`
    : "";
  const footer = card.footer
    ? `<text x="80" y="565" font-family="Avenir Next, Avenir, Helvetica Neue, Arial, sans-serif" font-size="22" fill="#087a51">${escapeXml(fitSingleLine(card.footer, 1040, 22))}</text>`
    : "";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${SOCIAL_IMAGE_WIDTH}" height="${SOCIAL_IMAGE_HEIGHT}" viewBox="0 0 ${SOCIAL_IMAGE_WIDTH} ${SOCIAL_IMAGE_HEIGHT}">
      <rect width="1200" height="630" fill="#f7f7f4"/>

      <text x="80" y="68" font-family="Avenir Next, Avenir, Helvetica Neue, Arial, sans-serif" font-size="25" font-weight="700" letter-spacing="-0.5" fill="#263746">ankuranand.com</text>
      <rect x="80" y="92" width="48" height="6" rx="3" fill="#d97857"/>

      <g transform="translate(1056 32)">
        <rect width="64" height="64" rx="15" fill="#173f35"/>
        <path d="M16 47 28 16h8l12 31h-8l-2.4-7H26.2L24 47Zm12.5-14h6.8L32 23.2Z" fill="#f3efe4"/>
      </g>

      ${eyebrow}
      <text font-family="Avenir Next, Avenir, Helvetica Neue, Arial, sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="-2" fill="#263746">${titleLines}</text>
      ${footer}
    </svg>
  `;

  const png = await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, palette: true, colours: 64 })
    .toBuffer();

  const image = new ArrayBuffer(png.byteLength);
  new Uint8Array(image).set(png);
  return image;
}

export async function renderSocialImage(sourcePath: string): Promise<ArrayBuffer> {
  const absolutePath = join(process.cwd(), "public", sourcePath.replace(/^\/+/, ""));
  const png = await sharp(absolutePath)
    .resize(SOCIAL_IMAGE_WIDTH, SOCIAL_IMAGE_HEIGHT, {
      fit: "contain",
      background: "#f7f7f4",
    })
    .flatten({ background: "#f7f7f4" })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const image = new ArrayBuffer(png.byteLength);
  new Uint8Array(image).set(png);
  return image;
}
