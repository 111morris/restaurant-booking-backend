const express = require("express");
const { askChatGPT } = require("../aiService");
const { Result } = require("postcss");

const router = express.Router();

router.post("/ask", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }
  const result = await askChatGPT(message);

  //if the ai is disable or there is an error you will get 503 (service unavailable)  else send response
  if (result.error) {
    return res.status(503).json({ error: result.error });
  }

  res.json({ response: result.response });
});

module.exports = router;
