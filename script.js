// ========================================
// ELEMENTS
// ========================================

const $ = id => document.getElementById(id);

const bootScreen      = $("bootScreen");
const bootOutput      = $("bootOutput");
const startButton     = $("startButton");
const processScreen   = $("processScreen");
const processOutput   = $("processOutput");
const progressBar     = $("progressBar");
const giftContainer   = $("giftContainer");
const gift            = $("gift");
const birthdaySection = $("birthdaySection");
const nameInput       = $("nameInput");
const ageInput        = $("ageInput");
const ageButton       = $("ageButton");
const warningBox      = $("warningBox");
const redAlert        = $("redAlert");
const alertBox        = $("alertBox");
const alertLog        = $("alertLog");
const alertButton     = $("alertButton");
const congratsOverlay = $("congratsOverlay");
const congratsMessage = $("congratsMessage");
const closeCongrats   = $("closeCongrats");
const confetti        = $("confetti");

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));


// ========================================
// HELPER: ADD A TERMINAL LINE
// ========================================

function addLine(container, text) {
    const line = document.createElement("div");
    line.classList.add("boot-line");
    line.textContent = text;
    container.appendChild(line);
    return line;
}


// ========================================
// TERMINAL BOOT SEQUENCE
// ========================================

const bootMessages = [
    "> Initializing Birthday_OS...",
    "> Loading celebration modules...",
    "> Checking cake database...",
    "> Searching for presents...",
    "> Connecting to party server...",
    "> Installing happiness.exe...",
    "> System status: READY ✓"
];

async function bootSequence() {
    for (const message of bootMessages) {
        addLine(bootOutput, message);
        await wait(500);
    }
    startButton.classList.add("show");
}

bootSequence();

startButton.addEventListener("click", () => {
    bootScreen.classList.add("hidden");
});


// ========================================
// OPEN GIFT
// ========================================

giftContainer.addEventListener("click", () => {

    if (gift.classList.contains("open")) return;

    gift.classList.add("open");

    const clickText = giftContainer.querySelector(".click-text");
    if (clickText) clickText.style.opacity = "0";

    // Wait for the lid animation, then reveal the form
    setTimeout(() => {
        birthdaySection.classList.add("show");
        setTimeout(() => nameInput.focus(), 400);
    }, 700);
});


// ========================================
// INPUT EVENTS
// ========================================

nameInput.addEventListener("keydown", event => {
    if (event.key === "Enter") ageInput.focus();
});

ageInput.addEventListener("keydown", event => {
    if (event.key === "Enter") checkAge();
});

ageButton.addEventListener("click", checkAge);


// ========================================
// SHAKE ANIMATION
// ========================================

function shake(element) {
    element.animate(
        [
            { transform: "translateX(0)" },
            { transform: "translateX(-8px)" },
            { transform: "translateX(8px)" },
            { transform: "translateX(-5px)" },
            { transform: "translateX(5px)" },
            { transform: "translateX(0)" }
        ],
        { duration: 400 }
    );
}


// ========================================
// FAILED ATTEMPTS (1 + 2 = warnings, 3 = scare)
// ========================================

const MAX_ATTEMPTS = 3;

// separate counters: 3 bad names OR 3 bad ages triggers the scare
const failedAttempts = { name: 0, age: 0 };

const warningIcons = ["🟢", "🟡"];

const warningMessages = {
    name: [
        [
            "> WARNING: USER IDENTITY NOT PROVIDED.",
            "> PLEASE ENTER YOUR NAME.",
            "> SECURITY LEVEL: LOW"
        ],
        [
            "> WARNING: SECOND FAILED ATTEMPT.",
            "> IDENTITY VERIFICATION REQUIRED.",
            "> SYSTEM SECURITY COMPROMISED?"
        ]
    ],
    age: [
        [
            "> WARNING: USER AGE NOT PROVIDED.",
            "> PLEASE ENTER YOUR AGE.",
            "> SECURITY LEVEL: LOW"
        ],
        [
            "> WARNING: SECOND FAILED ATTEMPT.",
            "> AGE VERIFICATION REQUIRED.",
            "> SYSTEM SECURITY COMPROMISED?"
        ]
    ]
};

