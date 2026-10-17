# Random Password Generator

A static, responsive password generator with an adjustable length and character-type options. It shows the password, rates its strength and copies it to the clipboard. Built for Task 17 (Random Password Generator) of my Web Development internship.

**Live page:** https://cedrick40.github.io/password-generator/

## About the project
You choose a length with a slider (4 to 64 characters) and tick the character types you want: uppercase letters, lowercase letters, numbers and symbols. The page builds a random password straight away, shows a strength bar and lets you copy the result with one click. A new password is created every time the slider or a checkbox changes, or when you press Generate.

## Objective
To practice checkboxes, string building and randomization logic.

## Tools used
- HTML5
- CSS3
- JavaScript
- VS Code
- Git and GitHub (free)

## My approach
- **Planning:** I wrote down the steps first: read the options, build a pool of characters, pick characters at random, join them into a string, then display and copy it.
- **Building the pool dynamically:** The four character types live in a `CHARACTER_SETS` object. For each ticked checkbox I look up its set and join the sets into one string, the pool. Adding a new type later only needs one new entry and one checkbox.
- **Guaranteeing every type:** I first pick one character from each selected type, then fill the rest of the length from the whole pool. This means a password with "Numbers" ticked always contains a number. The slider starts at 4 so every type always fits.
- **Randomization:** I used `crypto.getRandomValues()` rather than `Math.random()`. It gives secure random numbers, and I reject values from the top of the range so that no character is slightly more likely than another (this is called modulo bias). The characters are then mixed with a Fisher-Yates shuffle so the guaranteed ones do not always come first.
- **Handling an empty selection:** If no checkbox is ticked, `generatePassword()` returns an empty string and the page shows a clear message, clears the strength bar and does not try to build anything. The Copy button also tells the user to generate a password first.
- **Strength meter:** Strength is estimated in bits as the length multiplied by `log2` of the pool size, then labelled Weak, Fair, Strong or Very strong. It is shown as a simple blue bar.
- **Copy to clipboard:** `navigator.clipboard.writeText()` copies the password. It needs a secure context (HTTPS or localhost), so I added a fallback using a hidden textarea and `document.execCommand("copy")`. The button briefly changes to "Copied!" and a status message confirms it.
- **Form handling:** The options sit inside a `<form>`. The `input` event on the slider and the `change` event on the checkboxes give live results, and `preventDefault()` on `submit` stops the page from reloading.
- **Accessibility:** Every control has a label, the checkboxes are grouped in a `fieldset` with a `legend`, the password is an `<output>` with `aria-live="polite"`, and keyboard focus is clearly visible.
- **Layout and responsive design:** Flexbox places the password box and Copy button side by side, and Grid lays out the checkboxes in two columns. A media query for screens of 520px and below stacks everything in one column.
- **Design:** The interface uses blue only, with white and pale blue backgrounds.
- **Testing:** I generated thousands of passwords with random lengths and options to check that each has the right length, only uses the chosen characters and includes every chosen type. I also tested the empty selection, the copy button and the mobile layout.

## Project structure
```
password-generator/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Outcome
The result is a clean, responsive password generator with a length slider, four checkboxes, a password display, a strength meter and a copy button. This project taught me how to build a pool of characters from user choices, why secure randomness matters for passwords, and how to handle the case where the user selects nothing.

## Interview questions
- **How would you build a character pool dynamically?** Keep each character type in an object, loop over the checkboxes, and join the sets of the ticked ones into one string. Picking a random index from that string then gives a character from only the chosen types.
- **Why is Math.random not cryptographically secure?** It is a pseudo-random number generator designed for speed, not security. Its sequence is determined by an internal state, so an attacker who sees enough output may be able to predict later values. For passwords, tokens and keys, use `crypto.getRandomValues()`, which uses the operating system's secure random source. That is what this project uses.
- **How would you handle an empty selection?** Check the number of ticked options before building the pool. If it is zero, stop, show a message such as "Tick at least one character type" and avoid dividing by or indexing into an empty string.

## Credits
Random-number and checkbox behaviour follow the MDN documentation for `Math.random`, `Crypto.getRandomValues()` and checkbox inputs. The font is Manrope from Google Fonts.

## Author
Cedrick Niyibikora