/**
 * Cloudflare Email Worker: hands every message sent to the domain to the Temp Mail API over HTTPS.
 * Use it when the backend runs somewhere without inbound port 25 (Render, Fly, ...).
 *
 * Secrets / vars (see wrangler.toml):
 *   INBOUND_URL     https://<your-api-host>/api/inbound/email
 *   INBOUND_SECRET  same value as the backend's INBOUND_SECRET  (wrangler secret put INBOUND_SECRET)
 */
export default {
  async email(message, env) {
    const raw = await new Response(message.raw).arrayBuffer();

    let res;
    try {
      res = await fetch(env.INBOUND_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.INBOUND_SECRET}`,
          'Content-Type': 'message/rfc822',
          'X-Envelope-To': message.to,
        },
        body: raw,
      });
    } catch (error) {
      // Throwing makes Cloudflare return a temporary failure, so the sender retries later.
      throw new Error(`Temp Mail API unreachable: ${error}`);
    }

    if (res.ok) return;
    // Permanent problems (unknown or reserved recipient, too large): bounce the message.
    if (res.status === 413 || res.status === 422) {
      message.setReject(res.status === 413 ? 'Message too large' : 'No such user here');
      return;
    }
    // Anything else (5xx, auth misconfiguration): temporary failure so nothing is lost.
    throw new Error(`Temp Mail API returned ${res.status}`);
  },
};
