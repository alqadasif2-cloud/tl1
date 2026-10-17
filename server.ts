import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { TelegramMtprotoManager } from './src/server/telegramMtproto';

const app = express();
const port = 3000;

app.use(express.json());

const mtproto = TelegramMtprotoManager.getInstance();

// 1. Get current MTProto Auth & Connection Status
app.get('/api/telegram/mtproto/status', (req, res) => {
  res.json({
    success: true,
    state: mtproto.getAuthState(),
  });
});

// 2. Send login verification code to Personal Phone Number
app.post('/api/telegram/mtproto/send-code', async (req, res) => {
  const { phoneNumber, apiId, apiHash } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ success: false, error: 'Phone number is required' });
  }

  const result = await mtproto.sendCode(phoneNumber, apiId, apiHash);
  res.json(result);
});

// 3. Submit 5-digit verification code
app.post('/api/telegram/mtproto/sign-in', async (req, res) => {
  const { phoneCode } = req.body;
  if (!phoneCode) {
    return res.status(400).json({ success: false, error: 'Verification code is required' });
  }

  const result = await mtproto.signIn(phoneCode);
  res.json(result);
});

// 4. Submit 2FA password
app.post('/api/telegram/mtproto/2fa-password', async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, error: 'Password is required' });
  }

  const result = await mtproto.signIn2FA(password);
  res.json(result);
});

// 5. Fetch real dialogs (Channels, Supergroups, Groups) from personal account
app.get('/api/telegram/mtproto/dialogs', async (req, res) => {
  const result = await mtproto.getDialogs(100);
  res.json(result);
});

// 6. Send real test message to any destination channel
app.post('/api/telegram/mtproto/send-message', async (req, res) => {
  const { chatId, text } = req.body;
  if (!chatId || !text) {
    return res.status(400).json({ success: false, error: 'chatId and text are required' });
  }

  const result = await mtproto.sendMessage(chatId, text);
  res.json(result);
});

// 7. Start / Update live background forwarding engine
app.post('/api/telegram/mtproto/engine/start', (req, res) => {
  const { rules } = req.body;
  mtproto.startForwardingEngine(rules || [], (log) => {
    // Log processed
  });
  res.json({ success: true, message: 'Forwarding engine active' });
});

// 8. Stop background forwarding engine
app.post('/api/telegram/mtproto/engine/stop', (req, res) => {
  mtproto.stopForwardingEngine();
  res.json({ success: true, message: 'Forwarding engine stopped' });
});

// 9. Logout
app.post('/api/telegram/mtproto/logout', async (req, res) => {
  const result = await mtproto.logout();
  res.json(result);
});

// Vite Middleware for SPA development and production serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[TForwarder Server] Running on http://0.0.0.0:${port}`);
  });
}

startServer();
