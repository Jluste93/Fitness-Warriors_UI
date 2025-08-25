const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const { Pool } = require('pg');

// Database connection
const pool = new Pool ({
    host: 'database-1.c322e60egpt1.us-east-2.rds.amazonaws.com',
    port: 5432,
    user: 'postgres',
    password: 'nordaj93',
    // Corrected: Removed the semicolon from the database name
    database: 'fitness_warriors',
});

pool.connect()
    .then(() => {console.log('Connected to PostgreSQL database!');})
    .catch((err) => { console.error('Error connecting to the database:', err); });

// Middleware
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
// Serves static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// All specific API Routes MUST be defined BEFORE the catch-all
// ----------------------------------------------------

// GET routes
app.get('/', (req, res) => {
    res.send('Server is alive!');
});

app.get('/stats', (req, res) => {
    try {
        console.log('Stats page requested');
        // The path is now correctly pointing to the 'public' folder
        res.sendFile(path.join(__dirname, 'public', 'stats.html'));
    } catch (err){
        res.status(400).send('The information cannot be found');
    }
});

app.get('/progress', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM workouts');
        const result2 = await pool.query('SELECT weight FROM stats');
        res.json({
            workouts: result.rows,
            stats: result2.rows
        });
    } catch (err){
        console.error('Error fetching progress data:', err);
        res.status(500).json({error: 'Something went wrong'})
    }
});

// NEW ROUTE to get workout data
app.get('/workouts', async (req, res) => {
    try {
        console.log('Workouts page requested');
        // Fetch all workouts from the database
        const result = await pool.query('SELECT * FROM workouts ORDER BY workouts_id DESC');
        // Send the fetched data as a JSON response
        res.json({ workouts: result.rows });
    } catch (err) {
        console.error('Error fetching workouts:', err);
        res.status(500).json({ error: 'Failed to fetch workouts' });
    }
});

// POST routes
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

app.post('/log-weight', async (req, res) => {
    const {weight, date} = req.body;
    res.json({ message: 'Weight logged succesfully!'});
});

app.post('/log-waist', async (req, res) => {
    const {waist, date} = req.body;
    res.json({ message: 'Waist logged succesfully!'});
});

app.post('/log-bodyfat', (req, res) => {
    const { bodyfat, date } = req.body;
    res.json({ message: 'Body fat logged successfully!' });
});

app.post('/workouts', async (req, res) => {
    const workoutsToLog = req.body;
    if (!Array.isArray(workoutsToLog) || workoutsToLog.length === 0) {
        return res.status(400).send('Invalid Request');
    }
    try {
        for(const workout of workoutsToLog) {
            const { exercisename, w_type, Reps, Sets, duration, calories} = workout;
            if (
                exercisename == null ||
                w_type == null ||
                Reps == null ||
                Sets == null ||
                duration == null || 
                calories == null
            ) {
                return res.status(400).send('One or more workout entries are missing required information.');
            }
            await pool.query(
                'INSERT INTO workouts (exercisename, w_type, Reps, Sets, duration, calories) VALUES ($1, $2, $3, $4, $5, $6)',
                [exercisename, w_type, Reps, Sets, duration, calories]
            );
        }
        res.status(201).send('Workout logged successfully');
    } catch (err) {
        console.error('Error logging workout:', err);
        res.status(500).send('Failed to log workout');
    }
});

app.post('/submit', async (req, res) => {
    const { goals, schedule, activity_level, heightFeet, heightInches, weight, gender,dob } = req.body;

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
    genderArray = normalizeArray(gender);

    try {
        await pool.query(
            'INSERT INTO stats (goals, schedule, activity_level, heightFeet, heightInches, weight, gender, dob) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [goalsArray, scheduleArray, activityLevelArray, heightFeet, heightInches, weight, genderArray, dob]
        );
        res.send('Stats updated succesfully');
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(' Failed to update stats')
    }
});

// DELETE routes
app.delete('/workouts', (req, res) => {
    res.send('workout deleted');
});

app.delete('/workouts/:id', async (req, res) => {
    const workouts_id = req.params.id;
    try {
        const result = await pool.query(
            'DELETE FROM workouts WHERE workouts_id = $1 RETURNING *',
            [workouts_id]
        );
        if (result.rowCount === 0) {
            return res.status(404).send('No workout entry exists with the specified ID');
        }
        res.status(200).send('Workout deleted successfully');
    } catch (err) {
        console.error('Error deleting workout:', err);
        res.status(500).send('Server error while deleting workout');
    }
});

// PATCH routes
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

app.patch('/:id/reschedule', async (req, res) => {
    const schedule_id = req.params.id;
    const {schedule_date} = req.body;

    if (!schedule_date) {
        res.status(400).send('You did not log anything.') 
    } else {
        await pool.query(
            'UPDATE schedule SET rescheduleddate = $1 WHERE id = $2',
            [schedule_date, schedule_id]
        );
        res.json({ message: `Workout for ${schedule_id} rescheduled to next available slot`, schedule_date });
    }
});


// Catch-all route must be last
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('Server running on port 3000');
});
