let wordlist = require("wordlist-english");

const fs = require("fs");

/**
 * Optional helper tool that scans through the list of words and tries to come up with pairs of words that are separated by a caeser cipher.
 *
 * e.g. send - corn [10,10,4]
 */

var wl = wordlist["english"];
wl = wl.filter((w) => w.length >= 4 && w.length <= 8);

let alphabet = "abcdefghijklmnopqrstuvwxyz";
let foundWords = [];
let cipherPat = [
  [1],
  [2],
  [3],
  [4],
  [5],
  [6],
  [7],
  [8],
  [1, 2],
  [1, 2, 3],
  [2, 1],
  [3, 2, 1],
  [2, 3],
  [2, 3, 4],
  [4, 2],
  [4, 1],
  [5, 1],
  [1, 5],
  [5, 2],
  [2, 5],
  [5, 3],
  [5, 4],
  [3, 5],
  [4, 5],
  [1, 2, 3, 4, 5],
  [2, 3, 4, 5],
  [3, 4, 5],
  [5, 4, 3],
  [5, 4, 3, 2, 1],
  [5, 5, 2, 2],
];
cipherPat = [];
let autoC = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
autoC.forEach((c1) => {
  autoC.forEach((c2) => {
    autoC.forEach((c3) => {
      cipherPat.push([c1, c2, c3]);
    });
  });
});

console.debug("Searching for linked cipher words");
cipherPat.forEach((pat) => {
  console.debug("-----------");
  console.debug(" Pattern: " + pat);
  console.debug("-----------");
  let curCipher = pat;
  let curPercent = 0;

  wl.forEach((word, idx) => {
    if (word.length <= 2) return;
    let curWord = word;
    let cipherWord = curWord
      .split("")
      .map((l, lIdx) => {
        let letterIdx = alphabet.indexOf(l);
        return alphabet[(letterIdx + curCipher[lIdx % curCipher.length]) % alphabet.length];
      })
      .join("");

    if (word.length !== cipherWord.length && word !== cipherWord) return;

    let foundIdx = wl.indexOf(cipherWord);
    if (foundIdx >= 0) {
      foundWords.push(`${curWord} - ${cipherWord} [${curCipher.join(",")}]`);
    }
    let newPercent = idx / wl.length;
    if ((curPercent.length < 0.1 && newPercent >= 0.1) || Math.floor(curPercent * 10) < Math.floor(newPercent * 10)) console.debug(Math.floor(newPercent * 100) + "%");
    curPercent = newPercent;
  });
});
console.debug("-----------");
console.debug("Word list size: " + wl.length);
let content = "";
foundWords.forEach((w) => {
  console.debug(w);
  content += w + "\n";
});
console.debug(foundWords.length);

fs.writeFile("foundWords.txt", content, (err) => {
  if (err) {
    console.error(err);
  }
});
