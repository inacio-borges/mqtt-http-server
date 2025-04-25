import PlantService from "../services/plantService.js";

export const getPlantData = async (req, res) => {
  try {
    const plantData = await PlantService.getLatestPlantData();
    res.status(200).json(plantData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch plant data" });
  }
};

export const getInverterStatus = async (req, res) => {
  try {
    const inverters = PlantService.getAllInverters();
    res.status(200).json(inverters);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inverters" });
  }
};
