const MODULE_ID = "moonfang-chat";
const PATRON_IDS = ["P1", "P2", "P3", "P4", "P5", "P6"];

/** Slot accounts only */
function isPatron(user) {
  return PATRON_IDS.includes(user?.name);
}

/** Player name will be stored in Foundry's pronouns field (can't think of a better way for now) */
function getAlias(user) {
  return (user?.pronouns ?? "").trim();
}

/** Read snapshotted alias */
function getSnapshottedAlias(message) {
  return (
    message.getFlag(MODULE_ID, "alias")
  );
}

/** Apply title/subtitle rules to the chat message header */
function applyHeader(html, alias, patronId) {
  const title =
    html.querySelector(".message-sender .name-stacked .title") ||
    html.querySelector(".message-sender .title");

  const subtitle =
    html.querySelector(".message-sender .name-stacked .subtitle");

  // Case 1: No actor/token speaker => Foundry shows the user name (P1..P6) as title.
  // Replace it with the snapshotted alias.
  if (title && title.textContent?.trim() === patronId) {
    title.textContent = alias;
  }

  // Case 2: Actor speaker exists => Foundry often shows user name (P1..P6) in subtitle.
  // Replace subtitle if it is exactly the patron slot name.
  if (subtitle && subtitle.textContent?.trim() === patronId) {
    subtitle.textContent = alias;
  }

  // Additionally: if a subtitle exists but is empty, fill it with alias (keeps UI consistent).
  if (subtitle && !subtitle.textContent?.trim()) {
    subtitle.textContent = alias;
  }
}

/**
 * Create-time: write to the message document (snapshot alias + force actor speaker)
 * IMPORTANT: Only GM or the author client is allowed to update the message,
 * otherwise other patrons will get "lacks permission to update ChatMessage".
 */
Hooks.on("createChatMessage", (message) => {
  const author = message.author;
  if (!isPatron(author)) return;

  const isAuthorClient = author?.id === game.user.id;
  if (!game.user.isGM && !isAuthorClient) return;

  const updates = {};

  // (A) Snapshot alias once per message (historical log stability)
  const alias = getAlias(author);
  if (alias && !message.getFlag(MODULE_ID, "alias")) {
    foundry.utils.setProperty(updates, `flags.${MODULE_ID}.alias`, alias);
  }

  // (B) Force Character Name to be the speaker (even if no token is on the map)
  // Only do this if the message currently has no actor speaker.
  const activeActorId = author?.character?.id ?? author?.character;
  const hasActorSpeaker = !!message.speaker?.actor;

  if (!hasActorSpeaker && activeActorId) {
    // token: null avoids referencing a token that doesn't exist on the current scene
    updates.speaker = { ...(message.speaker ?? {}), actor: activeActorId, token: null };
  }

  if (Object.keys(updates).length) {
    message.update(updates).catch(() => {});
  }
});

/**
 * Render-time: adjust DOM display for everyone (no permissions needed)
 * Includes one delayed re-apply to beat late system renders (dnd5e/core).
 */
Hooks.on("renderChatMessageHTML", (message, html) => {
  const patronId = message.author?.name;
  if (!PATRON_IDS.includes(patronId)) return;

  const alias = getSnapshottedAlias(message);
  if (!alias) return;

  applyHeader(html, alias, patronId);
  setTimeout(() => applyHeader(html, alias, patronId), 0);
});
