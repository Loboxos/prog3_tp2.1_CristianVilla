class Sensor {
    constructor(id,name,type,value,unit,update_at){
        this.id = id;
        this.name=name;
        const validTypes=['temperature','humidity','pressure']
        this.type = validTypes.includes(type) ? type:'value incorrect';
        this.value=value;
        this.unit=unit;
        this.update_at=update_at;
    }

    set updateValue(newValue){
        this.value=newValue;
        this.update_at=new Date().toDateString();
        console.log("value sensor act\n value update act\n")
    }
}

class SensorManager {
    constructor() {
        this.sensors = [];
    }

    addSensor(sensor) {
        this.sensors.push(sensor);
    }

    updateSensor(id) {
        const sensor = this.sensors.find((sensor) => sensor.id === id);
        if (sensor) {
            let newValue;
            switch (sensor.type) {
                case "temperatura": // Rango de -30 a 50 grados Celsius
                    newValue = (Math.random() * 80 - 30).toFixed(2);
                    break;
                case "humedad": // Rango de 0 a 100%
                    newValue = (Math.random() * 100).toFixed(2);
                    break;
                case "presion": // Rango de 960 a 1040 hPa (hectopascales o milibares)
                    newValue = (Math.random() * 80 + 960).toFixed(2);
                    break;
                default: // Valor por defecto si el tipo es desconocido
                    newValue = (Math.random() * 100).toFixed(2);
            }
            sensor.updateValue = newValue;
            this.render();
        } else {
            console.error(`Sensor ID ${id} no encontrado`);
        }
    }

    async loadSensors(url) {
        try{
            const response = await fetch(url);
            if(!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const sensorData=await response.json();
            sensorData.forEach(sensor => {
                const newSensor = new Sensor(
                    sensor.id,
                    sensor.name,
                    sensor.type,
                    sensor.value,
                    sensor.unit,
                    sensor.update_at
                );
                this.addSensor(newSensor);
            });
            this.render();
        }catch(error){
            console.error(`Failed to load sensors: ${error}`);
        }
    }

    render() {
        const container = document.getElementById("sensor-container");
        container.innerHTML = "";
        this.sensors.forEach((sensor) => {
            const sensorCard = document.createElement("div");
            sensorCard.className = "column is-one-third";
            sensorCard.innerHTML = `
                <div class="card">
                    <header class="card-header">
                        <p class="card-header-title">
                            Sensor ID: ${sensor.id}
                        </p>
                    </header>
                    <div class="card-content">
                        <div class="content">
                            <p>
                                <strong>Tipo:</strong> ${sensor.type}
                            </p>
                            <p>
                               <strong>Valor:</strong> 
                               ${sensor.value} ${sensor.unit}
                            </p>
                        </div>
                        <time datetime="${sensor.updated_at}">
                            Última actualización: ${new Date(
                                sensor.update_at
                            ).toLocaleString()}
                        </time>
                    </div>
                    <footer class="card-footer">
                        <a href="#" class="card-footer-item update-button" data-id="${
                            sensor.id
                        }">Actualizar</a>
                    </footer>
                </div>
            `;
            container.appendChild(sensorCard);
        });

        const updateButtons = document.querySelectorAll(".update-button");
        updateButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                const sensorId = parseInt(button.getAttribute("data-id"));
                this.updateSensor(sensorId);
            });
        });
    }
}
const sensor = new Sensor(1, 'Temperature Sensor', 'temperature', 22.5, 'Celsius', new Date().toISOString());
const invalidSensor = new Sensor(2, 'Invalid Sensor', 'invalid_type', 22.5, 'Celsius', new Date().toISOString());

const monitor = new SensorManager();

monitor.loadSensors("sensors.json");
