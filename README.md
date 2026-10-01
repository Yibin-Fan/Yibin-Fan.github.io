# Yibin Fan — personal homepage

A small, static academic website with a terminal-style interface. It uses plain HTML, CSS, and JavaScript, with no build step or external dependencies.

## Preview locally

From this directory, run:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`. A local server is required because the JavaScript files use ES modules.

## Publish with GitHub Pages

Create a repository named `Yibin-Fan.github.io` and put **the contents of this folder only** at the repository root. In repository settings, enable Pages deployment from the `main` branch and `/ (root)` folder. The site will be available at `https://Yibin-Fan.github.io` after GitHub finishes publishing.

Do not publish the parent `Materials` folder: it contains application documents and transcripts that are outside the site.

## Update the site

- Edit `content.mjs` to change the text and simulated directories.
- Edit `styles.css` to adjust layout and colors. Dark mode follows the visitor's system preference.
- Replace `assets/Yibin_Fan_CV.pdf` when the public CV changes.
- Run `node --test` to check terminal navigation and content boundaries.

The accepted paper entry deliberately has no PDF link. The CV PDF is downloadable through `open resume/cv.pdf` or by clicking it in the terminal.
