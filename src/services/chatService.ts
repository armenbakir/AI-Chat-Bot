import axios from "axios";

const API_URL = "/api/chat";

export const chatService = {
  async sendMessage(inputValue: string) {
    const response = await axios.post(API_URL, { inputValue });
    return response.data;
  },
};
