const MODULE_ID = "moonfang-chat";
const PATRON_IDS = ["P1", "P2", "P3", "P4", "P5", "P6"];
const FLAG_KEY = "alias";

function isPatron(user) {
  return PATRON_IDS.includes(user?.name);
}

/** Player name will be stored in Foundry's pronouns field (can't think of a better way for now) */
function getAlias(user) {
  return (user?.pronouns ?? "").trim();
}

/** Read snapshotted alias */
function getSnapshottedAlias(message) {
  return message.getFlag(MODULE_ID, FLAG_KEY);
}

function getMessageAuthor(message) {
  return message.author ?? game.users?.get(message.user) ?? null;
}

function getHtmlElement(html) {
  if (html instanceof HTMLElement) return html;
  if (html?.[0] instanceof HTMLElement) return html[0];
  if (typeof html?.get === "function") return html.get(0) ?? null;
  return null;
}

/** Apply title/subtitle rules to the chat message header */
function applyHeader(html, alias, patronId) {
  const title =
    html.querySelector(".message-sender .name-stacked .title") ??
    html.querySelector(".message-sender .title");

  const subtitle = html.querySelector(".message-sender .name-stacked .subtitle");

  // If Foundry shows the patron slot name (P1..P6) in title/subtitle, replace with alias
  if (title?.textContent?.trim() === patronId) title.textContent = alias;
  if (subtitle?.textContent?.trim() === patronId) subtitle.textContent = alias;

  // Keep layout consistent if subtitle exists but is empty
  if (subtitle && !subtitle.textContent?.trim()) subtitle.textContent = alias;
}

function renderPatronAlias(message, html) {
  const root = getHtmlElement(html);
  if (!root) return;

  const author = getMessageAuthor(message);
  const patronId = author?.name;
  if (!PATRON_IDS.includes(patronId)) return;

  const alias = getSnapshottedAlias(message) || getAlias(author);
  if (!alias) return;

  applyHeader(root, alias, patronId);
  setTimeout(() => applyHeader(root, alias, patronId), 0);
}

/**
 * On chat mesasge creation - write to the message document (snapshot alias + force actor speaker)
 * Author-only to avoid "lacks permission to update ChatMessage" error for the other players.
 */
Hooks.on("createChatMessage", (message) => {
  const author = getMessageAuthor(message);
  if (!isPatron(author)) return;
  if (author?.id !== game.user.id) return;

  const updates = {};

  // (A) Snapshot alias once per message (log stability)
  const alias = getAlias(author);
  if (alias && !getSnapshottedAlias(message)) {
    foundry.utils.setProperty(updates, `flags.${MODULE_ID}.${FLAG_KEY}`, alias);
  }

  // (B) Force Character speaker when none exists (works even without tokens on map)
  const activeActorId = author?.character?.id ?? author?.character;
  const hasActorSpeaker = !!message.speaker?.actor;

  if (!hasActorSpeaker && activeActorId) {
    updates.speaker = { ...(message.speaker ?? {}), actor: activeActorId, token: null };
  }

  if (Object.keys(updates).length) message.update(updates).catch(() => {});
});

/**
 * v13 uses renderChatMessage with jQuery HTML.
 * v14 uses renderChatMessageHTML with HTMLElement HTML.
 */
Hooks.on("renderChatMessage", renderPatronAlias);
Hooks.on("renderChatMessageHTML", renderPatronAlias);
