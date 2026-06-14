const fs = require("fs");

const path = "src/components/StudentStories.tsx";
const text = fs.readFileSync(path, "utf8");
const lines = text.split(/\r?\n/);

const labelIndex = lines.findIndex(line => line.includes("Select Slide Emoji Key"));
if (labelIndex < 0) {
  throw new Error("Could not find Select Slide Emoji Key");
}

let arrayIndex = -1;
for (let i = labelIndex; i < Math.min(labelIndex + 30, lines.length); i++) {
  if (lines[i].includes(".map(emoji")) {
    arrayIndex = i;
    break;
  }
}

if (arrayIndex < 0) {
  throw new Error("Could not find emoji array map line");
}

// ASCII-only source line. These unicode escapes will render as emojis in the app.
lines[arrayIndex] = "                        {['\\u{1F4BB}', '\\u{1FAD6}', '\\u{1F4DA}', '\\u{1F52C}', '\\u{1F393}', '\\u{1F3E5}', '\\u{1F9E0}', '\\u{1F3A8}', '\\u{1F680}', '\\u{1F4AF}'].map(emoji => (";

fs.writeFileSync(path, lines.join("\n") + "\n", "utf8");

console.log("Fixed line " + (arrayIndex + 1));
console.log(lines[arrayIndex]);
