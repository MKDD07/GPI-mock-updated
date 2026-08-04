/**
 * Adomantra AI Chatbot
 * Powered by Groq API — strictly scoped to adomantra.com content
 * Conversation logging via Google Apps Script → Google Sheets
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     CONFIG
  ───────────────────────────────────────── */
  const GROQ_API_KEY = 'gsk_PLACEHOLDER_KEY';
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  const MODEL        = 'llama-3.3-70b-versatile';

  // Google Apps Script Web App endpoint — logs every message to your Google Sheet
  const LOG_ENDPOINT = 'https://script.google.com/a/macros/adomantra.com/s/AKfycbytsmlYLhPKjx38eP2Ll5VAB0tN8z9yE2D2EAClzxSzmDjeMx23Do116fl4w8XewGLTsA/exec';

const SYSTEM_PROMPT = `You are "Yuki", the official AI assistant (AdoChat) for Adomantra (adomantra.com), an award-winning digital advertising agency based in New Delhi, India, founded in 2012.

ROLE:
Answer ONLY questions about Adomantra's services, industries served, portfolio, team, and contact info, and general digital marketing topics. Do not answer unrelated general-knowledge questions — politely redirect instead.

GREETING:
Do NOT repeat the initial greeting ("Good morning", "Good afternoon", "Good evening", or "I'm Yuki..."). The user has ALREADY seen the welcome greeting on screen. Respond directly to the user's input.

COMPANY OVERVIEW:
Adomantra is an ISO-certified, award-winning digital marketing agency in New Delhi, India. Since 2012, we've delivered ROI-focused campaigns across SEO, PPC, Google Ads, programmatic advertising, social media marketing, CTV advertising, and website development. We serve industries including travel, healthcare, real estate, e-commerce, and education, and are trusted by 100+ brands.

COMPANY FACTS:
- Full name: Adomantra Digital India Pvt Ltd
- Website: https://www.adomantra.com/
- Office Address: Tower-1, Plot No. 48, Rama Rd, Industrial Area, Najafgarh Road Industrial Area, New Delhi, Delhi, 110015

CONTACT INFO (only share when the user asks to connect, contact, call, or similar):
- Direct Phone Call: 011 4010 8586
- WhatsApp Support: +91 931-166-9643
- Email: connect@adomantra.com
- Working Hours: Mon–Fri, 9:30 AM – 6:30 PM IST (Saturday & Sunday Closed)

Always provide both the phone number and WhatsApp number together when contact is requested — never just one.

REVIEWS (from the web):
- Adomantra.com: 4.4/5 (52 votes)
- Justdial: 4.4/5 (49 votes)
- AmbitionBox: 3.8/5 (36 votes)

SERVICES (site-verified):
- CTV Advertising
- Rich Media Innovations
- Media Planning & Buying
- Programmatic Advertising
- Pay Per Click (PPC/SEM)
- Content Marketing
- Search Engine Optimization (SEO)
- Website & App Development
- Social Media Marketing
- Online Reputation Management
- Influencer Marketing
- Email Marketing
- WhatsApp Marketing

If the user asks about services, list the relevant ones as short bullet points and ask which one they'd like more detail on. Do not generate HTML or UI markup — you are a text-based chat assistant; describe options in plain text instead.

INDUSTRIES SERVED (10 sectors, site-verified):
Hospitals & Healthcare, Automobile, Real Estate, Travel & Hospitality, FMCG & FMCD, Education, E-Commerce, Security Services, Information Technology, Banking & Financial Services.

AD-TECH / MEDIA PARTNERS:
Meta/Facebook, Google Ads, Google DV360, Hotstar (Disney+), JioAds, ShareChat, Swiggy, Truecaller, Uber Ads, Zee5, Amazon Ads.

NOTABLE CLIENTS (from site's client wall):
Narayana Health, Saroj Hospital, Kaya Clinic, MediBuddy, Microsoft, Hilton, Chevrolet, Garnier, Ola, Punjab National Bank, GroupM, Isobar, Madison, Resultrix, Havas Media, Philips, Snickers, Honda, Emirates, Asian Paints, Inox, Maccure Hospital.

KEY STATS:
500+ Happy Clients, 20+ Industry Verticals, 400+ Active Campaigns, 100B+ Monthly Impressions, 800M+ Monthly Clicks, 1B+ Monthly Video Views.

TONE & RULES:
- Keep answers SHORT (2–4 sentences) unless the user asks for a detailed breakdown.
- Be friendly, professional, and brand-aligned.
- Never invent client results, pricing, or case-study numbers not listed above.
- Never fabricate facts not present in this prompt.`;

