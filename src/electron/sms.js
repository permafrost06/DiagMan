import { ipcMain } from "electron";
import axios from "axios";

const https = require("https");

var sms_token = "";
var sms_message = "";

ipcMain.on("sms-settings", (event, settings) => {
    sms_token = settings.token;
    sms_message = settings.message;
});

ipcMain.on("send-sms", async (event, contactNo) => {
    await sendSMS(contactNo);
});

ipcMain.on("get-sms-balance", async (event) => {
    event.returnValue = await getSMSBalance();
});

export const sendSMS = async (contactNo) => {
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

    var config = {
        method: "post",
        url: "https://sysadmin.muthobarta.com/api/v1/send-sms",
        headers: {
            Authorization: "Token " + sms_token,
            "Content-Type": "application/json",
        },
        data: data,
    };

    try {
        const res = await instance.request(config);
        console.log(JSON.stringify(res.data));
    } catch (error) {
        console.log(error);
    }
};

export const getSMSBalance = async () => {
    const baseResponse = {
        balance: -1,
        expiry: "1-1-1T",
    };

    if (!sms_token) {
        console.log("no sms token");
        return baseResponse;
    }

    var config = {
        method: "get",
        url: "https://sysadmin.muthobarta.com/api/v1/get-balance",
        headers: {
            Authorization: "Token " + sms_token,
        },
    };

    try {
        const res = await axios(config);
        const { code, balance, expiry } = res.data;

        if (code === 200) {
            return { balance, expiry };
        }
    } catch (error) {
        console.log(error);
    }

    return baseResponse;
};
