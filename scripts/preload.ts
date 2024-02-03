import { OpenAI } from "openai";

export const testMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "\n" +
      "You are a piece of a super-intelligent AI called “The Assumptioneer” . The `GOAL` of “The Assumptioneer” is to guide humans to solve their problems permanently. There are 8 expert `WORKERS` that make up “The Assumptioneer”.\n" +
      "\n" +
      "You are the `WORKER` Control Center. Your job as `WORKER` Control Center is to decide which expert workers are important to be called on to respond to the conversation. \n" +
      "\n" +
      "Based on the `GOAL`, the `message_history` and `RECOMMENDATIONS`, pick the appropriate `WORKER` to respond to the user.\n" +
      "\n" +
      "RECCOMENDATIONS:\n" +
      "User has clearly grounded the problem to the 5 senses, recommendation to proceed with assessing urgency/unacceptance of situation\n",
  },
  {
    role: "user",
    content: "I eat lots of chocolate and don't know how to stop",
  },
  {
    role: "function",
    name: "workerA",
    content: `{"res":{"success":false,"response":"I hear you're struggling with your chocolate consumption. To help you better, I need you to detail your experience more concretely. How often do you find yourself eating chocolate? Describe to me the exact moments when you usually reach for chocolate. What do you see, what do you hear, and what are you doing right before that happens?","recommendation":""}}`,
  },
  {
    role: "assistant",
    content:
      "I hear you're struggling with your chocolate consumption. To help you better, I need you to detail your experience more concretely. How often do you find yourself eating chocolate? Describe to me the exact moments when you usually reach for chocolate. What do you see, what do you hear, and what are you doing right before that happens?",
  },
  {
    role: "user",
    content:
      "I was in my room, I had 2 reeses bars in my fridge, I didn't have much else to eat but then i thought about the 2 reeses bars and felt good, so I went an grabbed them, a thought crossed my head that i probably shouldn't do this, but I ignored it and opened it and viciously started eating it nonstop until there was none left. Then I had a thought that I Just put so much sugar in my body for only 5 min of pleasure",
  },
  {
    role: "function",
    name: "workerA",
    content:
      '{"res":{"success":true,"response":"","recommendation":"User has clearly grounded the problem to the 5 senses, recommendation to proceed with assessing urgency/unacceptance of situation"}}',
  },
  {
    role: "function",
    name: "workerB",
    content: `{"res":{"success":false,"response":"I understand you're feeling conflicted about eating chocolate, specifically the Reese's bars. Let's have a look at how this is sitting with you. If you decided to not take any steps toward addressing this problem for the next week, how unacceptable would that be for you on a scale from 1 to 10? You can get a better sense of what I mean by checking out this unacceptance chart [here](https://assumptions.app/criteria). Are we talking about a crisis level of concern, or is it more of a mild inconvenience to you?","recommendation":""}}`,
  },
  {
    role: "assistant",
    content:
      "I understand you're feeling conflicted about eating chocolate, specifically the Reese's bars. Let's have a look at how this is sitting with you. If you decided to not take any steps toward addressing this problem for the next week, how unacceptable would that be for you on a scale from 1 to 10? You can get a better sense of what I mean by checking out this unacceptance chart [here](https://assumptions.app/criteria). Are we talking about a crisis level of concern, or is it more of a mild inconvenience to you?",
  },
  { role: "user", content: "I would say it's probably a 5" },
  {
    role: "function",
    name: "workerB",
    content: `{"res":{"success":false,"response":"Alright, you've placed your level of unacceptance at a 5. It's definitely bothering you, but it's not yet pushing you over the edge. Can you pinpoint a time or event in the future when not addressing your chocolate consumption might escalate to a 10/10 level of unacceptance for you?","recommendation":""}}`,
  },
  {
    role: "assistant",
    content:
      "Alright, you've placed your level of unacceptance at a 5. It's definitely bothering you, but it's not yet pushing you over the edge. Can you pinpoint a time or event in the future when not addressing your chocolate consumption might escalate to a 10/10 level of unacceptance for you?",
  },
];
