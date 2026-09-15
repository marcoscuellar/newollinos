/* POST /api/contact — the only thing standing behind the signup pill on the
   landing page. The page still transmits nothing on its own; this is the single
   hop, and it exists so the confirmation can honestly say "Received" instead of
   handing the visitor a mailto: and hoping they remember to hit send.

   Env vars (Vercel → the ŌLLIN OS site project → Settings → Environment Variables):
     RESEND_API_KEY  required — https://resend.com/api-keys
     CONTACT_TO      optional — defaults to marcos@ollinos.com
     CONTACT_FROM    optional — defaults to Resend's shared onboarding sender,
                     which only delivers to the Resend account's own address.
                     Once ollinos.com is verified in Resend, set this to
                     something like "OLLIN <hello@ollinos.com>" to lift that.

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
  const text = [
    email + ' asked to bring an account and see the four checks run live.',
    '',
    'They said they would bring an account they are already working.',
    '',
    'Reply straight to this email — it goes back to them.',
    '',
    'source: ' + source,
  ].join('\n');

  /* don't let a hanging upstream hold the function open to its own timeout */
  const ctl = new AbortController();
  const bail = setTimeout(() => ctl.abort(), 8000);

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,          /* so hitting reply reaches them, not Resend */
        subject: 'Bring an account — ' + email,
        text: text,
      }),
      signal: ctl.signal,
    });

    if (!r.ok) {
      /* log the upstream reason, return a generic one — the response body can
         echo configuration detail we shouldn't hand to the page */
      console.error('contact: resend returned', r.status, await r.text().catch(() => ''));
      return res.status(502).json({ error: 'could not send' });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('contact: send failed —', e && e.message);
    return res.status(502).json({ error: 'could not send' });
  } finally {
    clearTimeout(bail);
  }
};
