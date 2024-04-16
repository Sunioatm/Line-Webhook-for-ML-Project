const express = require('express')
const line = require('@line/bot-sdk')
const axios = require('axios');

require('dotenv').config()


const app = express()

const jsonFileUrl = 'https://raw.githubusercontent.com/Sunioatm/Predicted-JSON/main/test.json';
// define jsonData
let jsonData = null;
axios.get(jsonFileUrl)
  .then(response => {
    jsonData = response.data;
    // Use the jsonData object here
    console.log(jsonData);
  })
  .catch(error => {
    console.error('Error reading JSON file:', error);
  });


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
  if ((event.message.text).toLowerCase().includes('btc')) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text : `ทำนายราคาวันที่ 1 : ${jsonData.BTC/USD_d[0]}\nทำนายราคาวันที่ 2 : ${jsonData.BTC/USD_d[1]}\nทำนายราคาวันที่ 3 : ${jsonData.BTC/USD_d[2]}`
    });
  }
  if ((event.message.text).toLowerCase().includes('nasdaq')) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text : `ทำนายราคาวันที่ 1 : ${jsonData.NASDAQ/USD_d[0]}\nทำนายราคาวันที่ 2 : ${jsonData.NASDAQ/USD_d[1]}\nทำนายราคาวันที่ 3 : ${jsonData.NASDAQ/USD_d[2]}`
    });
  }
  if ((event.message.text).toLowerCase().includes('set')) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text : `ทำนายราคาวันที่ 1 : ${jsonData.SET/THB_d[0]}\nทำนายราคาวันที่ 2 : ${jsonData.SET/THB_d[1]}\nทำนายราคาวันที่ 3 : ${jsonData.SET/THB_d[2]}`
    });
  }
  if ((event.message.text).toLowerCase().includes('nvda')) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text : `ทำนายราคาวันที่ 1 : ${jsonData.NVDA/USD_d[0]}\nทำนายราคาวันที่ 2 : ${jsonData.NVDA/USD_d[1]}\nทำนายราคาวันที่ 3 : ${jsonData.NVDA/USD_d[2]}`
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
