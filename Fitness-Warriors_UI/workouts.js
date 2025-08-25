// Inputs
const Enter_exercise = document.getElementById('Enter-exercise');
const ExerciseNameInput = document.getElementById('exercise-name');
const calories_burned = document.getElementById('calories');
const workoutList = document.getElementById('workouts');
const totalCaloriesD = document.getElementById('total-calories');
const Reps = document.getElementById('Reps');
const Sets = document.getElementById('Sets');
const durationInput = document.getElementById('duration');
const workoutDurationDisplay = document.getElementById('workout-duration');

let workouts = [];
let totalCalories = 0;

function getWorkoutInput() {
  return {
    name: ExerciseNameInput.value.trim(),
    calories: parseInt(calories_burned.value.trim()),
    reps: parseInt(Reps.value.trim()) || 0,
    sets: parseInt(Sets.value.trim()) || 0,
    duration: parseInt(durationInput.value.trim()) || 0,
    type: document.getElementById('w_type').value
  };
}

document.addEventListener('DOMContentLoaded', () => {
  loadWorkouts();
  updateTotalCalories();
  updateWorkoutDuration();

  // Attach listener to Material button
  const logButton = document.querySelector('.logWorkoutButton');

  if (logButton) {
    logButton.addEventListener('click', async () => {
      const unsavedWorkouts = workouts.filter(w => !w.isLogged);

      if (unsavedWorkouts.length === 0) {
        alert('No unsaved workouts to log.');
        return;
      }

      for (const workout of unsavedWorkouts) {
        try {
          const response = await fetch('http://3.147.83.249:3000/workouts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([{
              exercisename: workout.name,
              w_type: workout.type || 'General',
              Reps: workout.Reps,
              Sets: workout.Sets,
              duration: workout.duration,
              calories: workout.calories
            }])
          });

          if (!response.ok) throw new Error('Server error');

          workout.isLogged = true;

          const item = workoutList.querySelector(`[data-id='${workout.id}']`);
          if (item) {
            item.classList.remove('unsaved');
            item.classList.add('logged');
          }
        } catch (err) {
          console.error(`Failed to log workout "${workout.name}":`, err);
        }
      }

      saveWorkouts();
    });
  }

  Enter_exercise.addEventListener('submit', function(event) {
    event.preventDefault();
    addWorkout();
    Enter_exercise.reset();
  });
});

/////

function addWorkout() {
  const { name, calories, reps, sets, duration, type } = getWorkoutInput();

  if (name === '' || isNaN(calories) || calories <= 0) {
    alert('Please enter valid workout detales');
    return;
  }

  const workout = {
    id: Date.now(),
    name,
    calories,
    Reps: reps,
    Sets: sets,
    duration,
    type,  //adjust other files
    isLogged: false,
    //users_id: ''
  };

  console.log('Adding workout:', workout);
  workouts.push(workout);
  displayWorkout(workout);
  updateTotalCalories();
  updateWorkoutDuration();
  saveWorkouts();
  //updateChart(); // Optional
}

function displayWorkout(workout) {
  const li = document.createElement('li');
  li.dataset.id = workout.id;
  li.classList.add(workout.isLogged ? 'logged' : 'unsaved');

  li.innerHTML = `
    <span>${workout.name}</span>
    <span>${workout.calories} Calories</span>
    <span>${workout.Reps} Reps</span>
    <span>${workout.Sets} Sets</span>
    <span>${workout.duration} min</span>
    <button class="delete-btn">&times;</button>
  `;

  li.querySelector('.delete-btn').addEventListener('click', function() {
    deleteWorkout(workout.id);
  });

  workoutList.appendChild(li);
}

function deleteWorkout(id) {
  workouts = workouts.filter(workout => workout.id !== id);
  const workoutItem = workoutList.querySelector(`[data-id='${id}']`);
  if (workoutItem) {
    workoutList.removeChild(workoutItem);
  }

  updateTotalCalories();
  updateWorkoutDuration();
  saveWorkouts();
  //updateChart(); // Optional
}

function updateTotalCalories() {
  totalCalories = workouts.reduce((total, workout) => total + workout.calories, 0);
  totalCaloriesD.textContent = totalCalories;
}

// Optional: update total duration
function updateWorkoutDuration() {
  const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0);
  workoutDurationDisplay.textContent = `${totalDuration} min`;
}

function loadWorkouts() {
  const storedWorkouts = localStorage.getItem('Workouts');
  if (storedWorkouts) {
    workouts = JSON.parse(storedWorkouts);
    workouts.forEach(workout => displayWorkout(workout));
    updateTotalCalories();
    updateWorkoutDuration();
  }
}

function saveWorkouts() {
  localStorage.setItem('Workouts', JSON.stringify(workouts));
}