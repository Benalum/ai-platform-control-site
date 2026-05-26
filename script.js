// Later, when your backend is ready, set this to something like:
// const API_ENDPOINT = "https://studio.alexhartel.com/api/v1/images/generate";
const API_ENDPOINT = "";

const form = document.querySelector("#generatorForm");
const promptInput = document.querySelector("#prompt");
const negativePromptInput = document.querySelector("#negativePrompt");
const modeInput = document.querySelector("#mode");
const styleInput = document.querySelector("#style");
const sizeInput = document.querySelector("#size");
const stepsInput = document.querySelector("#steps");
const cfgInput = document.querySelector("#cfg");
const seedInput = document.querySelector("#seed");
const randomSeedBtn = document.querySelector("#randomSeedBtn");

const apiStatus = document.querySelector("#apiStatus");
const queueStatus = document.querySelector("#queueStatus");
const lastSeed = document.querySelector("#lastSeed");
const resultStatus = document.querySelector("#resultStatus");
const resultMode = document.querySelector("#resultMode");
const resultSize = document.querySelector("#resultSize");
const resultSettings = document.querySelector("#resultSettings");
const mockImage = document.querySelector("#mockImage");
const historyList = document.querySelector("#historyList");

apiStatus.textContent = API_ENDPOINT ? "Connected" : "Mock";

function randomSeed() {
  return Math.floor(Math.random() * 999999999);
}

function getRequestPayload() {
  const seed = seedInput.value ? Number(seedInput.value) : randomSeed();
  seedInput.value = seed;

  return {
    prompt: promptInput.value.trim(),
    negative_prompt: negativePromptInput.value.trim(),
    mode: modeInput.value,
    style: styleInput.value,
    size: sizeInput.value,
    steps: Number(stepsInput.value),
    cfg: Number(cfgInput.value),
    seed
  };
}

function validatePayload(payload) {
  if (!payload.prompt) {
    promptInput.focus();
    resultStatus.textContent = "Prompt required";
    return false;
  }
  return true;
}

function addHistoryItem(payload, status = "mock-complete") {
  const empty = historyList.querySelector(".empty");
  if (empty) empty.remove();

  const item = document.createElement("article");
  item.className = "history-item";
  item.innerHTML = `
    <div class="history-thumb" aria-hidden="true"></div>
    <div>
      <strong>${payload.mode} · ${payload.style}</strong>
      <p>${payload.prompt}</p>
    </div>
    <code>${status}<br>seed ${payload.seed}</code>
  `;

  historyList.prepend(item);
}

async function runMockGeneration(payload) {
  queueStatus.textContent = "Queued";
  resultStatus.textContent = "Queued";
  mockImage.classList.add("generating");

  await new Promise(resolve => setTimeout(resolve, 450));

  queueStatus.textContent = "Generating";
  resultStatus.textContent = "Generating";

  await new Promise(resolve => setTimeout(resolve, 850));

  queueStatus.textContent = "Complete";
  resultStatus.textContent = "Mock complete";
  mockImage.classList.remove("generating");

  resultMode.textContent = payload.mode;
  resultSize.textContent = payload.size;
  resultSettings.textContent = `${payload.steps} / ${payload.cfg}`;
  lastSeed.textContent = payload.seed;

  addHistoryItem(payload);
}

async function runApiGeneration(payload) {
  queueStatus.textContent = "Sending";
  resultStatus.textContent = "Sending to API";
  mockImage.classList.add("generating");

  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  const data = await response.json();

  queueStatus.textContent = "Submitted";
  resultStatus.textContent = data.status || "Submitted";
  resultMode.textContent = payload.mode;
  resultSize.textContent = payload.size;
  resultSettings.textContent = `${payload.steps} / ${payload.cfg}`;
  lastSeed.textContent = payload.seed;

  addHistoryItem(payload, data.job_id ? `job ${data.job_id}` : "api-submitted");
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  const payload = getRequestPayload();
  if (!validatePayload(payload)) return;

  try {
    if (API_ENDPOINT) {
      await runApiGeneration(payload);
    } else {
      await runMockGeneration(payload);
    }
  } catch (error) {
    console.error(error);
    queueStatus.textContent = "Error";
    resultStatus.textContent = "Error";
    mockImage.classList.remove("generating");
    alert(error.message);
  }
});

randomSeedBtn.addEventListener("click", () => {
  seedInput.value = randomSeed();
  lastSeed.textContent = seedInput.value;
});

document.querySelectorAll(".test-card").forEach(card => {
  card.addEventListener("click", () => {
    promptInput.value = card.dataset.prompt;
    negativePromptInput.value = card.dataset.negative;
    window.location.hash = "#generator";
    promptInput.focus();
  });
});
