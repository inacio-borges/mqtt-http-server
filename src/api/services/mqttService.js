import mqtt from "mqtt";
import PlantService from "./plantService.js";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_INSTANCE =
  process.env.INSTANCE_NAME + "/" + process.env.INSTANCE_UID;
const TOPIC_SIGN_OF_LIFE = process.env.TOPIC_SIGN_OF_LIFE;
const TOPIC_SENSORS =
  process.env.CLIENT_NAME + "/" + CLIENT_INSTANCE + "/sensors";
const TOPIC_INVERTERS =
  process.env.CLIENT_NAME + "/" + CLIENT_INSTANCE + "/inverters";
const TOPIC_MOTORS =
  process.env.CLIENT_NAME + "/" + CLIENT_INSTANCE + "/motors";

const MQTT_TOPICS = [
  TOPIC_SIGN_OF_LIFE,
  TOPIC_SENSORS,
  TOPIC_INVERTERS,
  TOPIC_MOTORS,
];

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || "mqtt://broker.emqx.io";

const client = mqtt.connect(MQTT_BROKER_URL);

let isServiceRunningLogged = false;

client.on("connect", () => {
  client.subscribe(MQTT_TOPICS);
  isServiceRunningLogged = false; // Reset flag on reconnect
});

client.on("reconnect", () => {
  isServiceRunningLogged = false; // Reset flag on reconnect
});

client.on("close", () => {});

client.on("offline", () => {
  isServiceRunningLogged = false; // Reset flag when offline
});

client.on("error", (error) => {});

client.on("message", async (topic, message) => {
  if (!isServiceRunningLogged) {
    isServiceRunningLogged = true; // Log only once until the next reconnect or offline event
  }

  try {
    const data = JSON.parse(message.toString());

    if (topic === TOPIC_SIGN_OF_LIFE) {
      // Logic to handle plant alive signal
    } else if (topic == TOPIC_SENSORS) {
      if (!data.s || !data.id) {
        return;
      }
      const newSensorData = {
        id: data.id,
        current_r: data.s.cR,
        current_s: data.s.cS,
        current_t: data.s.cT,
        voltage_r: data.s.vR,
        voltage_s: data.s.vS,
        voltage_t: data.s.vT,
        dIn: data.s.dIn,
        dOut: data.s.dOut,
      };
      await PlantService.handleMqttMessage(topic, {
        s: newSensorData,
        id: data.id,
      });
      // Atualiza imediatamente após mensagem
      await PlantService.savePlantData();
    } else if (topic === TOPIC_INVERTERS) {
      if (!data.i || !data.id) {
        return;
      }
      let newInverterData;

      if (data.i.m === "fc302" || data.i.m === "fc202") {
        newInverterData = {
          id: data.id,
          address: data.i.ad,
          model: data.i.m,
          frequency: parseFloat(data.i.f / 10),
          voltage: parseFloat(data.i.v / 10),
          DcVoltage: data.i.dc,
          power: parseFloat(data.i.p / 100),
          rpm: data.i.rpm,
          temperature: data.i.t,
          current: parseFloat(data.i.c / 100),
          status: data.i.st,
          faultLog: data.i.flt,
        };
      } else {
        newInverterData = {
          id: data.id,
          address: data.i.ad,
          model: data.i.m,
          frequency: data.i.f / 10,
          voltage: data.i.v,
          DcVoltage: data.i.dc,
          power: data.i.p,
          rpm: data.i.rpm,
          temperature: data.i.t,
          current: data.i.c,
          status: data.i.st,
          faultLog: data.i.flt,
        };
      }
      await PlantService.handleMqttMessage(topic, {
        i: newInverterData,
        id: data.id,
      });
      // Atualiza imediatamente após mensagem
      await PlantService.savePlantData();
    } else if (topic === TOPIC_MOTORS) {
      if (!data.m || !data.id) {
        return;
      }
      const newMotorData = {
        id: data.id,
        address: data.m.ad, // Garante que address está presente
        name: data.m.n,
        temperature: data.m.t,
        vibration_x: data.m.vX,
        vibration_y: data.m.vY,
        vibration_z: data.m.vZ,
        displacement_x: data.m.dX,
        displacement_y: data.m.dY,
        displacement_z: data.m.dZ,
      };
      await PlantService.handleMqttMessage(topic, {
        m: newMotorData,
        id: data.id,
      });
      // Atualiza imediatamente após mensagem
      await PlantService.savePlantData();
    }
  } catch (error) {}
});

export default client;
