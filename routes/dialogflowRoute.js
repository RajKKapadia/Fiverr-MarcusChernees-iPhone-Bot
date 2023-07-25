const express = require('express');
const router = express.Router();

const { formatDialogflowResponse } = require('../helper/untils');
const { handleUserProvideProductPhone, handleUserAskingAboutColor, 
  handleUserAskingAboutCondition, handleUserProvidesPhoneBuyOption, handleUserConfirmsPhoneBuy } = require('../controllers/phoneController');

router.post('/webhook', async (req, res) => {
  let action = req.body.queryResult.action;
  let responseData = {};
  if (action === 'userProvideProductPhone') {
    responseData = await handleUserProvideProductPhone(req);
  } else if (action === 'userAskingAboutColor') {
    responseData = handleUserAskingAboutColor(req);
  } else if (action === 'userAskingAboutCondition') {
    responseData = handleUserAskingAboutCondition(req);
  } else if (action === 'userProvidesPhoneBuyOption') {
    responseData = handleUserProvidesPhoneBuyOption(req);
  } else if (action === 'userConfirmsPhoneBuy') {
    responseData = handleUserConfirmsPhoneBuy(req);
  }
  else {
    responseData = formatDialogflowResponse(`No handler for the action ${action}.`, []);
  }
  res.send(responseData);
});

module.exports = {
  router
};
