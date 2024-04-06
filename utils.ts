import { OpenAI } from "openai";

export const conversationConverter = (
  messages: OpenAI.Chat.ChatCompletionMessageParam[]
) => {
  let string = "";
  // turn into a string format from the above object format
  messages
    .filter((message) => {
      return message.role !== "system" && message.role !== "function";
    })
    .map((message) => {
      string += `${message.role}: ${message.content}\n\n`;
    });
  return string;
};
