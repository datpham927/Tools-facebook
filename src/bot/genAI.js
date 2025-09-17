const { generateChatContent } = require("./api");

// Example in an async function (e.g., React component)
async function handleUserInput(userInput) {
  const botMessage = await generateChatContent(userInput);
  console.log(botMessage); // { id: '...', role: 'bot', content: 'Generated response...' }
}
handleUserInput("Dép tổ ong gắn stickers");
