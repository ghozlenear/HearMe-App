const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Define the /chat endpoint
app.post('/chat', (req, res) => {
  const userMessage = req.body.message;
  console.log("Received message:", userMessage);

  // Simulate a response in Arabic
  const response = "هذا رد من الخادم باللغة العربية.";
  res.json({ response });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});