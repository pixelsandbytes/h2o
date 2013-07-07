# What is this?

This example illustrates how to use h2o to build a server that streams its response to the client (instead of writing the response all at once).

# How do I run it?

1. `node server.js`
2. Open http://localhost:8765/test.html in your browser to see this server in action
3. Open `response-sender.js` in your text editor and read the comments for explanations on how responses are streamed to the client
