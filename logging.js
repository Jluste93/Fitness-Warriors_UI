  
    ['weightForm', 'waistForm', 'bodyFatForm'].forEach(id => {
      document.getElementById(id).addEventListener('submit', async (e) => {
        e.preventDefault();

        //const date = document.getElementById('date').value;
        let endpoint, payload, date;

        if(id === 'weightForm') {
          const weight = document.getElementById('weight').value;
          date = document.getElementById('weight-date').value;
          endpoint = '/log-weight';
          payload ={ weight, date};
        } else if (id  === 'waistForm') {
          const waist = document.getElementById('waist').value;
          date = document.getElementById('waist-date').value;
          endpoint = '/log-waist';
          payload = { waist, date};
        }else if (id === 'bodyFatForm') {
          const bodyfat = document.getElementById('bodyfat').value;
          date = document.getElementById('bodyfat-date').value;
          endpoint = '/log-bodyfat';
          payload = {bodyfat, date}
        }

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });


        const result = await res.json();
        const messageId = `${id.replace('Form', '')}-message`;
        document.getElementById(messageId).textContent = result.message || 'Logged!';
        document.getElementById(id).reset();
      } catch (err) {
        const messageId = `${id.replace('Form', '')}-message`;
        document.getElementById(messageId).textContent = 'Error logging data.';
        console.error(err);
      }
    });
  });