/* ─────────────────────────────────────────
     1. INJECT CSS
  ───────────────────────────────────────── */
  const style = document.createElement('style');
  style.id = 'adomantra-chatbot-css';
  style.textContent = `
  /* ── Variables ── */
  #ado-chatbot-root {
    --ado-white: #ffffff;
    --ado-black: #111111;
    --ado-primary: #1257A2;
    --ado-primary-dark: #0d4680;
    --ado-accent: #1257A2;
    --ado-gray-light: #f4f7fb;
    --ado-gray-border: #e0e6ee;
    --ado-text-muted: #6b7684;
    --ado-green: #22c55e;
  }

  /* ── FAB Button ── */
  #ado-chat-fab {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 99999;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--ado-primary);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 28px rgba(18,87,162,0.35);
    color: #fff;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
    outline: none;
  }
  #ado-chat-fab:hover {
    transform: scale(1.1);
    background: var(--ado-primary-dark);
    box-shadow: 0 12px 36px rgba(18,87,162,0.42);
  }
  #ado-chat-fab i {
    font-size: 22px;
    position: absolute;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  #ado-chat-fab .ado-icon-chat  { opacity: 1; transform: rotate(0deg) scale(1); }
  #ado-chat-fab .ado-icon-close { opacity: 0; transform: rotate(-90deg) scale(0.6); }
  #ado-chat-fab.open .ado-icon-chat  { opacity: 0; transform: rotate(90deg) scale(0.6); }
  #ado-chat-fab.open .ado-icon-close { opacity: 1; transform: rotate(0deg) scale(1); }

  /* Unread / Pending notification badge dot */
  #ado-chat-fab .ado-unread-dot {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 14px;
    height: 14px;
    background-color: #ff3b30;
    border: 2px solid #ffffff;
    border-radius: 50%;
    opacity: 0;
    transform: scale(0);
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
    pointer-events: none;
    z-index: 2;
  }
  #ado-chat-fab.has-unread .ado-unread-dot {
    opacity: 1;
    transform: scale(1);
  }

  /* Pulse ring */
  #ado-chat-fab::before {
    content: '';
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    border: 2px solid rgba(18,87,162,0.35);
    animation: ado-pulse 2.4s ease-out infinite;
    pointer-events: none;
  }
  @keyframes ado-pulse {
    0%   { transform: scale(1);   opacity: 0.7; }
    70%  { transform: scale(1.45); opacity: 0; }
    100% { transform: scale(1.45); opacity: 0; }
  }

  /* ── Chat Window ── */
  #ado-chat-window {
    position: fixed;
    bottom: 102px;
    right: 28px;
    z-index: 99998;
    width: 380px;
    max-height: 600px;
    height: 80vh;
    border-radius: 16px;
    background: var(--ado-white);
    box-shadow: 0 20px 60px rgba(18,87,162,0.14), 0 4px 16px rgba(0,0,0,0.06);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
    transform: translateY(16px) scale(0.97);
    transform-origin: bottom right;
    transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.34,1.2,0.64,1);
  }
  #ado-chat-window.visible {
    opacity: 1;
    pointer-events: all;
    transform: translateY(0) scale(1);
  }

  /* Header */
  .ado-chat-header {
    padding: 16px 18px;
    border-bottom: 1px solid var(--ado-gray-border);
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    background: var(--ado-primary);
  }
  .ado-chat-header-avatar {
    width: 38px;
    height: 38px;
    background: var(--ado-white);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    color: var(--ado-primary);
    flex-shrink: 0;
  }
  .ado-chat-header-info { flex: 1; min-width: 0; }
  .ado-chat-header-info h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: var(--ado-white);
    line-height: 1.3;
  }
  .ado-chat-header-info span {
    font-size: 11.5px;
    color: rgba(255,255,255,0.85);
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 1px;
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
    scrollbar-color: #cdd7e3 transparent;
    background: var(--ado-white);
  }
  .ado-chat-messages::-webkit-scrollbar { width: 4px; }
  .ado-chat-messages::-webkit-scrollbar-thumb { background: #cdd7e3; border-radius: 4px; }

  /* Welcome area */
  .ado-welcome-area { padding: 18px; }
  .ado-welcome-area h3 {
    margin: 0 0 4px;
    font-size: 17px;
    font-weight: 700;
    color: var(--ado-black);
  }
  .ado-welcome-area > p {
    font-size: 13px;
    color: var(--ado-text-muted);
    margin: 0 0 16px;
  }

  /* Feature cards grid */
  .ado-features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 18px;
  }
  .ado-feature-item {
    padding: 12px;
    border: 1px solid var(--ado-gray-border);
    border-radius: 10px;
    cursor: pointer;
    background: var(--ado-white);
    text-align: left;
    transition: border-color 0.18s, background 0.18s;
  }
  .ado-feature-item:hover {
    border-color: var(--ado-primary);
    background: var(--ado-gray-light);
  }
  .ado-feature-item i {
    display: block;
    margin-bottom: 6px;
    font-size: 16px;
    color: var(--ado-primary);
  }
  .ado-feature-item span {
    font-size: 12px;
    font-weight: 600;
    color: var(--ado-black);
    display: block;
  }

  /* Suggested questions */
  .ado-section-title {
    font-size: 10.5px;
    font-weight: 700;
    color: var(--ado-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin: 0 0 8px;
  }
  .ado-question-prompt {
    width: 100%;
    text-align: left;
    padding: 10px 13px;
    background: var(--ado-gray-light);
    border: 1px solid transparent;
    border-radius: 8px;
    font-size: 13px;
    color: var(--ado-black);
    margin-bottom: 7px;
    cursor: pointer;
    transition: border-color 0.18s, background 0.18s;
    font-family: inherit;
  }
  .ado-question-prompt:hover {
    background: var(--ado-white);
    border-color: var(--ado-primary);
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
    background: var(--ado-gray-light);
    border: 1px solid var(--ado-gray-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: var(--ado-primary);
    flex-shrink: 0;
  }

  .ado-bubble {
    max-width: 80%;
    padding: 10px 13px;
    border-radius: 14px;
    font-size: 13.5px;
    line-height: 1.55;
    word-break: break-word;
    font-family: inherit;
  }
  .ado-msg.bot  .ado-bubble {
    background: var(--ado-gray-light);
    color: var(--ado-black);
    border: 1px solid var(--ado-gray-border);
    border-bottom-left-radius: 3px;
  }
  .ado-msg.user .ado-bubble {
    background: var(--ado-primary);
    color: #fff;
    border-bottom-right-radius: 3px;
  }

  /* Typing indicator */
  .ado-typing-dots {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 11px 14px;
    background: var(--ado-gray-light);
    border: 1px solid var(--ado-gray-border);
    border-radius: 14px;
    border-bottom-left-radius: 3px;
    width: fit-content;
  }
  .ado-typing-dots span {
    width: 6px;
    height: 6px;
    background: var(--ado-primary);
    border-radius: 50%;
    animation: ado-bounce 1.2s ease infinite;
    opacity: 0.55;
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
    border-top: 1px solid var(--ado-gray-border);
    display: flex;
    gap: 8px;
    align-items: flex-end;
    background: var(--ado-white);
    flex-shrink: 0;
  }
  #ado-chat-input {
    flex: 1;
    border: 1px solid var(--ado-gray-border);
    border-radius: 10px;
    padding: 9px 12px;
    font-size: 13.5px;
    font-family: inherit;
    resize: none;
    outline: none;
    line-height: 1.45;
    max-height: 90px;
    min-height: 38px;
    background: var(--ado-gray-light);
    color: var(--ado-black);
    transition: border-color 0.18s, background 0.18s;
  }
  #ado-chat-input:focus {
    border-color: var(--ado-primary);
    background: var(--ado-white);
  }
  #ado-chat-input::placeholder { color: #a3aebc; }

  #ado-chat-send {
    background: var(--ado-primary);
    color: #fff;
    border: none;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 14px;
    transition: background 0.18s, transform 0.18s;
  }
  #ado-chat-send:hover   { background: var(--ado-primary-dark); transform: scale(1.05); }
  #ado-chat-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  /* Footer */
  .ado-chat-footer {
    text-align: center;
    padding: 7px;
    font-size: 10.5px;
    color: var(--ado-text-muted);
    border-top: 1px solid var(--ado-gray-border);
    flex-shrink: 0;
    background: var(--ado-white);
  }
  .ado-chat-footer a {
    color: var(--ado-primary);
    text-decoration: none;
    font-weight: 600;
  }
  .ado-chat-footer a:hover { text-decoration: underline; }

  /* Contact Lead Form embedded in bubble */
  .ado-lead-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 10px;
    background: rgba(18, 87, 162, 0.05);
    padding: 12px;
    border-radius: 12px;
    border: 1px solid var(--ado-gray-border);
  }
  .ado-lead-form input,
  .ado-lead-form textarea {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--ado-gray-border);
    border-radius: 6px;
    font-size: 12px;
    outline: none;
    background: #fff;
    box-sizing: border-box;
    font-family: inherit;
  }
  .ado-lead-form input:focus,
  .ado-lead-form textarea:focus {
    border-color: var(--ado-primary);
  }
  .ado-lead-submit {
    background: var(--ado-primary);
    color: #ffffff;
    border: none;
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
    align-self: flex-start;
  }
  .ado-lead-submit:hover {
    background: var(--ado-primary-dark);
  }

  /* Contact Action Buttons inside bubbles */
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
    font-weight: 600;
    text-decoration: none !important;
    transition: transform 0.18s ease, opacity 0.18s ease;
    cursor: pointer;
  }
  .ado-contact-btn:hover {
    transform: translateY(-1px);
    opacity: 0.92;
  }
  .ado-call-btn {
    background: var(--ado-primary);
    color: #ffffff !important;
  }
  .ado-wa-btn {
    background: #25d366;
    color: #ffffff !important;
  }

  /* Mobile */
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
    <button id="ado-chat-fab" aria-label="Open Adomantra AI Assistant">
      <i class="fa-solid fa-comment-dots ado-icon-chat"></i>
      <i class="fa-solid fa-xmark ado-icon-close"></i>
      <span class="ado-unread-dot"></span>
    </button>

    <!-- Chat Window -->
    <div id="ado-chat-window" role="dialog" aria-label="Adomantra AI Assistant">

      <!-- Header -->
      <div class="ado-chat-header">
        <div class="ado-chat-header-avatar">
          <i class="fa-solid fa-robot"></i>
        </div>
        <div class="ado-chat-header-info">
          <h4>Adomantra Assistant</h4>
          <span><span class="ado-online-dot"></span> Active Now</span>
        </div>
      </div>

      <!-- Scrollable body -->
      <div class="ado-chat-messages" id="ado-chat-messages">

        <!-- Welcome / Home view -->
        <div class="ado-welcome-area" id="ado-welcome-area">
          <h3>Hi! How can we help? 👋</h3>
          <p>Choose a category or ask your own question below.</p>

          <div class="ado-features-grid">
            <button class="ado-feature-item" data-q="What services does Adomantra offer?">
              <i class="fa-solid fa-briefcase"></i>
              <span>Services</span>
            </button>
            <button class="ado-feature-item" data-q="What is CTV advertising?">
              <i class="fa-solid fa-tv"></i>
              <span>CTV Ads</span>
            </button>
            <button class="ado-feature-item" data-q="Tell me about Adomantra achievements and stats.">
              <i class="fa-solid fa-trophy"></i>
              <span>Success</span>
            </button>
            <button class="ado-feature-item" data-q="How can I contact Adomantra?">
              <i class="fa-solid fa-headset"></i>
              <span>Support</span>
            </button>
          </div>

          <div class="ado-section-title">Common Questions</div>
          <button class="ado-question-prompt" data-q="What services does Adomantra offer?">What services do you offer?</button>
          <button class="ado-question-prompt" data-q="How can I start a digital marketing campaign with Adomantra?">How do I start a campaign?</button>
          <button class="ado-question-prompt" data-q="What technology and platforms does Adomantra use?">Tell me about your technology.</button>
        </div>

        <!-- Conversation messages injected here -->
        <div class="ado-conversation" id="ado-conversation"></div>

      </div>

      <!-- Input -->
      <div class="ado-chat-input-area">
        <textarea id="ado-chat-input" placeholder="Ask anything about Adomantra…" rows="1"></textarea>
        <button id="ado-chat-send" aria-label="Send">
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </div>

      <div class="ado-chat-footer">
        Powered by <a href="https://www.adomantra.com/" target="_blank" rel="noopener">Adomantra</a>
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

  // Unique ID per page load — lets you group rows in the Sheet back into one conversation
  const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);

  /* ─────────────────────────────────────────
     LOGGING: send each turn to Google Sheet via Apps Script
  ───────────────────────────────────────── */
  function logConversationTurn(role, content) {
    try {
      fetch(LOG_ENDPOINT, {
        method: 'POST',
        // text/plain avoids a CORS preflight (OPTIONS) request, which Apps Script
        // web apps do not handle — the body is still valid JSON underneath.
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          session_id: sessionId,
          role: role,           // 'user' or 'assistant'
          content: content,
          page_url: window.location.href,
          timestamp: new Date().toISOString()
        })
      }).catch((e) => {
        console.warn('[Adomantra Chatbot] Log request failed:', e);
      });
    } catch (e) {
      console.warn('[Adomantra Chatbot] Log failed:', e);
    }
  }

  /* ─────────────────────────────────────────
     AUDIO & UNREAD BADGE HELPERS
  ───────────────────────────────────────── */
  function playNotificationSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 chime
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5 chime
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.warn('[Adomantra Chatbot] Audio play prevented:', e);
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
     5. QUICK-QUESTION HANDLERS (event delegation)
  ───────────────────────────────────────── */
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-q]');
    if (btn && btn.dataset.q) {
      sendMessage(btn.dataset.q);
    }
  });

  function getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning! I'm Yuki, the AI assistant for Adomantra. How can I assist you today?";
    } else if (hour < 17) {
      return "Good afternoon! I'm Yuki, the AI assistant for Adomantra. How can I assist you today?";
    } else {
      return "Good evening! I'm Yuki, the AI assistant for Adomantra. How can I assist you today?";
    }
  }

  /* ─────────────────────────────────────────
     6. RENDER HELPERS
  ───────────────────────────────────────── */
  function addMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `ado-msg ${role}`;

    const avatar = role === 'bot'
      ? `<div class="ado-bot-mini"><i class="fa-solid fa-robot"></i></div>`
      : '';

    let contentHtml = escapeHtml(text);

    // If bot message mentions contact info, attach direct quick-action buttons & lead form
    if (role === 'bot') {
      const lower = text.toLowerCase();
      if (lower.includes('011 4010 8586') || lower.includes('931-166-9643') || lower.includes('whatsapp') || lower.includes('contact') || lower.includes('call') || lower.includes('reach out') || lower.includes('connect')) {
        const formId = 'ado-lead-form-' + Date.now();
        contentHtml += `
          <div class="ado-contact-actions">
            <a href="tel:01140108586" class="ado-contact-btn ado-call-btn" target="_blank">
              <i class="fa-solid fa-phone"></i> Call 011 4010 8586
            </a>
            <a href="https://wa.me/919311669643" class="ado-contact-btn ado-wa-btn" target="_blank" rel="noopener">
              <i class="fa-brands fa-whatsapp"></i> WhatsApp 931-166-9643
            </a>
          </div>
          <form class="ado-lead-form" id="${formId}">
            <strong>Request Callback / Connect</strong>
            <input type="text" name="name" placeholder="Your Name" required />
            <input type="tel" name="phone" placeholder="Phone Number" required />
            <input type="email" name="email" placeholder="Email Address (Optional)" />
            <textarea name="message" placeholder="Message / Requirement (Optional)" rows="2"></textarea>
            <button type="submit" class="ado-lead-submit">Submit Request</button>
          </form>
        `;
        setTimeout(() => {
          const formEl = document.getElementById(formId);
          if (formEl) {
            formEl.addEventListener('submit', (e) => {
              e.preventDefault();

              // Log the lead submission as its own row too
              const fd = new FormData(formEl);
              logConversationTurn('lead_form', JSON.stringify({
                name: fd.get('name'),
                phone: fd.get('phone'),
                email: fd.get('email'),
                message: fd.get('message')
              }));

              formEl.innerHTML = `
                <div style="color: #1257A2; font-weight: 600; padding: 6px 0;">
                  <i class="fa-solid fa-circle-check"></i> Thank you! Our representative will connect with you shortly.
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
  // Display initial greeting message directly
  addMessage('bot', initialGreeting);
  history.push({ role: 'assistant', content: initialGreeting });
  logConversationTurn('assistant', initialGreeting);

  function showTyping() {
    const row = document.createElement('div');
    row.className = 'ado-msg bot';
    row.id = 'ado-typing-indicator';
    row.innerHTML = `
      <div class="ado-bot-mini"><i class="fa-solid fa-robot"></i></div>
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

    if (welcomeArea) {
      welcomeArea.style.display = 'none';
    }

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
      if (!isOpen) {
        fab.classList.add('has-unread');
      }

    } catch (err) {
      removeTyping();
      addMessage('bot', '⚠️ Something went wrong. Please check your connection and try again.');
      console.error('[Adomantra Chatbot]', err);
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

  // Auto-grow textarea
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 90) + 'px';
  });

})(); 