// what the red screen says for each field
const scareConfig = {
    name: {
        boxLines: [
            "WARNING: IDENTITY NOT FOUND!",
            "A HACKER COULD BE WATCHING! 👀",
            "",
            "ENTER YOUR NAME TO CONTINUE."
        ],
        button: "[ ENTER YOUR NAME ]",
        reveal: "> Now enter your name 🎂",
        input: nameInput
    },
    age: {
        boxLines: [
            "WARNING: AGE NOT FOUND!",
            "A HACKER COULD BE WATCHING! 👀",
            "",
            "ENTER YOUR AGE TO CONTINUE."
        ],
        button: "[ ENTER YOUR AGE ]",
        reveal: "> Now enter your age 🎂",
        input: ageInput
    }
};

function showWarning(type, attempt) {
    warningBox.innerHTML = "";
    warningBox.classList.add("show");
    addLine(warningBox, `${warningIcons[attempt - 1]} ATTEMPT ${attempt}`);
    warningMessages[type][attempt - 1].forEach(text => addLine(warningBox, text));
}

function clearWarning() {
    warningBox.classList.remove("show");
    warningBox.innerHTML = "";
}

function failAttempt(type, input, placeholder) {
    failedAttempts[type]++;

    input.style.borderColor = "#ff4444";
    input.placeholder = placeholder;
    shake(input);

    if (failedAttempts[type] >= MAX_ATTEMPTS) {
        triggerRedAlert(type);
    } else {
        showWarning(type, failedAttempts[type]);
        input.focus();
    }
}


// ========================================
// RED ALERT SCARE (attempt 3)
// ========================================

const originalTitle = document.title;
let titleFlash = null;
let currentScare = "name";

// builds the ╔═══╗ box so every row is the same width
function buildAlertBox(lines) {
    const WIDTH = 34;
    const row = text => "║" + text.padEnd(WIDTH) + "║";

    return [
        "╔" + "═".repeat(WIDTH) + "╗",
        row("         ⚠ SYSTEM FAILURE ⚠"),
        row(""),
        ...lines.map(line => row(line ? "  " + line : "")),
        "╚" + "═".repeat(WIDTH) + "╝"
    ].join("\n");
}

function playSiren() {
    try {
        const ctx  = new (window.AudioContext || window.webkitAudioContext)();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        gain.gain.value = 0.08;          // keep it low, it's a prank not an ambush
        osc.connect(gain);
        gain.connect(ctx.destination);

        const t = ctx.currentTime;
        for (let i = 0; i < 8; i++) {
            osc.frequency.setValueAtTime(600, t + i * 0.5);
            osc.frequency.linearRampToValueAtTime(1000, t + i * 0.5 + 0.25);
            osc.frequency.linearRampToValueAtTime(600, t + i * 0.5 + 0.5);
        }
        osc.start(t);
        osc.stop(t + 4);
    } catch (e) {
        // audio not available, the visuals still work
    }
}

function startTitleFlash() {
    let on = false;
    titleFlash = setInterval(() => {
        document.title = on ? originalTitle : "⚠ HACKED ⚠";
        on = !on;
    }, 500);
}

function stopTitleFlash() {
    clearInterval(titleFlash);
    titleFlash = null;
    document.title = originalTitle;
}

async function triggerRedAlert(type) {

    currentScare = type;
    const config = scareConfig[type];

    // stop typing in the inputs behind the overlay
    if (document.activeElement) document.activeElement.blur();

    clearWarning();
    alertBox.textContent = buildAlertBox(config.boxLines);
    alertButton.textContent = config.button;
    alertLog.innerHTML = "";
    alertButton.style.display = "none";

    redAlert.classList.add("show", "scary");
    playSiren();
    startTitleFlash();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);

    // totally fake, just random numbers
    const fakeIP = Array.from({ length: 4 }, () => Math.floor(Math.random() * 255)).join(".");

    const lines = [
        "> INTRUSION DETECTED...",
        `> TRACING IP... ${fakeIP}`,
        "> ACCESSING CAMERA... 📷",
        "> ACCESSING FILES... 📁",
        "> HACKER HAS ENTERED THE SYSTEM 👀"
    ];

    for (const text of lines) {
        addLine(alertLog, text);
        await wait(900);
    }

    // sudden blackout
    redAlert.classList.add("blackout");
    await wait(1500);
    redAlert.classList.remove("blackout", "scary");
    stopTitleFlash();

    // reveal
    alertLog.innerHTML = "";
    addLine(alertLog, "😂 JUST KIDDING!!");
    addLine(alertLog, "> No hackers. Just a birthday prank.");
    addLine(alertLog, config.reveal);
    alertButton.style.display = "block";
    alertButton.focus();
}

