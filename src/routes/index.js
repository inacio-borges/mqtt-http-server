import express from "express";
import {
  getPlantData,
  getInverterStatus,
} from "../api/controllers/plantController.js";

const router = express.Router();

router.get("/plant", getPlantData);
router.get("/status", getInverterStatus);

export default router;
