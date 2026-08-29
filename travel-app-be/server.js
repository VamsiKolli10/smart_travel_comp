require("dotenv").config();

const { createApp } = require("./src/app");

const app = createApp();
const PORT = process.env.APP_PORT || process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
