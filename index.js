document.addEventListener('DOMContentLoaded', populateData);


async function populateData() {
    try {
        const response = await fetch("http://localhost:3000/routes");
        if (!response.ok) {
            throw new Error("Couldn't fetch response");
        }
        const data = await response.json();
        const routeSelect = document.querySelector('#route');
        data.forEach(route => {
            const option = document.createElement('option');
            option.value = route.id;
            option.textContent = route.name;
            routeSelect.appendChild(option);
        });
    } catch (error) {
        console.error(error);
    }
}


let form = document.getElementById('bus-form');
document.querySelector('#name').value = '';
document.querySelector('#route').innerHTML = '';
document.querySelector('#results-list').innerHTML = '';
form.addEventListener('submit', function (event) {
    event.preventDefault();
    let name = document.querySelector('#name').value;
    let routeId = document.querySelector('#route').value;

    fetch(`http://localhost:3000/routes/${routeId}`)
        .then(response => response.json())
        .then(route => {
            const stopList = document.querySelector('#results-list');
            stopList.innerHTML = '';

            route.stops.forEach((stop, index) => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <label for="stop-${index}">Number of passengers at ${stop.name}:</label>
                    <input type="number" id="stop-${index}" name="stop-${index}" min="0">
                `;
                stopList.appendChild(listItem);
            });


            const calculateButton = document.createElement('button');
            calculateButton.type = 'button';
            calculateButton.id = 'calculate';
            calculateButton.textContent = 'Calculate';
            stopList.appendChild(calculateButton);
           

            const clearButton = document.createElement('button');
            clearButton.type = 'button';
            clearButton.id = 'clear';
            clearButton.textContent = 'Clear';
            stopList.appendChild(clearButton);

            function reloadPage() {
                window.location.reload();
            }
            clearButton.addEventListener('click', reloadPage)

            calculateButton.addEventListener('click', function () {
                let totalFare = 0;
                let passengerDetails = [];

                document.querySelectorAll('#results-list input').forEach(input => {
                    const stopIndex = input.id.split('-')[1];
                    const stopName = route.stops[stopIndex].name;
                    const stopFare = route.stops[stopIndex].fare;
                    const passengers = parseInt(input.value, 10) || 0;

                    totalFare += stopFare * passengers;
                    passengerDetails.push({
                        stopName: stopName,
                        passengers: passengers,
                        fareCollected: stopFare * passengers
                    });
                });
                calculateButton.style.borderRadius = "2px";
                calculateButton.style.fontSize ="16px"
                calculateButton.style.padding ="12px,28";

                clearButton.style.borderRadius = "2px";
                clearButton.style.fontSize ="16px"
                clearButton.style.padding ="12px,28";
                



                stopList.innerHTML = '';

                const busNameItem = document.createElement('li');
                busNameItem.textContent = `Bus Name: ${name}`;
                stopList.appendChild(busNameItem);

                passengerDetails.forEach((detail, index) => {
                    const stopItem = document.createElement('li');
                    stopItem.textContent = `Stop ${index + 1} (${detail.stopName}) - Passengers: ${detail.passengers}, Fare Collected: $${detail.fareCollected}`;
                    stopList.appendChild(stopItem);
                });

                const totalFareItem = document.createElement('li');
                totalFareItem.textContent = `Total Fare Collected: $${totalFare}`;
                stopList.appendChild(totalFareItem);
            });

        })
        .catch(error => console.error('Error fetching route details:', error));
});

