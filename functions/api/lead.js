// POST /api/lead — receives an intake-form submission, validates + sanitizes it
// server-side, and emails the owner via Resend. Runs behind the site's password
// gate (_middleware.js), so it only fires for authenticated previewers for now.
//
// Env vars (set on the Pages project, never in code):
//   RESEND_API_KEY  (secret)  — Resend API key
//   LEAD_TO                   — where leads are emailed (your inbox)
//   LEAD_FROM       (opt.)    — from address; defaults to Resend's shared sender
//
// Security handled here: server-side validation, control-char/length sanitizing,
// header-injection safety (newlines stripped from single-line fields + subject),
// link-defanging in free text, and a honeypot. Turnstile is added when public.

function json(obj, status = 200) {
    return new Response(JSON.stringify(obj), {
        status,
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
    });
}

// drop control chars (keep printable + tab + newline) by char code — no literal control chars in source
const stripCtrl = (s) => {
    let out = "";
    for (const ch of String(s == null ? "" : s)) {
        const x = ch.codePointAt(0);
        if (x >= 32 || x === 9 || x === 10) out += ch;
    }
    return out;
};
const line = (s, max = 200) => stripCtrl(s).replace(/\s+/g, " ").trim().slice(0, max);   // single line
const block = (s, max = 2000) => stripCtrl(s).replace(/\r/g, "").trim().slice(0, max);    // keep newlines
// defang links so a phishing URL isn't one-click in your inbox (http -> hxxp)
const defang = (s) => s
    .replace(/\bhttps?:\/\//gi, (m) => (m[0] === "h" ? "hxxp" : "HXXP") + m.slice(4))
    .replace(/\bwww\./gi, "www[.]");
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

// health/version check (authed GET) — confirms which code is actually live
export function onRequestGet(context) {
    const hasKey = !!(context.env && context.env.RESEND_API_KEY);
    const hasTo = !!(context.env && context.env.LEAD_TO);
    return new Response(JSON.stringify({ ok: true, endpoint: "lead", v: 4, resendKey: hasKey, leadTo: hasTo }), {
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
    });
}

export async function onRequestPost(context) {
  const stage = new URL(context.request.url).searchParams.get("probe");
  try {
    if (stage === "dispatch") return json({ ok: true, stage: "dispatch" });   // POST reached the function
    const { request, env } = context;

    let data;
    try {
        data = await request.json();
    } catch {
        return json({ ok: false, error: "bad request" }, 400);
    }
    if (stage === "body") return json({ ok: true, stage: "body", gotName: !!(data && data.name) });   // body read OK

    // honeypot: a hidden field only a bot would fill — silently accept + drop
    if (line(data.company)) return json({ ok: true });

    const name = defang(line(data.name));
    const contact = defang(line(data.contact));
    if (!name || !contact) return json({ ok: false, error: "name and contact are required" }, 422);

    // ---- Turnstile (bot protection) — enforced only when a secret is configured ----
    if (env.TURNSTILE_SECRET) {
        // NOTE: do NOT run through line() — it caps at 200 chars and truncates the (long) Turnstile token.
        const token = stripCtrl(String(data.turnstileToken || "")).trim().slice(0, 4096);
        if (!token) return json({ ok: false, error: "please complete the anti-spam check and try again." }, 200);
        try {
            const tv = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    secret: env.TURNSTILE_SECRET,
                    response: token,
                    remoteip: request.headers.get("CF-Connecting-IP") || "",
                }),
            });
            const tj = await tv.json();
            if (!tj.success) return json({ ok: false, error: "anti-spam check failed (" + ((tj["error-codes"] || []).join(", ") || "unknown") + ") — please refresh and try again." }, 200);
        } catch {
            return json({ ok: false, error: "anti-spam check unavailable — please try again in a moment." }, 200);
        }
    }

    const services = Array.isArray(data.services) ? data.services.map((s) => defang(line(s))).filter(Boolean).slice(0, 10) : [];
    const situation = Array.isArray(data.situation)
        ? data.situation.map((q) => ({ q: defang(line(q && q.q)), a: defang(line(q && q.a)) })).filter((q) => q.q && q.a).slice(0, 12)
        : [];
    const message = defang(block(data.message));

    if (!env.RESEND_API_KEY || !env.LEAD_TO) {
        return json({ ok: false, error: "email not configured yet" }, 200);
    }

    const subject = `new lead — ${name}${services.length ? " · " + services.join(" + ") : ""}`.slice(0, 180);

    // ---- plain-text body (primary; clients won't auto-linkify the defanged links) ----
    const lines = ["NEW PROJECT INQUIRY", "", "who", "  " + name, "  " + contact];
    if (services.length) {
        lines.push("", "what they want");
        services.forEach((s) => lines.push("  - " + s));
    }
    if (situation.length) {
        lines.push("", "their situation");
        situation.forEach((q) => lines.push("  " + q.q + " -> " + q.a));
    }
    if (message) {
        lines.push("", "message", "  " + message.replace(/\n/g, "\n  "));
    }
    lines.push("", "--", "sent from the ddanghnl intake form" + (data.page ? " · " + defang(line(data.page, 300)) : ""));
    if (isEmail(contact)) lines.push("reply to this email to reach them directly");
    const text = lines.join("\n");

    // ---- light HTML mirror (input escaped, links not clickable) ----
    const row = (label, val) =>
        `<p style="margin:0 0 10px"><strong style="display:block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#a2977f">${label}</strong>${val}</p>`;
    const html = `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:520px;color:#20242a">
    <div style="background:#141310;color:#f7f4ec;padding:16px 20px;border-radius:12px 12px 0 0;font-weight:800;font-size:17px">new project inquiry</div>
    <div style="border:1px solid #eee;border-top:0;border-radius:0 0 12px 12px;padding:20px">
      ${row("who", `<span style="font-weight:800;font-size:17px">${esc(name)}</span><br>${esc(contact)}`)}
      ${services.length ? row("what they want", services.map((s) => "&#10003; " + esc(s)).join("<br>")) : ""}
      ${situation.length ? row("their situation", situation.map((q) => esc(q.q) + " &mdash; <strong>" + esc(q.a) + "</strong>").join("<br>")) : ""}
      ${message ? row("message", `<em>${esc(message).replace(/\n/g, "<br>")}</em>`) : ""}
      <p style="margin:16px 0 0;font-size:12px;color:#9099a3">sent from the ddanghnl intake form${isEmail(contact) ? " &middot; just hit reply to reach them" : ""}</p>
    </div></div>`;

    const payload = {
        from: env.LEAD_FROM || "ddanghnl intake <onboarding@resend.dev>",
        to: [env.LEAD_TO],
        subject,
        text,
        html,
    };
    if (isEmail(contact)) payload.reply_to = contact;

    let res;
    try {
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), 8000);
        res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: ctl.signal,
        });
        clearTimeout(timer);
    } catch (e) {
        return json({ ok: false, error: "mail fetch failed: " + ((e && e.message) || String(e)) }, 200);
    }
    if (!res.ok) {
        let detail = "";
        try { detail = (await res.text()).slice(0, 300); } catch {}
        return json({ ok: false, error: "resend " + res.status + (detail ? ": " + detail : "") }, 200);
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: "server error: " + ((err && err.message) || String(err)) }, 200);
  }
}
