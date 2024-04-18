require('dotenv').config();
const axios = require('axios');
const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');

const app = express();
const client = new Client({
  channelAccessToken: process.env.channelAccessToken,
  channelSecret: process.env.channelSecret,
});

const apiUrl = 'https://api.github.com/repos/Sunioatm/Predicted-JSON/contents/predicted.json';

let jsonData = null;
let lastUpdateTime = null;

function fetchJsonData() {
  const apiUrl = 'https://api.github.com/repos/Sunioatm/Predicted-JSON/commits?path=predicted.json';

  axios.get(apiUrl, {
    headers: { 'Authorization': `Bearer ${process.env.github_token}` }
  })
  .then(response => {
    if (response.data && response.data.length > 0) {
      const lastCommit = response.data[0];
      const lastCommitDate = new Date(lastCommit.commit.committer.date);
      // Format the date as dd/mm/yy
      lastUpdateTime = `${lastCommitDate.getDate().toString().padStart(2, '0')}/${(lastCommitDate.getMonth() + 1).toString().padStart(2, '0')}/${lastCommitDate.getFullYear().toString().substr(-2)} ${lastCommitDate.getHours().toString().padStart(2, '0')}:${lastCommitDate.getMinutes().toString().padStart(2, '0')}:${lastCommitDate.getSeconds().toString().padStart(2, '0')}`;
      
      console.log("Last commit date:", lastUpdateTime);

      const fileContentUrl = lastCommit.url;
      return axios.get(fileContentUrl, {
        headers: { 'Authorization': `Bearer ${process.env.github_token}` }
      });
    } else {
      console.log("No commits found for the file.");
      return Promise.reject("No commits found for the file.");
    }
  })
  .then(response => {
    if (response.data && response.data.content) {
      jsonData = JSON.parse(Buffer.from(response.data.content, 'base64').toString('utf8'));
      console.log("JSON data updated successfully. Last Update: ", lastUpdateTime);
    } else {
      console.log("No content found in the latest commit.");
    }
  })
  .catch(error => {
    console.error('Error fetching JSON data:', error);
  });
}

fetchJsonData();
setInterval(fetchJsonData, 600000);  // Update every 10 minutes

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const text = event.message.text.toLowerCase();
  const replyText = createResponse(text);
  return client.replyMessage(event.replyToken, { type: 'text', text: replyText });
}

function createResponse(messageText) {
  if (!jsonData) {
    return "Data is currently unavailable, please try again later.";
  }

  const lastUpdatedText = lastUpdateTime ? `Last Updated: ${lastUpdateTime}` : "Last Update time unknown.";
  
  if (messageText.includes('btc')) {
    return `BTC/USD Predictions:\nToday: ${jsonData['BTC/USD_d'][0]}\nTomorrow: ${jsonData['BTC/USD_d'][1]}\n${lastUpdatedText}`;
  } else if (messageText.includes('nvda')) {
    return `NVDA/USD Predictions:\nToday: ${jsonData['NVDA/USD_d'][0]}\nTomorrow: ${jsonData['NVDA/USD_d'][1]}\n${lastUpdatedText}`;
  } else if (messageText.includes('nasdaq')) {
    return `NASDAQ/USD Predictions:\nToday: ${jsonData['NASDAQ/USD_d'][0]}\nTomorrow: ${jsonData['NASDAQ/USD_d'][1]}\n${lastUpdatedText}`;
  } else {
    return "Supported queries are BTC, NVDA, and NASDAQ.";
  }
}


app.use(express.json());

app.post('/webhook', middleware({ channelAccessToken: process.env.channelAccessToken, channelSecret: process.env.channelSecret }), (req, res) => {
  Promise.all(req.body.events.map(event => {
      handleEvent(event)
    return client.replyMessage(event.replyToken, { type: 'text', text: "Sample reply" });
  })).then(result => res.json(result))
    .catch(err => {
      console.error('Error handling events:', err);
      res.status(500).end();
    });
});

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
