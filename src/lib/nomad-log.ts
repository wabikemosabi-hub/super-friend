export type LogFill = {
  date: string;
  navigator: string | null;
  title: string;
  promised: string[];
  found: string[];
};

export type StoryPiece = { kind: 'text'; text: string } | { kind: 'redacted' };

const slot = /\{(date|navigator|title|promised[1-3]|found[1-3])\}/g;

function slotValue(name: string, fill: LogFill) {
  if (name === 'date') return fill.date;
  if (name === 'navigator') return fill.navigator;
  if (name === 'title') return fill.title;
  const list = name.startsWith('promised') ? fill.promised : fill.found;
  return list[Number(name.slice(-1)) - 1] ?? null;
}

export function fillTemplate(story: string, fill: LogFill): StoryPiece[] {
  const pieces: StoryPiece[] = [];
  let text = '';
  let last = 0;

  for (const match of story.matchAll(slot)) {
    text += story.slice(last, match.index);
    last = match.index + match[0].length;
    const value = slotValue(match[1], fill);
    if (value === null) {
      if (text !== '') pieces.push({ kind: 'text', text });
      pieces.push({ kind: 'redacted' });
      text = '';
    } else {
      text += value;
    }
  }

  text += story.slice(last);
  if (text !== '') pieces.push({ kind: 'text', text });
  return pieces;
}

export function logDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
