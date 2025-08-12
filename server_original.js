const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(express.json());

// post
app.post('/submit', (req, res) => {
    const data = req.body;
    console.log(data);

    res.send('Data received');
});

// Basic route
// app.get('/', (req, res) => {
    //res.send('Fitness Warrior API is running!');
//});

// Start server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

const express = require('express');