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
  const q = ideaInput.value.trim();
  if (!q) { 
    showError("Please enter a question"); 
    return; 
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Thinking...";

  try {
    const res = await fetch(WORKER_URL + "/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q })
    });

    // Check if response is ok
    if (!res.ok) {
      const errorData = await res.json();
      showError(errorData.error || `Server error: ${res.status}`);
      generateBtn.disabled = false;
      generateBtn.textContent = "Ask";
      return;
    }

    const data = await res.json();

    // Check for error in response data
    if (data.error) {
      showError(data.error);
      generateBtn.disabled = false;
      generateBtn.textContent = "Ask";
      return;
    }

    // Display the answer
    shortAnswer.textContent = data.short_answer || "No answer available";
    expandedAnswer.textContent = data.expanded_answer || "";

    responseArea.style.display = "block";
    
    // Hide expand button since worker doesn't return expanded_answer
    expandBtn.style.display = "none"; // Changed from conditional since expanded_answer is always empty
    expandedAnswer.style.display = "none"; // Start collapsed

  } catch (err) {
    showError(`Network error: ${err.message}`);
  } finally {
    // Always re-enable button
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
  const shortText = shortAnswer.textContent;
  const expandedText = expandedAnswer.textContent;
  
  // Only include expanded if it exists
  const text = expandedText ? `${shortText}\n\n${expandedText}` : shortText;
  
  navigator.clipboard.writeText(text).then(() => {
    // Visual feedback
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  }).catch(err => {
    console.error("Failed to copy:", err);
    alert("Failed to copy to clipboard");
  });
});

// Optional: Allow Enter key to submit
ideaInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !generateBtn.disabled) {
    generateBtn.click();
  }
});
