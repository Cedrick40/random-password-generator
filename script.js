// ===== Password logic =====

const CHARACTER_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?",
};

// Secure random integer from 0 to max - 1.
// Math.random() is predictable, so crypto.getRandomValues() is used instead.
// Values at the top of the range are rejected to avoid "modulo bias" (some characters being slightly more likely).
function randomInt(max) {
  const range = 0x100000000;                 // 2^32 possible values
  const limit = range - (range % max);
  const buffer = new Uint32Array(1);
  let value;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % max;
}

function pickFrom(characters) {
  return characters[randomInt(characters.length)];
}

// Fisher-Yates shuffle so the guaranteed characters do not always sit at the start
function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

// selected: array of set names, e.g. ["uppercase", "numbers"]
function generatePassword(length, selected) {
  if (selected.length === 0) return "";      // empty selection: nothing to build a pool from

  // 1. Build the character pool from the chosen types
  const pool = selected.map((name) => CHARACTER_SETS[name]).join("");

  // 2. Guarantee at least one character from every chosen type
  const chars = selected.map((name) => pickFrom(CHARACTER_SETS[name]));

  // 3. Fill the rest from the whole pool
  while (chars.length < length) {
    chars.push(pickFrom(pool));
  }

  // 4. Shuffle and join into a string
  return shuffle(chars).slice(0, length).join("");
}

// Estimated strength in bits: length x log2(pool size)
function strengthInfo(length, selected) {
  const poolSize = selected.reduce((sum, name) => sum + CHARACTER_SETS[name].length, 0);
  const bits = length * Math.log2(poolSize);
  if (bits < 40) return { label: "Weak", percent: 25, bits };
  if (bits < 60) return { label: "Fair", percent: 50, bits };
  if (bits < 90) return { label: "Strong", percent: 75, bits };
  return { label: "Very strong", percent: 100, bits };
}

// ===== DOM and form handling =====

const form = document.getElementById("options");
const lengthEl = document.getElementById("length");
const lengthValueEl = document.getElementById("length-value");
const passwordEl = document.getElementById("password");
const copyBtn = document.getElementById("copy");
const noteEl = document.getElementById("note");
const barEl = document.getElementById("strength-bar");
const strengthTextEl = document.getElementById("strength-text");
const checkboxes = Object.keys(CHARACTER_SETS).map((name) => document.getElementById(name));

let currentPassword = "";

function setNote(message, isError) {
  noteEl.textContent = message;
  noteEl.classList.toggle("error", Boolean(isError));
}

function getSelected() {
  return checkboxes.filter((box) => box.checked).map((box) => box.id);
}

function generate() {
  const length = Number(lengthEl.value);
  const selected = getSelected();

  if (selected.length === 0) {               // handle the empty selection
    currentPassword = "";
    passwordEl.textContent = "Select at least one type";
    barEl.style.width = "0%";
    strengthTextEl.textContent = "";
    setNote("Tick at least one character type to generate a password.", true);
    return;
  }

  currentPassword = generatePassword(length, selected);
  passwordEl.textContent = currentPassword;

  const info = strengthInfo(length, selected);
  barEl.style.width = info.percent + "%";
  strengthTextEl.textContent = "Strength: " + info.label + " (about " + Math.round(info.bits) + " bits)";
  setNote("", false);
}

// Clipboard API needs a secure context; fall back to execCommand otherwise
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const temp = document.createElement("textarea");
  temp.value = text;
  temp.setAttribute("readonly", "");
  temp.style.position = "fixed";
  temp.style.opacity = "0";
  document.body.appendChild(temp);
  temp.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(temp);
  if (!ok) throw new Error("Copy failed");
}

let copyTimer;
copyBtn.addEventListener("click", async () => {
  if (!currentPassword) {
    setNote("Generate a password first.", true);
    return;
  }
  try {
    await copyText(currentPassword);
    copyBtn.textContent = "Copied!";
    setNote("Password copied to the clipboard.", false);
  } catch (err) {
    setNote("Could not copy. Select the password and copy it manually.", true);
  }
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => { copyBtn.textContent = "Copy"; }, 1500);
});

lengthEl.addEventListener("input", () => {
  lengthValueEl.textContent = lengthEl.value;
  generate();                                // new password as the slider moves
});
checkboxes.forEach((box) => box.addEventListener("change", generate));
form.addEventListener("submit", (e) => {
  e.preventDefault();
  generate();
});

generate();