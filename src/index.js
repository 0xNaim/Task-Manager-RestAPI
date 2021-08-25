const app = require('./app');
const port = process.env.PORT;

// server listening
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
