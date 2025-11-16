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

function showError(msg){
  errorText.textContent = msg;
  errorArea.style.display = "block";
  responseArea.style.display = "none";
}

function clearError(){
  errorArea.style.display = "none";
}

generateBtn.addEventListener("click", async () => {
  clearError();
  const q = ideaInput.value.trim();
  if (!q){ showError("Please enter a question"); return; }

  generateBtn.disabled = true;
  generateBtn.textContent = "Thinking...";

  try {
    const res = await fetch(WORKER_URL + "/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q })
    });

    const data = await res.json();

    if (data.error){
      showError(data.error);
      generateBtn.disabled = false;
      generateBtn.textContent = "Ask";
      return;
    }

    shortAnswer.textContent = data.short_answer || "No answer available";
    expandedAnswer.textContent = data.expanded_answer || "";

    responseArea.style.display = "block";
    expandBtn.style.display = data.expanded_answer ? "inline-block" : "none";

  } catch(err){
    showError(err.message);
  }

  generateBtn.disabled = false;
  generateBtn.textContent = "Ask";
});

expandBtn.addEventListener("click", ()=>{
  if (expandedAnswer.style.display === "none"){
    expandedAnswer.style.display = "block";
    expandBtn.textContent = "Collapse";
  } else {
    expandedAnswer.style.display = "none";
    expandBtn.textContent = "Expand";
  }
});

copyBtn.addEventListener("click", ()=>{
  const text = shortAnswer.textContent + "\n\n" + expandedAnswer.textContent;
  navigator.clipboard.writeText(text);
});
