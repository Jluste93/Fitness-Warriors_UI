function updateProgress(value) {
  const bar = document.querySelector('.progress-bar');
  bar.style.width = `${value}%`;
  bar.textContent = `${value}%`;
}

// Example: simulate progress
//updateProgress(65); // Later this will come from backend data