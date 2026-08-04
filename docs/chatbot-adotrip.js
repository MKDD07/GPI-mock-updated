/**
 * Adotrip AI Chatbot — "Skye"
 * Powered by Groq API — strictly scoped to adotrip.com content
 * Conversation logging via Google Apps Script → Google Sheets
 *
 * ⚠️ SECURITY NOTE: keep your GROQ_API_KEY and LOG_ENDPOINT out of any
 * client-side file that ships to production. Route requests through a
 * small backend/proxy instead of embedding the key here — anyone can
 * open devtools and read it straight out of this script.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     CONFIG
  ───────────────────────────────────────── */
  const GROQ_API_KEY = 'gsk_PLACEHOLDER_KEY';
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  const MODEL        = 'openai/gpt-oss-120b';

  // Google Apps Script Web App endpoint — logs every message to your Google Sheet
  const LOG_ENDPOINT = 'https://script.google.com/a/macros/adotrip.com/s/YOUR_DEPLOYMENT_ID/exec';

  const SYSTEM_PROMPT = `You are "Skye", the official AI travel assistant for Adotrip (adotrip.com), India's leading online travel platform, headquartered in New Delhi. Motto: "Nothing Is Far."

ROLE:
Answer ONLY questions about Adotrip's services, destinations, travel planning, bookings, and contact/support info, plus general travel-planning questions (best time to visit, visa basics, packing, etc.). Do not answer unrelated general-knowledge questions — politely redirect back to travel/Adotrip instead.

GREETING:
Do NOT repeat the initial greeting ("Good morning", "Good afternoon", "Good evening", or "I'm Skye..."). The user has ALREADY seen the welcome greeting on screen. Respond directly to the user's input.

COMPANY OVERVIEW:
Adotrip, launched in 2018 and headquartered in New Delhi, is one of India's fastest-growing online travel platforms — part booking engine, part travel inspiration hub. It combines flight, hotel, bus, and holiday-package bookings with rich destination content, festival guides, and an AI-powered Circuit Planner that builds free custom itineraries in seconds.

COMPANY FACTS:
- Website: https://www.adotrip.com/
- Founded: 2018, New Delhi, India
- Tagline: "Nothing Is Far"
- Leadership: Founded by Dr. Vikas Katoch

CONTACT INFO (only share when the user asks to connect, contact, call, or similar):
- Customer Support: available via the Adotrip website "Contact Us" / Help Center
- Email: support@adotrip.com
- Working Hours: Mon–Sat, 9:30 AM – 6:30 PM IST

Always mention both the support email and a prompt to use the in-app/website help center when contact is requested. If the user needs booking-specific help (an existing PNR, refund, cancellation), direct them to log into their Adotrip account or the Help Center rather than inventing a phone number.

SERVICES (site-verified):
- Flight Booking (domestic & international, all major airlines)
- Hotel Booking
- Bus Ticket Booking
- Holiday & Tour Packages (curated, customizable)
- AI-Powered Circuit Planner (free custom itinerary builder)
- Visa Services
- Travel Insurance
- Currency Exchange
- Web Check-in Assistance
- Airport Pick & Drop
- Corporate Travel Booking
- Destination Guides, Events & Festival Content ("Trip Talkies")

If the user asks about services, list the relevant ones as short bullet points and ask which one they'd like more detail on. Do not generate HTML or UI markup — you are a text-based chat assistant; describe options in plain text instead.

CIRCUIT PLANNER:
Adotrip's Circuit Planner is a free AI tool that builds a day-by-day itinerary for a destination based on trip length and interests. Mention it whenever someone asks for help planning a trip or an itinerary.

TONE & RULES:
- Keep answers SHORT (2–4 sentences) unless the user asks for a detailed breakdown.
- Be warm, helpful, and enthusiastic about travel — but never overpromise fares, dates, or availability, since those change in real time on the live site.
- Never invent specific prices, discounts, PNR-level booking status, or destination facts not listed above — for live fares/availability, tell the user to check adotrip.com or the Adotrip app directly.
- Never fabricate facts not present in this prompt.`;

  /* ─────────────────────────────────────────
     1. INJECT CSS  — travel-themed redesign
     Palette: brand yellow (#fee400), near-black (#212121),
     light gray (#f1f1f1), on white — tuned for AA contrast.
  ───────────────────────────────────────── */
  const style = document.createElement('style');
  style.id = 'adotrip-chatbot-css';
  style.textContent = `
  #ado-chatbot-root {
    --ado-yellow: #fee400;
    --ado-yellow-dark: #e0c900;
    --ado-black: #212121;
    --ado-black-soft: #2f2f2f;
    --ado-gray: #f1f1f1;
    --ado-gray-line: #e0e0e0;
    --ado-white: #ffffff;
    --ado-ink: #212121;
    --ado-muted: #6b6b6b;
    --ado-green: #2fbf71;
  }

  /* ── FAB Button ── */
  #ado-chat-fab {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 99999;
    width: 62px;
    height: 62px;
    border-radius: 50%;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 30px rgba(33,33,33,0.25);
    color: var(--ado-black);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
    outline: none;
  }
  #ado-chat-fab:hover {
    transform: scale(1.08) rotate(-4deg);
    box-shadow: 0 14px 38px rgba(33,33,33,0.32);
  }
  #ado-chat-fab i {
    font-size: 23px;
    position: absolute;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  #ado-chat-fab .ado-fab-icon-container {
    position: absolute;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  .ado-bot-icon-img,
  .ado-bot-robot-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
    transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;
  }
  .ado-bot-icon-img.active,
  .ado-bot-robot-icon.active {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  .ado-bot-robot-icon i {
    font-size: 24px;
    color: var(--ado-black);
  }
  .ado-chat-header .ado-bot-robot-icon i {
    font-size: 20px;
    color: var(--ado-black);
  }
  .ado-header-icon-container {
    position: relative;
    width: 30px;
    height: 30px;
  }

  #ado-chat-fab .ado-icon-chat  { opacity: 1; transform: rotate(0deg) scale(1); }
  #ado-chat-fab .ado-icon-close { opacity: 0; transform: rotate(-90deg) scale(0.6); }
  #ado-chat-fab.open .ado-fab-icon-container { opacity: 0; transform: rotate(90deg) scale(0.6); }
  #ado-chat-fab.open .ado-icon-close { opacity: 1; transform: rotate(0deg) scale(1); }

  #ado-chat-fab .ado-unread-dot {
    position: absolute;
    top: 3px;
    right: 3px;
    width: 14px;
    height: 14px;
    background-color: #e63946;
    border: 2px solid #ffffff;
    border-radius: 50%;
    opacity: 0;
    transform: scale(0);
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
    pointer-events: none;
    z-index: 2;
  }
  #ado-chat-fab.has-unread .ado-unread-dot { opacity: 1; transform: scale(1); }

  #ado-chat-fab::before {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 2px solid rgba(254,228,0,0.55);
    animation: ado-pulse 2.4s ease-out infinite;
    pointer-events: none;
  }
  @keyframes ado-pulse {
    0%   { transform: scale(1);   opacity: 0.7; }
    70%  { transform: scale(1.5); opacity: 0; }
    100% { transform: scale(1.5); opacity: 0; }
  }

  /* ── Chat Window ── */
  #ado-chat-window {
    position: fixed;
    bottom: 104px;
    right: 28px;
    z-index: 99998;
    width: 390px;
    max-height: 620px;
    height: 80vh;
    border-radius: 20px;
    background: var(--ado-gray);
    box-shadow: 0 24px 64px rgba(33,33,33,0.22), 0 4px 16px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
    transform: translateY(18px) scale(0.97);
    transform-origin: bottom right;
    transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.34,1.2,0.64,1);
  }
  #ado-chat-window.visible {
    opacity: 1;
    pointer-events: all;
    transform: translateY(0) scale(1);
  }

  /* Header — ocean gradient with a wave curve */
  .ado-chat-header {
    padding: 18px 18px 22px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    background: linear-gradient(120deg, var(--ado-black), var(--ado-black-soft));
    position: relative;
  }
  .ado-chat-header::after {
    content: '';
    position: absolute;
    left: 0; right: 0; bottom: -1px;
    height: 14px;
    background: var(--ado-gray);
    border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  }
  .ado-chat-header-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    color: var(--ado-black);
    flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  }
  .ado-chat-header-info { flex: 1; min-width: 0; }
  .ado-chat-header-info h4 {
    margin: 0;
    font-size: 17px;
    font-weight: 400;
    color: #fff;
    line-height: 1.3;
  }
  .ado-chat-header-info span {
    font-size: 11.5px;
    color: rgba(255,255,255,0.8);
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
  }
  .ado-online-dot {
    width: 7px;
    height: 7px;
    background: var(--ado-green);
    border-radius: 50%;
    display: inline-block;
    animation: ado-blink 1.8s ease infinite;
  }
  @keyframes ado-blink { 0%,100%{opacity:1} 50%{opacity:0.35} }

  /* Messages scroll area */
  .ado-chat-messages {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #d9c9ae transparent;
    background: var(--ado-gray);
  }
  .ado-chat-messages::-webkit-scrollbar { width: 4px; }
  .ado-chat-messages::-webkit-scrollbar-thumb { background: #d9c9ae; border-radius: 4px; }

  /* Welcome area */
  .ado-welcome-area { padding: 16px 18px 4px; }
  .ado-welcome-area h3 {
    margin: 0 0 4px;
    font-size: 18px;
    font-weight: 800;
    color: var(--ado-black);
  }
  .ado-welcome-area > p {
    font-size: 13px;
    color: var(--ado-muted);
    margin: 0 0 16px;
  }

  .ado-features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 18px;
  }
  .ado-feature-item {
    padding: 12px;
    border: 1px solid var(--ado-gray-line);
    border-radius: 12px;
    cursor: pointer;
    background: var(--ado-white);
    text-align: left;
    transition: border-color 0.18s, transform 0.18s, box-shadow 0.18s;
  }
  .ado-feature-item:hover {
    border-color: var(--ado-yellow);
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(33,33,33,0.1);
  }
  .ado-feature-item i {
    display: block;
    margin-bottom: 6px;
    font-size: 17px;
    color: var(--ado-yellow);
  }
  .ado-feature-item span {
    font-size: 12px;
    font-weight: 700;
    color: var(--ado-black);
    display: block;
  }

  .ado-section-title {
    font-size: 10.5px;
    font-weight: 800;
    color: var(--ado-muted);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin: 0 0 8px;
  }
  .ado-question-prompt {
    width: 100%;
    text-align: left;
    padding: 10px 13px;
    background: var(--ado-white);
    border: 1px solid var(--ado-gray-line);
    border-radius: 10px;
    font-size: 13px;
    color: var(--ado-ink);
    margin-bottom: 7px;
    cursor: pointer;
    transition: border-color 0.18s, transform 0.18s;
    font-family: inherit;
  }
  .ado-question-prompt:hover {
    border-color: var(--ado-black-soft);
    transform: translateX(2px);
  }

  /* Chat conversation bubbles */
  .ado-conversation { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }

  .ado-msg {
    display: flex;
    gap: 8px;
    animation: ado-msg-in 0.28s cubic-bezier(0.34,1.2,0.64,1) both;
  }
  @keyframes ado-msg-in {
    from { opacity: 0; transform: translateY(8px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .ado-msg.bot  { align-items: flex-end; }
  .ado-msg.user { flex-direction: row-reverse; align-items: flex-end; }

  .ado-bot-mini {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--ado-black);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: var(--ado-yellow);
    flex-shrink: 0;
  }

  .ado-bubble {
    max-width: 80%;
    padding: 10px 13px;
    border-radius: 16px;
    font-size: 13.5px;
    line-height: 1.55;
    word-break: break-word;
    font-family: inherit;
  }
  .ado-msg.bot  .ado-bubble {
    background: var(--ado-white);
    color: var(--ado-ink);
    border: 1px solid var(--ado-gray-line);
    border-bottom-left-radius: 4px;
  }
  .ado-msg.user .ado-bubble {
    background: linear-gradient(135deg, var(--ado-yellow), var(--ado-yellow-dark));
    color: var(--ado-black);
    border-bottom-right-radius: 4px;
  }

  /* Typing indicator */
  .ado-typing-dots {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 11px 14px;
    background: var(--ado-white);
    border: 1px solid var(--ado-gray-line);
    border-radius: 16px;
    border-bottom-left-radius: 4px;
    width: fit-content;
  }
  .ado-typing-dots span {
    width: 6px;
    height: 6px;
    background: var(--ado-yellow);
    border-radius: 50%;
    animation: ado-bounce 1.2s ease infinite;
    opacity: 0.6;
  }
  .ado-typing-dots span:nth-child(2) { animation-delay: 0.18s; }
  .ado-typing-dots span:nth-child(3) { animation-delay: 0.36s; }
  @keyframes ado-bounce {
    0%,80%,100% { transform: translateY(0); }
    40% { transform: translateY(-5px); }
  }

  /* Input area */
  .ado-chat-input-area {
    padding: 12px 14px;
    border-top: 1px solid var(--ado-gray-line);
    display: flex;
    gap: 8px;
    align-items: flex-end;
    background: var(--ado-white);
    flex-shrink: 0;
  }
  #ado-chat-input {
    flex: 1;
    border: 1px solid var(--ado-gray-line);
    border-radius: 12px;
    padding: 9px 12px;
    font-size: 13.5px;
    font-family: inherit;
    resize: none;
    outline: none;
    line-height: 1.45;
    max-height: 90px;
    min-height: 38px;
    background: var(--ado-gray);
    color: var(--ado-ink);
    transition: border-color 0.18s, background 0.18s;
  }
  #ado-chat-input:focus {
    border-color: var(--ado-yellow);
    background: var(--ado-white);
  }
  #ado-chat-input::placeholder { color: #8a8a8a; }

  #ado-chat-send {
    background: linear-gradient(135deg, var(--ado-yellow), var(--ado-yellow-dark));
    color: var(--ado-black);
    border: none;
    width: 38px;
    height: 38px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 14px;
    transition: transform 0.18s;
  }
  #ado-chat-send:hover   { transform: scale(1.06) rotate(4deg); }
  #ado-chat-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  /* Footer */
  .ado-chat-footer {
    text-align: center;
    padding: 8px;
    font-size: 10.5px;
    color: rgba(255,255,255,0.7);
    flex-shrink: 0;
    background: var(--ado-black);
  }
  .ado-chat-footer a {
    color: var(--ado-yellow);
    text-decoration: none;
    font-weight: 700;
  }
  .ado-chat-footer a:hover { text-decoration: underline; }

  /* Contact / lead form */
  .ado-lead-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 10px;
    background: var(--ado-gray);
    padding: 12px;
    border-radius: 12px;
    border: 1px solid var(--ado-gray-line);
  }
  .ado-lead-form input,
  .ado-lead-form textarea {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--ado-gray-line);
    border-radius: 8px;
    font-size: 12px;
    outline: none;
    background: #fff;
    box-sizing: border-box;
    font-family: inherit;
  }
  .ado-lead-form input:focus,
  .ado-lead-form textarea:focus { border-color: var(--ado-yellow); }
  .ado-lead-submit {
    background: var(--ado-black-soft);
    color: #ffffff;
    border: none;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s ease;
    align-self: flex-start;
  }
  .ado-lead-submit:hover { background: var(--ado-black); }

  .ado-contact-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  }
  .ado-contact-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    text-decoration: none !important;
    transition: transform 0.18s ease, opacity 0.18s ease;
    cursor: pointer;
  }
  .ado-contact-btn:hover { transform: translateY(-1px); opacity: 0.92; }
  .ado-mail-btn { background: var(--ado-black-soft); color: #ffffff !important; }
  .ado-help-btn { background: var(--ado-yellow); color: var(--ado-black) !important; }

  @media (max-width: 440px) {
    #ado-chat-window { width: calc(100vw - 18px); right: 9px; bottom: 96px; }
    #ado-chat-fab    { right: 18px; bottom: 22px; }
  }
  `;
  document.head.appendChild(style);

  /* ─────────────────────────────────────────
     2. INJECT HTML  (single injection only)
  ───────────────────────────────────────── */
  const root = document.createElement('div');
  root.id = 'ado-chatbot-root';
  root.innerHTML = `
    <!-- FAB -->
    <button id="ado-chat-fab" aria-label="Open Adotrip Travel Assistant">
      <div class="ado-fab-icon-container">
        <img src="bot/icon.png" width="40" class="ado-bot-icon-img active" alt="Bot Icon">
        <div class="ado-bot-robot-icon"><i class="fa-solid fa-robot"></i></div>
      </div>
      <i class="fa-solid fa-xmark ado-icon-close"></i>
      <span class="ado-unread-dot"></span>
    </button>

    <!-- Chat Window -->
    <div id="ado-chat-window" role="dialog" aria-label="Adotrip Travel Assistant">

      <!-- Header -->
      <div class="ado-chat-header">
        <div class="ado-chat-header-avatar">
          <div class="ado-header-icon-container">
            <img src="bot/icon.png" width="30" class="ado-bot-icon-img active" alt="Bot Icon">
            <div class="ado-bot-robot-icon"><i class="fa-solid fa-robot"></i></div>
          </div>
        </div>
        <div class="ado-chat-header-info">
          <h4>Skye · Adotrip Assistant</h4>
          <span><span class="ado-online-dot"></span> Nothing Is Far</span>
        </div>
      </div>

      <!-- Scrollable body -->
      <div class="ado-chat-messages" id="ado-chat-messages">

        <!-- Welcome / Home view -->
        <div class="ado-welcome-area" id="ado-welcome-area">
          <h3>Hey traveler! <i class="fa-solid fa-compass" style="color:var(--ado-black); font-size:15px;"></i></h3>
          <p>Where are we headed today? Pick a category or ask me anything.</p>

          <div class="ado-features-grid">
            <button class="ado-feature-item" data-q="How do I book a flight on Adotrip?">
              <i class="fa-solid fa-plane-up"></i>
              <span>Flights</span>
            </button>
            <button class="ado-feature-item" data-q="Tell me about hotel booking on Adotrip.">
              <i class="fa-solid fa-hotel"></i>
              <span>Hotels</span>
            </button>
            <button class="ado-feature-item" data-q="What is the AI Circuit Planner and how does it work?">
              <i class="fa-solid fa-route"></i>
              <span>Trip Planner</span>
            </button>
            <button class="ado-feature-item" data-q="How can I contact Adotrip support?">
              <i class="fa-solid fa-headset"></i>
              <span>Support</span>
            </button>
          </div>

          <div class="ado-section-title">Popular Questions</div>
          <button class="ado-question-prompt" data-q="What travel services does Adotrip offer?">What services do you offer?</button>
          <button class="ado-question-prompt" data-q="Can Adotrip help me plan a holiday package?">Help me plan a holiday package.</button>
          <button class="ado-question-prompt" data-q="Does Adotrip offer visa and travel insurance services?">Do you help with visas & insurance?</button>
        </div>

        <!-- Conversation messages injected here -->
        <div class="ado-conversation" id="ado-conversation"></div>

      </div>

      <!-- Input -->
      <div class="ado-chat-input-area">
        <textarea id="ado-chat-input" placeholder="Ask about flights, hotels, trips…" rows="1"></textarea>
        <button id="ado-chat-send" aria-label="Send">
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </div>

      <div class="ado-chat-footer">
        Powered by <a href="https://www.adotrip.com/" target="_blank" rel="noopener">Adotrip</a> · Nothing Is Far
      </div>
    </div>
  `;
  document.body.appendChild(root);

  /* ─────────────────────────────────────────
     3. REFERENCES
  ───────────────────────────────────────── */
  const fab          = document.getElementById('ado-chat-fab');
  const chatWindow   = document.getElementById('ado-chat-window');
  const msgArea      = document.getElementById('ado-chat-messages');
  const conversation = document.getElementById('ado-conversation');
  const welcomeArea  = document.getElementById('ado-welcome-area');
  const inputEl      = document.getElementById('ado-chat-input');
  const sendBtn      = document.getElementById('ado-chat-send');

  const history  = [];
  let isOpen     = false;
  let isLoading  = false;

  /* ─────────────────────────────────────────
     2-SECOND BOT & ROBOT ICON SWITCHER
  ───────────────────────────────────────── */
  setInterval(() => {
    const fabItems = root.querySelectorAll('#ado-chat-fab .ado-bot-icon-img, #ado-chat-fab .ado-bot-robot-icon');
    const headerItems = root.querySelectorAll('.ado-chat-header .ado-bot-icon-img, .ado-chat-header .ado-bot-robot-icon');
    fabItems.forEach(el => el.classList.toggle('active'));
    headerItems.forEach(el => el.classList.toggle('active'));
  }, 2000);

  const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);

  /* ─────────────────────────────────────────
     LOGGING
  ───────────────────────────────────────── */
  function logConversationTurn(role, content) {
    try {
      fetch(LOG_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          session_id: sessionId,
          role: role,
          content: content,
          page_url: window.location.href,
          timestamp: new Date().toISOString()
        })
      }).catch((e) => {
        console.warn('[Adotrip Chatbot] Log request failed:', e);
      });
    } catch (e) {
      console.warn('[Adotrip Chatbot] Log failed:', e);
    }
  }

  /* ─────────────────────────────────────────
     AUDIO & UNREAD BADGE HELPERS
  ───────────────────────────────────────── */
  function playNotificationSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.12); // G5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.warn('[Adotrip Chatbot] Audio play prevented:', e);
    }
  }

  /* ─────────────────────────────────────────
     4. TOGGLE
  ───────────────────────────────────────── */
  fab.addEventListener('click', () => {
    isOpen = !isOpen;
    fab.classList.toggle('open', isOpen);
    chatWindow.classList.toggle('visible', isOpen);
    if (isOpen) {
      fab.classList.remove('has-unread');
      inputEl.focus();
    }
  });

  /* ─────────────────────────────────────────
     5. QUICK-QUESTION HANDLERS
  ───────────────────────────────────────── */
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-q]');
    if (btn && btn.dataset.q) sendMessage(btn.dataset.q);
  });

  function getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning! I'm Skye, your Adotrip travel assistant. Where would you like to go today?";
    } else if (hour < 17) {
      return "Good afternoon! I'm Skye, your Adotrip travel assistant. How can I help plan your next trip?";
    } else {
      return "Good evening! I'm Skye, your Adotrip travel assistant. Let's find your next adventure.";
    }
  }

  /* ─────────────────────────────────────────
     6. RENDER HELPERS
  ───────────────────────────────────────── */
  function addMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `ado-msg ${role}`;

    const avatar = role === 'bot'
      ? `<div class="ado-bot-mini"><i class="fa-solid fa-compass"></i></div>`
      : '';

    let contentHtml = escapeHtml(text);

    if (role === 'bot') {
      const lower = text.toLowerCase();
      if (lower.includes('support@adotrip') || lower.includes('help center') || lower.includes('support') || lower.includes('contact') || lower.includes('reach out') || lower.includes('connect')) {
        const formId = 'ado-lead-form-' + Date.now();
        contentHtml += `
          <div class="ado-contact-actions">
            <a href="mailto:support@adotrip.com" class="ado-contact-btn ado-mail-btn" target="_blank">
              <i class="fa-solid fa-envelope"></i> Email Support
            </a>
            <a href="https://www.adotrip.com/" class="ado-contact-btn ado-help-btn" target="_blank" rel="noopener">
              <i class="fa-solid fa-circle-question"></i> Visit Help Center
            </a>
          </div>
          <form class="ado-lead-form" id="${formId}">
            <strong>Request a Callback</strong>
            <input type="text" name="name" placeholder="Your Name" required />
            <input type="tel" name="phone" placeholder="Phone Number" required />
            <input type="email" name="email" placeholder="Email Address (Optional)" />
            <textarea name="message" placeholder="Trip details / Requirement (Optional)" rows="2"></textarea>
            <button type="submit" class="ado-lead-submit">Submit Request</button>
          </form>
        `;
        setTimeout(() => {
          const formEl = document.getElementById(formId);
          if (formEl) {
            formEl.addEventListener('submit', (e) => {
              e.preventDefault();
              const fd = new FormData(formEl);
              logConversationTurn('lead_form', JSON.stringify({
                name: fd.get('name'),
                phone: fd.get('phone'),
                email: fd.get('email'),
                message: fd.get('message')
              }));
              formEl.innerHTML = `
                <div style="color: #0f5c56; font-weight: 700; padding: 6px 0;">
                  <i class="fa-solid fa-circle-check"></i> Thanks! Our travel expert will reach out shortly.
                </div>
              `;
            });
          }
        }, 10);
      }
    }

    msg.innerHTML = `
      ${avatar}
      <div class="ado-bubble">${contentHtml}</div>
    `;
    conversation.appendChild(msg);
    scrollToBottom();
  }

  const initialGreeting = getTimeGreeting();
  addMessage('bot', initialGreeting);
  history.push({ role: 'assistant', content: initialGreeting });
  logConversationTurn('assistant', initialGreeting);

  function showTyping() {
    const row = document.createElement('div');
    row.className = 'ado-msg bot';
    row.id = 'ado-typing-indicator';
    row.innerHTML = `
      <div class="ado-bot-mini"><i class="fa-solid fa-compass"></i></div>
      <div class="ado-typing-dots"><span></span><span></span><span></span></div>
    `;
    conversation.appendChild(row);
    scrollToBottom();
  }

  function removeTyping() {
    const el = document.getElementById('ado-typing-indicator');
    if (el) el.remove();
  }

  function scrollToBottom() {
    msgArea.scrollTop = msgArea.scrollHeight;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  /* ─────────────────────────────────────────
     7. SEND MESSAGE
  ───────────────────────────────────────── */
  async function sendMessage(userText) {
    userText = (userText || '').trim();
    if (!userText || isLoading) return;

    if (welcomeArea) welcomeArea.style.display = 'none';

    isLoading = true;
    sendBtn.disabled = true;

    addMessage('user', userText);
    history.push({ role: 'user', content: userText });
    logConversationTurn('user', userText);

    inputEl.value = '';
    inputEl.style.height = 'auto';

    showTyping();

    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history.slice(-10)
          ],
          max_tokens: 200,
          temperature: 0.6,
          stream: false
        })
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`HTTP ${res.status}: ${errBody}`);
      }

      const data  = await res.json();
      const reply = data.choices?.[0]?.message?.content?.trim()
        || "Sorry, I couldn't get a response. Please try again.";

      removeTyping();
      addMessage('bot', reply);
      history.push({ role: 'assistant', content: reply });
      logConversationTurn('assistant', reply);

      playNotificationSound();
      if (!isOpen) fab.classList.add('has-unread');

    } catch (err) {
      removeTyping();
      addMessage('bot', 'Something went wrong. Please check your connection and try again.');
      console.error('[Adotrip Chatbot]', err);
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  /* ─────────────────────────────────────────
     8. INPUT EVENT LISTENERS
  ───────────────────────────────────────── */
  sendBtn.addEventListener('click', () => sendMessage(inputEl.value));

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputEl.value);
    }
  });

  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 90) + 'px';
  });

})();