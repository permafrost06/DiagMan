import { ipcMain } from "electron";

var axios = require("axios");
const https = require("https");

var sms_token = "";
var sms_message = "";

ipcMain.on("sms-settings", (event, settings) => {
  sms_token = settings.token;
  sms_message = settings.message;
});

ipcMain.on("send-sms", (event, contactNo) => {
  sendSMS(contactNo);
});

export const sendSMS = (contactNo) => {
  if (!sms_token) {
    console.log("no sms token");
  }

  const instance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });

  const data = JSON.stringify({
    receiver: contactNo,
    message: sms_message,
    remove_duplicate: true,
  });

  const token = "Token " + sms_token;

  var config = {
    method: "post",
    url: "https://sysadmin.muthobarta.com/api/v1/send-sms",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    data: data,
  };

  instance
    .request(config)
    .then(function(response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function(error) {
      console.log(error);
    });
};