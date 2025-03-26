// Add helper to format values
    function safeValue(val) {
      return (val === undefined || val === null) ? "N/A" : val;
    }
    
    async function fetchData() {
      try {
        const sensorResponse = await fetch('http://localhost:3000/api/sensors'); // Nova rota para consultar o banco
        if (!sensorResponse.ok) throw new Error(`Failed to fetch sensors: ${sensorResponse.status}`);
        const sensorData = await sensorResponse.json();
        const sensors = Array.isArray(sensorData) ? sensorData : [sensorData];

        const inverterResponse = await fetch('http://localhost:3000/api/inverters'); // Nova rota para consultar o banco
        if (!inverterResponse.ok) throw new Error(`Failed to fetch inverters: ${inverterResponse.status}`);
        const inverterData = await inverterResponse.json();
        const readings = Array.isArray(inverterData) ? inverterData : [inverterData];

        const timestamp = new Date().toLocaleString();

        // Sort sensors by created_at in descending order and reverse
        sensors.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).reverse();

        // Populate sensor data with updated keys (adjust keys if your API returns different names)
        const sensorTableBody = document.querySelector('#sensorTable tbody');
        sensorTableBody.innerHTML = '';
        sensors.forEach(sensor => {
          const row = `
            <tr>
              <td>${safeValue(sensor.id)}</td>
              <td>${safeValue(sensor.current_r)}</td>   
              <td>${safeValue(sensor.current_s)}</td>
              <td>${safeValue(sensor.current_t)}</td>
              <td>${safeValue(sensor.voltage_r)}</td>
              <td>${safeValue(sensor.voltage_s)}</td>
              <td>${safeValue(sensor.voltage_t)}</td>
              <td>${safeValue(sensor.vibration)}</td>
              <td>${safeValue(sensor.level)}</td>
              <td>${safeValue(sensor.created_at)}</td>
            </tr>
          `;
          sensorTableBody.innerHTML += row;
        });

        // Sort readings by created_at in descending order and reverse
        readings.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).reverse();

        // Populate inverter data (updated keys)
        const inverterTableBody = document.querySelector('#inverterTable tbody');
        inverterTableBody.innerHTML = ''; // Clear the table before appending new rows
        readings.forEach(reading => {
          reading.inverters.forEach(inverter => {
            const row = `
              <tr>
                <td>${safeValue(inverter.id)}</td>
                <td>${safeValue(reading.id)}</td>
                <td>${safeValue(inverter.model)}</td>
                <td>${safeValue(inverter.f)}</td>
                <td>${safeValue(inverter.v)}</td>
                <td>${safeValue(inverter.dc)}</td>
                <td>${safeValue(inverter.p)}</td>
                <td>${safeValue(inverter.rpm)}</td>
                <td>${safeValue(inverter.t)}</td>
                <td>${safeValue(reading.created_at)}</td>
              </tr>
            `;
            inverterTableBody.innerHTML += row;
          });
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    // Fetch data every 5 seconds
    setInterval(fetchData, 5000);
    fetchData();