const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const els = {
  lang: document.getElementById("lang"),
  toggleBtn: document.getElementById("toggleBtn"),
  clearBtn: document.getElementById("clearBtn"),
  copyBtn: document.getElementById("copyBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
  finalText: document.getElementById("finalText"),
  interimText: document.getElementById("interimText"),
  dot: document.getElementById("dot"),
  statusText: document.getElementById("statusText"),
  wc: document.getElementById("wc"),
  cc: document.getElementById("cc"),
};

let recognition = null;
let listening = false;

function updateCounts() {
  const text = els.finalText.value.trim();
  els.wc.textContent = `Words: ${text.split(/\s+/).filter(Boolean).length}`;
  els.cc.textContent = `Chars: ${text.length}`;
}

function initRecognition(lang) {
  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser.");
    return null;
  }
  const rec = new SpeechRecognition();
  rec.lang = lang;
  rec.continuous = true;
  rec.interimResults = true;

  rec.onstart = () => {
    listening = true;
    els.dot.classList.add("live");
    els.statusText.textContent = "Listening…";
    els.toggleBtn.textContent = "Stop Listening";
  };

  rec.onend = () => {
    listening = false;
    els.dot.classList.remove("live");
    els.statusText.textContent = "Idle";
    els.toggleBtn.textContent = "Start Listening";
  };

  rec.onresult = (event) => {
    let interim = "";
    let finalAdd = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const tr = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalAdd += tr + " ";
      } else {
        interim += tr;
      }
    }
    if (finalAdd) {
      els.finalText.value += finalAdd;
      updateCounts();
    }
    els.interimText.textContent = interim;
  };

  return rec;
}

recognition = initRecognition(els.lang.value);

// Events
els.toggleBtn.addEventListener("click", () => {
  if (!recognition) return;
  if (!listening) recognition.start();
  else recognition.stop();
});

els.clearBtn.addEventListener("click", () => {
  els.finalText.value = "";
  els.interimText.textContent = "";
  updateCounts();
});

els.copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(els.finalText.value);
  els.statusText.textContent = "Copied!";
  setTimeout(() => (els.statusText.textContent = listening ? "Listening…" : "Idle"), 1000);
});

els.downloadBtn.addEventListener("click", () => {
  const blob = new Blob([els.finalText.value], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transcript.txt";
  a.click();
  URL.revokeObjectURL(url);
});

els.lang.addEventListener("change", () => {
  if (listening && recognition) recognition.stop();
  recognition = initRecognition(els.lang.value);
});

els.finalText.addEventListener("input", updateCounts);
