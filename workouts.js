// Inputs
const Enter_excercise = document.getElementById('Enter-excercise');
const ExcerciseNameInput = document.getElementById('excercise-name');
const calories_burned = document.getElementById('calories');
const workoutList = document.getElementById('workouts');
const totalCaloriesD = document.getElementById('total-calories');
const Reps = document.getElementById('Reps');
const Sets = document.getElementById('Sets');
const durationInput = document.getElementById('duration');
const workoutDurationDisplay = document.getElementById('workout-duration');

let workouts = [];
let totalCalories = 0;

document.addEventListener('DOMContentLoaded', () => {
  loadWorkouts();
  updateTotalCalories();

  // Attach listener to Material button
  customElements.whenDefined('md-outlined-button').then(() => {
    const logButton = document.querySelector('.logWorkoutButton');
    if (logButton) {
      logButton.addEventListener('click', () => {
        Enter_excercise.requestSubmit(); // Triggers form submission
      });
    } else {
      console.warn('Log Workout button not found.');
    }
  });
});

// Form submission
Enter_excercise.addEventListener('submit', function(event) {
  event.preventDefault();
  addWorkout();
  Enter_excercise.reset();
});

// Load workouts from localStorage
function loadWorkouts() {
  const storedWorkouts = localStorage.getItem('Workouts');
  if (storedWorkouts) {
    workouts = JSON.parse(storedWorkouts);
    workouts.forEach(workout => displayWorkout(workout));
    updateTotalCalories();
  }
}

// Save workouts to localStorage
function saveWorkouts() {
  localStorage.setItem('Workouts', JSON.stringify(workouts));
}

// Add new workout
function addWorkout() {
  const excerciseName = ExcerciseNameInput.value.trim();
  const caloriesBurned = parseInt(calories_burned.value.trim());
  const reps = Reps.value.trim();
  const sets = Sets.value.trim();
  const duration = parseInt(durationInput.value.trim());

  if (excerciseName === '' || isNaN(caloriesBurned) || caloriesBurned <= 0) {
    alert('Please enter valid workout details.');
    return;
  }

  const workout = {
    id: Date.now(),
    name: excerciseName,
    calories: caloriesBurned,
    Reps: reps,
    Sets: sets,
    duration: duration
  };

  workouts.push(workout);
  displayWorkout(workout);
  updateTotalCalories();
  saveWorkouts();
  updateChart(); // Optional: if defined elsewhere
}

// Display workout in list
function displayWorkout(workout) {
  const li = document.createElement('li');
  li.dataset.id = workout.id;

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

// Delete workout
function deleteWorkout(id) {
  workouts = workouts.filter(workout => workout.id !== id);
  const workoutItem = workoutList.querySelector(`[data-id='${id}']`);
  if (workoutItem) {
    workoutList.removeChild(workoutItem);
  }

  updateTotalCalories();
  saveWorkouts();
  updateChart(); // Optional: if defined elsewhere
}

// Update total calories
function updateTotalCalories() {
  totalCalories = workouts.reduce((total, workout) => total + workout.calories, 0);
  totalCaloriesD.textContent = totalCalories;
}