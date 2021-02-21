const express = require('express');
const app = express();
const port = 4000;

app.use(express.static("public"));

app.listen(process.env.PORT || port, () =>
    console.log(`http://localhost:${port}`)
);
