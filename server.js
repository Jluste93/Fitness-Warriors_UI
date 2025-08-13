

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const { Pool } = require('pg');

const pool = new Pool ({
    user: 'postgres',
    host: 'localhost', //changed from localhost and rds-ca-rsa2048-g1 .....database-1.c322e60egpt1.us-east-2.rds.amazonaws.com
    database: 'postgres',
    password: 'nordaj93',
    port: 5432,
});

pool.connect()
    .then(() => {console.log('Connected to PostgreSQL database!');})
    .catch((err) => { console.error('Error connecting to the database:', err); });

// Middleware
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname))); // For CSS, JS, images

// Routes
app.get('/', (req, res) => {
  res.send('Server is alive!');
});

//app.post('/users', (req, res) => {
//    res.send('Stats added successfully!. Account created successfully.');
//});

//app.get('/stats', (req, res) => {
//    res.sendFile(path.join(__dirname, 'stats.html'));
//});

//app.post('/workouts', (req, res) => {
//    res.send('workouts.html');  //log a workout and create a workout
//});

app.get('/progress', (req, res) => {
    res.sendFile(path.join(__dirname, 'progress.html')); // check progress
});

app.delete('/workouts', (req, res) => {
    res.send('workout deleted');  //log a workout and create a workout
});

app.patch('/stats', (req, res) => {
    res.send('Stats updated succesfully'); //change stats
});

//app.patch('/workouts', (req, res) => {
//    res.send('Workout rescheduled to next available slot'); //resceduale workout
//});


// These routes handle form submission. May need to go back and mention foreign keys

//users
app.post('/users', async (req, res) => {
    const { users_id, name, email, password } = req.body;

    try {
        await pool.query(
            'INSERT INTO users (users_id, name, email, password) VALUES ($1, $2, $3, $4)',
            [users_id, name, email, password]
        );

        res.send('User info submitted.');
    } catch (err) {
        console.log('Missing information.', req.body);
        res.status(400).send('Missing or invalid user data.');
    }
});

//check stats
app.get('/stats', (req, res) => {
    const path = require('path'); // might need to be moved above

    try{
        console.log('Stats page requested');
        res.sendFile(path.join(__dirname,'stats.html'));

    }catch (err){
        res.status(400).send('The information cannot be found');
    }
});

//log workouts
app.post('/workouts', (req, res) => {
    const {workouts_id, exercisename, w_type} = req.body;

    if 
        (workouts_id && exercisename && w_type) {
        console.log('Workout logged successfully');
        res.send('Workout logged successfully');

        } else{
            res.status(400).send('Enter required information');
        }
});

//updating stats or creating stats

app.post('/submit', async (req, res) => {
    const { goals, schedule, activity_level, height, weight, gender,dob } = req.body;

    const normalizeArray = (input) => {
        if (Array.isArray(input)) return input;
        if (typeof input === 'string') {
            return input.trim() === '' ? [] : [input];
        }
        return [];
  };

    const goalsArray = normalizeArray(goals);
    const scheduleArray = normalizeArray(schedule);
    const activityLevelArray = normalizeArray(activity_level);
    const genderArray = normalizeArray(gender);

    try {
        await pool.query(
            'INSERT INTO stats (goals, schedule, activity_level, height, weight, gender, dob) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [goalsArray, scheduleArray, activityLevelArray, height, weight, genderArray, dob]

        );
        res.send('Stats updated succesfully');
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(' Failed to update stats')
    }
});


//create a workout
//app.get('/progress', (req, res) => {

//}

//delete
app.delete('/workouts/:id', async (req, res) => {
    const workouts_id  = req.params.id;

    try {
        const result = await pool.query(
            'DELETE FROM workouts WHERE workouts_id = $1 RETURNING *',
            [workouts_id]
        );

        if (result.rowCount === 0) { // no matches found
            return res.status(404).send('No workout entry exists with the specified ID');
        }

        res.status(200).send('Workout deleted successfully');
    } catch (err) {
        console.error('Error deleting workout:', err);
        res.status(500).send('Server error while deleting workout');
    }
});

// change stats
app.patch('/stats/:id', async (req, res) => {
  const stats_id = req.params.id;
  const { goals, schedule, activity_level, weight } = req.body;

  if (goals && schedule && activity_level && weight) {
    try {
      await pool.query(
        'UPDATE stats SET goals = $1, schedule = $2, activity_level = $3, weight = $4 WHERE id = $5',
        [goals, schedule, activity_level, weight, stats_id]
      );
      res.status(200).send(`Updated stats for user ${stats_id}`);
    } catch (err) {
      console.error('Error updating stats:', err);
      res.status(500).send('Failed to update stats');
    }
  } else {
    res.status(400).send('Missing required field');
  }
});

//rescedual
app.patch('/:id/reschedule', async (req, res) => {
    const schedule_id = req.params.id;
    const {schedule_date} = req.body;

if (!schedule_date) {
        res.status(400).send('You did not log anything.') 
    } else{
        await pool.query(
            'UPDATE schedule SET rescheduleddate = $1 WHERE id = $2',
            [schedule_date, schedule_id]);
 
        res.json({ message: `Workout for ${schedule_id} rescheduled to next available slot`, schedule_date });    
    }
    
});
    
// Start server
//app.listen(PORT, () => {
//    console.log(`Server is listening on port ${PORT}`);
//});
app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on port 3000');
});