const express = require('express')
const line = require('@line/bot-sdk')
const axios = require('axios');

require('dotenv').config()


const app = express()

// GitHub API URL for the repo content
const apiUrl = 'https://api.github.com/repos/Sunioatm/Predicted-JSON/contents/predicted.json';

// Global variable to hold the last update time
let lastUpdateTime = null;

function fetchJsonData() {
  axios.get(apiUrl, {
    headers: { 'Authorization': process.env.github_token }  // Use a GitHub token for authorization
  })
  .then(response => {
    const fileContentUrl = response.data.download_url;
    lastUpdateTime = new Date(response.data.updated_at);  // Store the last update time

    axios.get(fileContentUrl)
      .then(fileResponse => {
        jsonData = fileResponse.data;
        console.log("JSON data updated successfully. Last Update: ", lastUpdateTime.toLocaleString());
      })
      .catch(error => {
        console.error('Error reading JSON file:', error);
      });
  })
  .catch(error => {
    console.error('Error getting file info:', error);
  });
}


// Fetch JSON Data every 10 minutes
setInterval(fetchJsonData, 600000); // 600000 milliseconds = 10 minutes
fetchJsonData(); // Initial fetch

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

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

const client = new line.Client(config);



function handleEvents(event) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const afterTomorrow = new Date(today);
  afterTomorrow.setDate(afterTomorrow.getDate() + 2);
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };

  const todayFormatted = today.toLocaleDateString('en-GB', options);
  const tomorrowFormatted = tomorrow.toLocaleDateString('en-GB', options);
  const afterTomorrowFormatted = afterTomorrow.toLocaleDateString('en-GB', options);
  const lastUpdateFormatted = lastUpdateTime ? lastUpdateTime.toLocaleDateString('en-GB', options) + ' ' + lastUpdateTime.toLocaleTimeString('en-GB') : 'Not Available';

  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const baseResponse = {
    type: 'text',
    text: ""
  };

  if ((event.message.text).toLowerCase().includes('btc')) {
    baseResponse.text = `ทำนาย BTC/USD\n${todayFormatted} : ${jsonData['BTC/USD_d'][0]}\n${tomorrowFormatted} : ${jsonData['BTC/USD_d'][1]}\n${afterTomorrowFormatted} : ${jsonData['BTC/USD_d'][2]}\nLast Updated: ${lastUpdateFormatted}`;
  } else if ((event.message.text).toLowerCase().includes('nvda')) {
    baseResponse.text = `ทำนาย NVDA/USD\n${todayFormatted} : ${jsonData['NVDA/USD_d'][0]}\n${tomorrowFormatted} : ${jsonData['NVDA/USD_d'][1]}\n${afterTomorrowFormatted} : ${jsonData['NVDA/USD_d'][2]}\nLast Updated: ${lastUpdateFormatted}`;
  } else if ((event.message.text).toLowerCase().includes('nasdaq')) {
    baseResponse.text = `ทำนาย NASDAQ/USD\n${todayFormatted} : ${jsonData['NASDAQ/USD_d'][0]}\n${tomorrowFormatted} : ${jsonData['NASDAQ/USD_d'][1]}\n${afterTomorrowFormatted} : ${jsonData['NASDAQ/USD_d'][2]}\nLast Updated: ${lastUpdateFormatted}`;
  } else {
    baseResponse.text = "We currently have only \nNVDA\nNASDAQ\nBTC";
  }

  return client.replyMessage(event.replyToken, baseResponse);
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
