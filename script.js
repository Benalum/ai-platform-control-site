const API_STORAGE_KEY = "ai-image-console-api-base";
const DEFAULT_ENDPOINTS = {
  health: "/health",
  wake: "/wake",
  queue: "/jobs/comfyui"
};

const form = document.querySelector("#imageJobForm");
const statusList = document.querySelector("#statusList");
const template = document.querySelector("#statusItemTemplate");
const latestResponse = document.querySelector("#latestResponse");
const apiBaseInput = document.querySelector("#apiBase");
const modePill = document.querySelector("#modePill");

const savedApiBase = localStorage.getItem(API_STORAGE_KEY) || "";
apiBaseInput.value = savedApiBase;
setModeLabel();

document.querySelector("#saveApiBase").addEventListener("click", () => {
  localStorage.setItem(API_STORAGE_KEY, apiBaseInput.value.trim());
  setModeLabel();
  writeResponse({
    saved_api_base: getApiBase() || null,
    mode: getApiBase() ? "live API mode" : "mock mode"
  });
});

document.querySelector("#clearApiBase").addEventListener("click", () => {
  apiBaseInput.value = "";
  localStorage.removeItem(API_STORAGE_KEY);
  setModeLabel();
  resetStatus("Mock mode enabled", "No live API URL is set. Submissions will simulate the wake and queue flow.");
});

document.querySelector("#manualServerCheck").addEventListener("click", async () => {
  resetStatus("Manual server check started", "Checking the configured backend health endpoint.");
  try {
    const health = await checkServer();
    addStatus("ok", "Server online", `Health check response: ${health.status || "ok"}`);
    writeResponse(health);
  } catch (error) {
    addStatus("error", "Server check failed", error.message);
    writeResponse({ error: error.message });
  }
});

document.querySelector("#fillExample").addEventListener("click", () => {
  document.querySelector("#prompt").value =
    "A realistic dirt trail surrounded by lush green grass, colorful wildflowers, and tall trees. Sunlight passes gently through distinct lime green leaves with yellow hues. Clear blue sky with no clouds. Warm afternoon lighting, high detail, natural colors.";
  document.querySelector("#negativePrompt").value =
    "clouds, blurry, low quality, distorted, text, watermark, duplicate objects, oversaturated, cartoon";
  document.querySelector("#style").value = "realistic";
  document.querySelector("#jobType").value = "txt2img";
  document.querySelector("#width").value = 1024;
  document.querySelector("#height").value = 1024;
  document.querySelector("#steps").value = 32;
  document.querySelector("#cfg").value = 7;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = buildPayload();

  resetStatus("Prompt received", "The page collected the user prompt and generation settings.");
  writeResponse({ request_preview: payload });

  try {
    addStatus("working", "Checking server", "Calling the backend health endpoint before queueing the job.");
    let health = await checkServer();

    if (!health.online) {
      addStatus("working", "Server appears offline", "Requesting server wake-up through the backend.");
      await wakeServer();

      addStatus("working", "Waiting for server", "Polling health until the server reports online.");
      health = await waitForServer();
    }

    addStatus("ok", "Server online", "The backend is ready to accept queue jobs.");

    addStatus("working", "Submitting to queue", "Sending the image request to the ComfyUI queue endpoint.");
    const queued = await submitJob(payload);

    addStatus("ok", "Job queued", queued.job_id ? `Job ID: ${queued.job_id}` : "The backend accepted the job.");
    writeResponse(queued);
  } catch (error) {
    addStatus("error", "Workflow failed", error.message);
    writeResponse({
      error: error.message,
      note: "If you are in mock mode, this should not happen. If using a real API, verify CORS, endpoint paths, and backend availability."
    });
  }
});

function buildPayload() {
  const formData = new FormData(form);

  return {
    program: "comfyui",
    job_type: formData.get("jobType"),
    user_label: formData.get("userLabel") || null,
    prompt: formData.get("prompt"),
    negative_prompt: formData.get("negativePrompt") || "",
    style: formData.get("style"),
    settings: {
      width: Number(formData.get("width")),
      height: Number(formData.get("height")),
      steps: Number(formData.get("steps")),
      cfg: Number(formData.get("cfg")),
      seed: Number(formData.get("seed"))
    },
    requested_at: new Date().toISOString()
  };
}

async function checkServer() {
  const apiBase = getApiBase();

  if (!apiBase) {
    await sleep(600);
    return {
      online: Math.random() > 0.35,
      status: "mock-health",
      mode: "mock",
      checked_at: new Date().toISOString()
    };
  }

  const response = await fetch(apiBase + DEFAULT_ENDPOINTS.health, {
    method: "GET",
    headers: { "Accept": "application/json" }
  });

  if (!response.ok) {
    return {
      online: false,
      status: `health-http-${response.status}`,
      checked_at: new Date().toISOString()
    };
  }

  const data = await safeJson(response);
  return {
    online: data.online ?? true,
    status: data.status || "ok",
    ...data
  };
}

async function wakeServer() {
  const apiBase = getApiBase();

  if (!apiBase) {
    await sleep(900);
    return {
      wake_requested: true,
      mode: "mock",
      message: "Mock wake request accepted."
    };
  }

  const response = await fetch(apiBase + DEFAULT_ENDPOINTS.wake, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      target: "image-worker",
      reason: "comfyui-job-request",
      requested_at: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`Wake request failed with HTTP ${response.status}`);
  }

  return safeJson(response);
}

async function waitForServer() {
  const apiBase = getApiBase();

  if (!apiBase) {
    await sleep(1200);
    return {
      online: true,
      status: "mock-online-after-wake",
      mode: "mock"
    };
  }

  const maxAttempts = 12;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await sleep(5000);
    const health = await checkServer();

    if (health.online) {
      return health;
    }

    addStatus("working", `Wake polling attempt ${attempt}/${maxAttempts}`, "Server is not online yet.");
  }

  throw new Error("Server did not report online after wake request.");
}

async function submitJob(payload) {
  const apiBase = getApiBase();

  if (!apiBase) {
    await sleep(900);
    return {
      accepted: true,
      mode: "mock",
      job_id: `mock-${Date.now()}`,
      queue_status: "queued",
      queue_position: Math.floor(Math.random() * 4) + 1,
      message: "Mock job queued. Add your backend API URL to submit real ComfyUI jobs.",
      submitted_payload: payload
    };
  }

  const response = await fetch(apiBase + DEFAULT_ENDPOINTS.queue, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Queue submit failed with HTTP ${response.status}`);
  }

  return safeJson(response);
}

function getApiBase() {
  return (apiBaseInput.value || localStorage.getItem(API_STORAGE_KEY) || "").trim().replace(/\/$/, "");
}

function setModeLabel() {
  const apiBase = getApiBase();
  if (apiBase) {
    modePill.textContent = "Live API mode";
    modePill.style.color = "var(--accent)";
  } else {
    modePill.textContent = "Mock mode";
    modePill.style.color = "var(--warn)";
  }
}

function resetStatus(title, detail) {
  statusList.innerHTML = "";
  addStatus("working", title, detail);
}

function addStatus(state, title, detail) {
  const node = template.content.firstElementChild.cloneNode(true);
  node.dataset.state = state;
  node.querySelector("strong").textContent = title;
  node.querySelector("small").textContent = detail;
  statusList.appendChild(node);
}

function writeResponse(data) {
  latestResponse.textContent = JSON.stringify(data, null, 2);
}

async function safeJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