function dismissRedAlert() {
    const config = scareConfig[currentScare];

    redAlert.classList.remove("show", "scary", "blackout");
    stopTitleFlash();
    failedAttempts[currentScare] = 0;     // fresh start for that field
    config.input.style.borderColor = "#00ff88";
    setTimeout(() => config.input.focus(), 350);
}

alertButton.addEventListener("click", dismissRedAlert);


// ========================================
// CHECK NAME + AGE
// ========================================

function checkAge() {

    // ignore clicks while processing or while the scare is on screen
    if (processing || redAlert.classList.contains("show")) return;

    const name = nameInput.value.trim();
    const age  = Number(ageInput.value);

    // Invalid name
    if (!name) {
        failAttempt("name", nameInput, "Enter your name!");
        return;
    }
    nameInput.style.borderColor = "#00ff88";
    failedAttempts.name = 0;
    clearWarning();

    // Invalid age
    if (!age || age < 1 || age > 120) {
        failAttempt("age", ageInput, "Enter a valid age!");
        return;
    }
    ageInput.style.borderColor = "#00ff88";
    failedAttempts.age = 0;

    runProcessing(name, age);
}


// ========================================
// PROCESSING SEQUENCE (15 SECOND DELAY)
// ========================================

const COUNTDOWN_SECONDS = 15;

let processing = false;

async function runProcessing(name, age) {

    processing = true;

    const upperName = name.toUpperCase();

    // Reset and show the processing screen
    processOutput.innerHTML = "";
    progressBar.style.width = "0%";
    processScreen.classList.remove("hidden");

    // --- Intro lines ---
    const intro = [
        "> INITIALIZING SYSTEM...",
        "> VERIFYING USER IDENTITY...",
        `> NAME: ${upperName}`,
        `> AGE: ${age}`,
        "> ACCESS GRANTED ✓"
    ];

    for (const text of intro) {
        addLine(processOutput, text);
        await wait(500);
    }

    addLine(processOutput, "PROCESSING...");
    await wait(400);

    addLine(processOutput, "Please wait while the system completes initialization.");
    await wait(400);

    // --- 15 second countdown with progress bar ---
    const counter = addLine(processOutput, "");

    for (let s = COUNTDOWN_SECONDS; s > 0; s--) {
        counter.textContent = `${s} second${s === 1 ? "" : "s"} remaining... `;
        progressBar.style.width =
            ((COUNTDOWN_SECONDS - s) / COUNTDOWN_SECONDS) * 100 + "%";
        await wait(1000);
    }

    counter.textContent = "0 seconds remaining... ✓";
    progressBar.style.width = "100%";

    // --- Final lines ---
    addLine(processOutput, "> FINAL SEQUENCE COMPLETE.");
    await wait(700);

    addLine(processOutput, "> GENERATING BIRTHDAY MESSAGE...");
    await wait(1000);

    addLine(processOutput, `🎂 CONGRATULATIONS, ${upperName}!`);
    await wait(1400);

    // --- Hide processing screen, then show the popup ---
    processScreen.classList.add("hidden");
    await wait(800);

    congratsMessage.textContent =
        `CONGRATS ${upperName}! YOU'RE OFFICIALLY ${age}! 🎉`;

    congratsOverlay.classList.add("show");
    createConfetti();

    processing = false;
}


// ========================================
// CLOSE CONGRATS
// ========================================

function closePopup() {
    congratsOverlay.classList.remove("show");
    setTimeout(() => { confetti.innerHTML = ""; }, 400);
}

closeCongrats.addEventListener("click", closePopup);

// Click outside the box
congratsOverlay.addEventListener("click", event => {
    if (event.target === congratsOverlay) closePopup();
});

// ESC key
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && congratsOverlay.classList.contains("show")) {
        closePopup();
    }
});


// ========================================
// CONFETTI
// ========================================

function createConfetti() {

    confetti.innerHTML = "";

    const colors = ["#00ff88", "#00ffff", "#ffffff", "#7c4dff", "#39ff14"];

    for (let i = 0; i < 100; i++) {

        const piece = document.createElement("div");
        piece.classList.add("confetti-piece");

        piece.style.left = Math.random() * 100 + "%";
        piece.style.animationDelay = Math.random() * 1.5 + "s";
        piece.style.width = Math.random() * 6 + 5 + "px";
        piece.style.height = Math.random() * 10 + 8 + "px";
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];

        confetti.appendChild(piece);
    }
}