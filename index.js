const express = require('express')
const line = require('@line/bot-sdk')
require('dotenv').config()


const app = express()

const config = {
  channelAccessToken : process.env.channelAccessToken,
  channelSecret: process.env.channelSecret
}
 
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvents))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error('Error handling events:', err);
      res.status(500).end();
    });
});

const client = new line.Client(config);

function handleEvents(event){
  console.log('Received event:', event);

  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  if ((event.message.text).toLowerCase() === 'btc') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'BUY IT'
    });
  }
  if (event.message.text === 'nasdaq') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'BUY IT'
    });
  }
  if (event.message.text === 'set') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'BUY IT'
    });
  }
  if (event.message.text === 'nvda') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'BUY IT'
    });
  }
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: "We currently have only \nNVDA\nSET\nNASDAQ\nBTC"
  });
}
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
