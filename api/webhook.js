const crypto = require('crypto');
const axios = require('axios');

const CHANNEL_SECRET = 'd4cb4e9cf99193d494a24261e57de8f4';
const CHANNEL_ACCESS_TOKEN = 'pPurbLmfHJl13/MXURuM/4/UAxLpXqmjb82fkI5TO8ewDzn1skA4a2yDWra2PG7PfFmckWpDPqahbTqhBtCtjQ+em5cyxYG/rA2JQBoR2F1FL5G4WGJJYXt5pdkfobVa8goTDqFpjPtWvDH3UiJbPAdB04t89/1O/w1cDnyilFU=';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const signature = req.headers['x-line-signature'];
  const body = JSON.stringify(req.body);
  const hash = crypto
    .createHmac('SHA256', CHANNEL_SECRET)
    .update(body)
    .digest('base64');

  if (signature !== hash) return res.status(403).send('Invalid signature');

  res.status(200).send('OK');

  const events = req.body.events || [];

  for (const event of events) {
    if (event.type === 'memberJoined') {
      const groupId = event.source.groupId;

      const welcomeMessage = 
`🎉 ようこそグループへ！

こんにちは！参加（さんか）してくれてありがとう！🌸

━━━━━━━━━━━━━━━
📌 このグループについて
━━━━━━━━━━━━━━━
✅ ニュースや情報（じょうほう）の共有（きょうゆう）
💬 チャットや会話（かいわ）の練習（れんしゅう）
📚 日本語（にほんご）の練習（れんしゅう）
👫 友達（ともだち）づくり
🔥 勉強（べんきょう）のモチベーションを高（たか）め合（あ）う

みんなで楽（たの）しく日本語（にほんご）を勉強（べんきょう）しましょう！😊

どうぞよろしくお願（ねが）いします！🙏✨`;

      try {
        await axios.post(
          'https://api.line.me/v2/bot/message/push',
          {
            to: groupId,
            messages: [{ type: 'text', text: welcomeMessage }]
          },
          {
            headers: {
              'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (err) {
        console.error('Error sending message:', err.response?.data || err.message);
      }
    }
  }
}