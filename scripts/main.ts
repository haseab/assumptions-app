import OpenAI from "openai";
import readline from "readline";

// Set up readline interface for CLI input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.withlogging.com/v1",
  defaultHeaders: {
    "X-Api-Key": "Bearer " + process.env.LLM_API_KEY,
  },
});

function askQuestion() {
  rl.question("User: ", (userInput) => {
    if (userInput.toLowerCase() === "quit") {
      console.log("Exiting...");
      rl.close(); // Close the readline interface and exit
      return; // Stop the recursion
    }

    const stream = openai.beta.chat.completions.stream({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are named Sophia, an expert AI chatbot.",
        },
        {
          role: "user",
          content: userInput,
        },
      ],
      stream: true, // Set stream to true for streaming output
    });

    process.stdout.write("AI: ");
    // Listen for data events from the stream
    stream.on("content", (delta, snapshot) => {
      // const message = JSON.parse(data.toString());
      // console.log("Response:", message.choices[0].message.content);
      process.stdout.write(delta);
    });

    stream.on("end", () => {
      console.log("");
      askQuestion(); // Ask the next question after receiving the response
      // rl.close(); // Close the readline interface on stream end
    });

    stream.on("error", (error) => {
      console.error("Stream encountered an error:", error);
      rl.close(); // Close the readline interface on error
    });
  });
}

function main() {
  askQuestion(); // Start the recursive loop
}

main();
