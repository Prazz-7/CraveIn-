import crypto from 'crypto';

const TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const secret = process.env.AUTH_SECRET || crypto.randomBytes(32).toString('hex');

if (!process.env.AUTH_SECRET) {
  console.warn('AUTH_SECRET is not set. Using a temporary development secret; all users will need to sign in again when the server restarts.');
}

const sign = payload => crypto.createHmac('sha256', secret).update(payload).digest('base64url');

export function makeToken(userId) {
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Date.now() + TOKEN_LIFETIME_MS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function getUserId(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  const [payload, signature, ...rest] = auth.slice(7).split('.');
  if (!payload || !signature || rest.length) return null;
  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number.isInteger(data.sub) && data.sub > 0 && Number.isFinite(data.exp) && data.exp > Date.now() ? data.sub : null;
  } catch {
    return null;
  }
}
