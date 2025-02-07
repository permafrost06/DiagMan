import { Env } from "../worker";

export const  sendSms = async (env: Env, to: string | string[], message: string): Promise<string | false> => {
	const url = "http://bulksmsbd.net/api/smsapi";
	const apiKey = env.BULKSMS_API_KEY!;
	const senderId = env.BULKSMS_SENDER_ID!;
	const number = Array.isArray(to) ? to.join(',') : to;

	const data = new URLSearchParams({
			api_key: apiKey,
			senderid: senderId,
			number: number,
			message: message
	});

	try {
			const response = await fetch(url, {
					method: 'POST',
					body: data.toString(),
					headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
					}
			});

			if (!response.ok) {
					return "Something went wrong with sending SMS";
			}

			const responseData = await response.json() as { error_message: string };

			if (responseData.error_message && responseData.error_message.trim() !== '') {
					return responseData.error_message;
			}

			return false;

	} catch (error) {
			return "Something went wrong with sending SMS";
	}
}
