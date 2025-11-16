const WORKER_URL = "https://sentient.samhere5202.workers.dev";

const ideaInput = document.getElementById("ideaInput");
const generateBtn = document.getElementById("generateBtn");
const shortAnswer = document.getElementById("shortAnswer");
const expandedAnswer = document.getElementById("expandedAnswer");
const expandBtn = document.getElementById("expandBtn");
const responseArea = document.getElementById("responseArea");
const errorArea = document.getElementById("errorArea");
const errorText = document.getElementById("errorText");
const sourcesList = document.getElementById("sourcesList");
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
  const q = ideaInput.value.trim();

  if (!q) {
    showError("Please enter a question");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Thinking…";

  try {
    const res = await fetch(WORKER_URL + "/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q })
    });

    if (!res.ok) {
      const t = await res.text().catch(() => null);
      throw new Error(t || "Request failed");
    }

    const data = await res.json();

    shortAnswer.textContent = data.short_answer || "No answer available.";
    expandedAnswer.textContent = data.expanded_answer || "";
    expandedAnswer.style.display = "none";

    sourcesList.innerHTML = "";
    if (Array.isArray(data.sources)) {
      data.sources.forEach(s => {
        const link = document.createElement("a");
        link.href = s.link;
        link.target = "_blank";
        link.textContent = s.title;
        sourcesList.appendChild(link);
      });
    }

    expandBtn.style.display = data.expanded_answer ? "inline-block" : "none";
    responseArea.style.display = "block";

  } catch (err) {
    showError(err.message);
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
  const text = shortAnswer.textContent + "\n\n" + expandedAnswer.textContent;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = "Copied";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
  });
});
