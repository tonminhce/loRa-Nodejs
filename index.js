const OpenAI = require("openai");
const readline = require("readline");

// const openai = new OpenAI({
//   // apiKey: "",
// });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askQuestion() {
  return new Promise((resolve, reject) => {
    rl.question("Enter your question: ", (question) => {
      resolve(question);
    });
  });
}

async function main() {
  const question = await askQuestion();
  const prompt = `Imagine you are a durian specialist. Answer the following question in vietnamese:\n\n${question}\n\n`;

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "user", content: prompt },
    ],
    model: "gpt-3.5-turbo",

  });

  console.log(completion.choices[0].message.content);
  rl.close();
}

main();
