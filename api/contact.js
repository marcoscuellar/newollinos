/* POST /api/contact — the only thing standing behind the signup pill on the
   landing page. The page still transmits nothing on its own; this is the single
   hop, and it exists so the confirmation can honestly say "Received" instead of
   handing the visitor a mailto: and hoping they remember to hit send.

   Two emails go out per submit:
     1. the notification to CONTACT_TO (reply-to: the visitor) — required; if
        this fails the page shows the direct address instead of "Received"
     2. the auto-reply to the visitor (reply-to: CONTACT_TO) — best effort; a
        failure here is logged and never turns a received submission into an
        error on the page, because the notification already landed

   Env vars (Vercel → the ŌLLIN OS site project → Settings → Environment Variables):
     RESEND_API_KEY  required — https://resend.com/api-keys
     CONTACT_TO      optional — defaults to marcos@ollinos.com
     CONTACT_FROM    optional — defaults to Resend's shared onboarding sender,
                     which only delivers to the Resend account's own address
                     (so the auto-reply cannot reach a visitor until this is
                     set to a verified domain, e.g. "ŌLLIN OS <hello@ollinos.com>").

   With RESEND_API_KEY unset this returns 500, and the page falls back to
   showing the direct address — a visible failure, never a silent drop. */

const TO = process.env.CONTACT_TO || 'marcos@ollinos.com';
const FROM = process.env.CONTACT_FROM || 'OLLIN <onboarding@resend.dev>';

/* deliberately loose — a strict regex rejects real, valid addresses */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'bad request' });
  }

  /* Honeypot. A real visitor never sees this field, so anything in it is a bot.
     Answer 200: a bot that logs a success moves on, where a 400 tells it to come
     back and probe. Nothing is sent either way. */
  if (typeof body.website === 'string' && body.website.trim()) {
    return res.status(200).json({ ok: true });
  }

  const email = String(body.email || '').trim();
  if (email.length > 254 || !EMAIL.test(email)) {
    return res.status(400).json({ error: 'a valid email is required' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('contact: RESEND_API_KEY is not set — dropping', email);
    return res.status(500).json({ error: 'mail is not configured' });
  }

  const source = String(body.source || 'unknown').replace(/[^\w.-]/g, '').slice(0, 40);
  /* optional fields from the contact form; plain text only, trimmed and capped */
  const clean = (v, max) => String(v || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);
  const name = clean(body.name, 120);
  const interest = clean(body.interest, 80);
  const account = clean(body.account, 1000);
  const text = [
    (name ? name + ' (' + email + ')' : email) + ' asked to bring an account and see what ŌLLIN finds.',
    '',
    interest ? 'Interested in: ' + interest : '',
    account ? 'Account they are working: ' + account : 'They did not name an account yet.',
    '',
    'Reply straight to this email — it goes back to them.',
    '',
    'source: ' + source,
  ].filter((line, i, all) => line !== '' || all[i - 1] !== '').join('\n');

  /* What the visitor gets back, straight away. Plain text on purpose: it
     reads as a note from a person, and nothing in it is a claim we can't keep.
     Reply-to is the inbox the notification went to, so their answer and your
     notification land in the same thread on your side. */
  const ack = [
    'Got it.',
    '',
    'Reply to this email with the account you are already working: the company,',
    'and the person if you have one. We run the four checks on it and send back',
    'what holds up and what does not.',
    '',
    'Nothing is sent to anyone. You see the work first.',
    '',
    'Marcos',
    'ŌLLIN OS · ollinos.com',
  ].join('\n');

  /* don't let a hanging upstream hold the function open to its own timeout */
  const ctl = new AbortController();
  const bail = setTimeout(() => ctl.abort(), 8000);
  const send = (payload) => fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: ctl.signal,
  });

  try {
    const r = await send({
      from: FROM,
      to: [TO],
      reply_to: email,          /* so hitting reply reaches them, not Resend */
      subject: 'Bring an account — ' + email,
      text: text,
    });

    if (!r.ok) {
      /* log the upstream reason, return a generic one — the response body can
         echo configuration detail we shouldn't hand to the page */
      console.error('contact: resend returned', r.status, await r.text().catch(() => ''));
      return res.status(502).json({ error: 'could not send' });
    }

    /* The notification landed, so the submission counts as received whatever
       happens next. The auto-reply is best effort: log a failure, never
       surface it. */
    try {
      const a = await send({
        from: FROM,
        to: [email],
        reply_to: TO,
        subject: 'Got it — bring the account',
        text: ack,
      });
      if (!a.ok) console.error('contact: auto-reply returned', a.status, await a.text().catch(() => ''));
    } catch (e) {
      console.error('contact: auto-reply failed —', e && e.message);
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('contact: send failed —', e && e.message);
    return res.status(502).json({ error: 'could not send' });
  } finally {
    clearTimeout(bail);
  }
};
