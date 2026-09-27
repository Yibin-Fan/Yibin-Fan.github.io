import { createShell, displayPath } from "./shell.mjs";

const shell = createShell();
const page = document.querySelector(".page");
const output = document.querySelector("#terminal-output");
const form = document.querySelector("#terminal-form");
const input = document.querySelector("#command-input");
const promptPath = document.querySelector("#prompt-path");
const completionList = document.querySelector("#completion-list");
let historyIndex = 0;
let draft = "";

function scrollToBottom() {
  input.scrollIntoView({ block: "nearest" });
}

function hideCompletions() {
  completionList.replaceChildren();
  completionList.hidden = true;
}

function showCompletions(matches) {
  completionList.replaceChildren(...matches.map((match) => textNode("span", "completion-item", match)));
  completionList.hidden = false;
  completionList.scrollIntoView({ block: "nearest" });
}

function textNode(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

function appendLinkedText(container, value) {
  const pattern = /(https?:\/\/[^\s]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/g;
  let lastIndex = 0;
  for (const match of value.matchAll(pattern)) {
    container.append(document.createTextNode(value.slice(lastIndex, match.index)));
    const anchor = document.createElement("a");
    const email = !match[0].startsWith("http");
    anchor.href = email ? `mailto:${match[0]}` : match[0];
    anchor.textContent = match[0];
    if (!email) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    }
    container.append(anchor);
    lastIndex = match.index + match[0].length;
  }
  container.append(document.createTextNode(value.slice(lastIndex)));
}

function renderEcho(command, path) {
  const row = document.createElement("div");
  row.className = "echo-row";
  row.append(textNode("span", "echo-prompt", `yibin:${displayPath(path)}$ `));
  row.append(textNode("span", "echo-command", command));
  output.append(row);
}

function renderList(result) {
  const list = document.createElement("div");
  list.className = "directory-list";
  for (const item of result.items) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `directory-item ${item.type === "directory" ? "is-directory" : item.type === "pdf" ? "is-pdf" : "is-file"}`;
    const displayName = `${item.name}${item.type === "directory" ? "/" : ""}`;
    const path = `/${[...(result.path ?? shell.cwd), item.name].join("/")}`;
    button.dataset.path = path;
    button.dataset.kind = item.type;
    button.setAttribute("aria-label", `${item.type === "directory" ? "Open directory" : item.type === "pdf" ? "Open PDF" : "Read file"} ${displayName}`);
    button.append(textNode("span", "file-name", displayName));
    list.append(button);
  }
  output.append(list);
}

function renderResult(result) {
  if (result.type === "empty") return;
  if (result.type === "clear") {
    output.replaceChildren();
    return;
  }
  if (result.type === "list") {
    renderList(result);
    return;
  }
  if (result.type === "help") {
    const wrapper = document.createElement("div");
    wrapper.className = "help-output";
    wrapper.append(textNode("div", "output-heading", "AVAILABLE COMMANDS"));
    for (const [command, description] of result.commands) {
      const row = document.createElement("div");
      row.className = "help-row";
      row.append(textNode("span", "help-command", command));
      row.append(textNode("span", "help-description", description));
      wrapper.append(row);
    }
    wrapper.append(textNode("div", "help-tip", "Tip: click anywhere to type, or click a listed file or directory. Press Ctrl+L to clear the terminal."));
    output.append(wrapper);
    return;
  }
  if (result.type === "open") {
    const line = document.createElement("div");
    line.className = "terminal-message";
    line.append("Opening ");
    const link = document.createElement("a");
    link.href = result.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = result.label;
    line.append(link, ".");
    output.append(line);
    window.open(result.href, "_blank", "noopener,noreferrer");
    return;
  }
  const block = document.createElement("div");
  block.className = result.type === "error" ? "terminal-message is-error" : "terminal-message";
  appendLinkedText(block, result.text);
  output.append(block);
}

function run(command, initial = false) {
  hideCompletions();
  if (!command.trim()) return;
  const path = shell.cwd;
  renderEcho(command, path);
  const result = shell.execute(command);
  renderResult(result);
  promptPath.textContent = displayPath(shell.cwd);
  historyIndex = shell.history.length;
  draft = "";
  input.value = "";
  if (!initial) scrollToBottom();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  run(input.value);
});

input.addEventListener("input", hideCompletions);

input.addEventListener("keydown", (event) => {
  if (event.ctrlKey && !event.metaKey && !event.altKey && event.key.toLowerCase() === "l") {
    event.preventDefault();
    run("clear");
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    hideCompletions();
    if (historyIndex === shell.history.length) draft = input.value;
    historyIndex = Math.max(0, historyIndex - 1);
    input.value = shell.history[historyIndex] ?? "";
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    hideCompletions();
    historyIndex = Math.min(shell.history.length, historyIndex + 1);
    input.value = historyIndex === shell.history.length ? draft : shell.history[historyIndex];
  } else if (event.key === "Tab") {
    event.preventDefault();
    const matches = shell.completions(input.value);
    if (matches.length === 1) {
      hideCompletions();
      const original = input.value;
      const separated = /\s/.test(original);
      const prefix = separated ? original.slice(0, original.lastIndexOf(" ") + 1) : "";
      input.value = `${prefix}${matches[0]}`;
    } else if (matches.length > 1) {
      showCompletions(matches);
    } else {
      hideCompletions();
    }
  }
});

output.addEventListener("click", (event) => {
  const item = event.target.closest("button[data-path]");
  if (!item) return;
  if (item.dataset.kind === "directory") {
    run(`cd ${item.dataset.path}`);
    run("ls");
  } else {
    run(`${item.dataset.kind === "pdf" ? "open" : "cat"} ${item.dataset.path}`);
  }
  input.focus();
});

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  if (event.target.closest("a, button, input, textarea, select, [contenteditable]")) return;
  if (event.target === page && event.clientX >= page.getBoundingClientRect().right - 16) return;
  if (window.getSelection()?.toString()) return;
  input.focus({ preventScroll: true });
  scrollToBottom();
});

document.querySelector("#year").textContent = new Date().getFullYear();
run("ls", true);
