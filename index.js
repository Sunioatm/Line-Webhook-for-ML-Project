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
    // create Date today
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const afterTomorrow = new Date(today);
  afterTomorrow.setDate(afterTomorrow.getDate() + 2);
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };

  const todayFormatted = today.toLocaleDateString('en-GB', options);
  const tomorrowFormatted = tomorrow.toLocaleDateString('en-GB', options);
  const afterTomorrowFormatted = afterTomorrow.toLocaleDateString('en-GB', options);

  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  if ((event.message.text).toLowerCase().includes('btc')) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `ทำนาย BTC\n${todayFormatted} : ${jsonData['BTC/USD_d'][0]}\n${tomorrowFormatted} : ${jsonData['BTC/USD_d'][1]}\n${afterTomorrowFormatted} : ${jsonData['BTC/USD_d'][2]}`
    });
  }
  if ((event.message.text).toLowerCase().includes('set')) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `ทำนาย SET\n${todayFormatted} : ${jsonData['SET/THB_d'][0]}\n${tomorrowFormatted} : ${jsonData['SET/THB_d'][1]}\n${afterTomorrowFormatted} : ${jsonData['SET/THB_d'][2]}`
    });
  }
  if ((event.message.text).toLowerCase().includes('nvda')) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `ทำนาย NVDA\n${todayFormatted} : ${jsonData['NVDA/USD_d'][0]}\n${tomorrowFormatted} : ${jsonData['NVDA/USD_d'][1]}\n${afterTomorrowFormatted} : ${jsonData['NVDA/USD_d'][2]}`
    });
  }
  if ((event.message.text).toLowerCase().includes('nasdaq')) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `ทำนาย NASDAQ\n${todayFormatted} : ${jsonData['NASDAQ_d'][0]}\n${tomorrowFormatted} : ${jsonData['NASDAQ_d'][1]}\n${afterTomorrowFormatted} : ${jsonData['NASDAQ_d'][2]}`
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
