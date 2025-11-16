const WORKER_URL = "https://sentient.samhere5202.workers.dev";

const ideaInput = document.getElementById("ideaInput");
const generateBtn = document.getElementById("generateBtn");
const shortAnswer = document.getElementById("shortAnswer");
const expandedAnswer = document.getElementById("expandedAnswer");
const expandBtn = document.getElementById("expandBtn");
const responseArea = document.getElementById("responseArea");
const sourcesList = document.getElementById("sourcesList");
const errorArea = document.getElementById("errorArea");
const errorText = document.getElementById("errorText");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const copyBtn = document.getElementById("copyBtn");

function showError(msg) {
  errorText.textContent = msg;
  errorArea.style.display = "block";
  responseArea.style.display = "none";
}

function clearError() {
  errorArea.style.display = "none";
}

generateBtn.addEventListener("click", async () => {
  clearError();
  const question = ideaInput.value.trim();
  if (!question) {
    showError("Please enter a question first.");
    ideaInput.focus();
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Thinking…";

  try {
    const res = await fetch(WORKER_URL + "/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(msg || "Request failed");
    }

    const data = await res.json();

    shortAnswer.textContent = data.short_answer || "";
    expandedAnswer.textContent = data.expanded_answer || "";

    sourcesList.innerHTML = "";
    if (Array.isArray(data.sources)) {
      data.sources.forEach(src => {
        const div = document.createElement("div");
        const link = document.createElement("a");
        link.href = src.link || "#";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = src.title || src.link || "source";
        div.appendChild(link);
        sourcesList.appendChild(div);
      });
    }

    responseArea.style.display = "block";
    expandedAnswer.style.display = "none";
    expandBtn.style.display = data.expanded_answer ? "inline-block" : "none";

    window.scrollTo({
      top: responseArea.offsetTop - 20,
      behavior: "smooth"
    });

  } catch (err) {
    showError("Something went wrong: " + err.message);
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Ask";
  }
});

expandBtn.addEventListener("click", () => {
  if (expandedAnswer.style.display === "none") {
    expandedAnswer.style.display = "block";
    expandBtn.textContent = "Collapse";
  } else {
    expandedAnswer.style.display = "none";
    expandBtn.textContent = "Expand";
  }
});

copyBtn.addEventListener("click", () => {
  const text =
    shortAnswer.textContent +
    "\n\n" +
    (expandedAnswer.style.display === "block" ? expandedAnswer.textContent : "");

  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
  });
});

async function sendFeedback(helpful) {
  try {
    await fetch(WORKER_URL + "/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: ideaInput.value.trim(),
        helpful,
        timestamp: new Date().toISOString()
      })
    });
  } catch {}
}

yesBtn.addEventListener("click", () => sendFeedback(true));
noBtn.addEventListener("click", () => sendFeedback(false));

window.addEventListener("load", () => ideaInput.focus());
