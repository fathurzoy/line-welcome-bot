const crypto = require('crypto');
const axios = require('axios');

const CHANNEL_SECRET = process.env.CHANNEL_SECRET;
const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

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