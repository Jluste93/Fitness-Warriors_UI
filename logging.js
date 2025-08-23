  
    ['weightForm', 'waistForm', 'bodyFatForm'].forEach(id => {
      document.getElementById(id).addEventListener('submit', async (e) => {
        e.preventDefault();

        const date = document.getElementById('date').value;
        let endpoint, payload;

        if(id === 'weightForm') {
          const weight = document.getElementById('weight').value;
          endpoint = '/log-weight';
          payload ={ weight, data };
        } else if (id  === 'waistForm') {
          const waist = document.getElementById('waist').value;
          endpoint = '/log-waist';
          payload = { waist, date};
        }else if (id === 'bodyFatForm') {
          const bodyfat = document.getElementById('bodyfat').value;
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
        document.getElementById('message').textContent = result.message || 'Weight logged!';
        document.getElementById('weightForm').reset();
      } catch (err) {
        document.getElementById('message').textContent = 'Error logging weight.';
        console.error(err);
      }
    });
  });
