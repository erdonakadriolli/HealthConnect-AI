import {
  Activity,
  Calendar,
  Dna,
  Droplets,
  Gauge,
  Scale,
  Syringe,
  UserRound,
} from "lucide-react";

export const FIELD_KEYS = [
  "Pregnancies",
  "Glucose",
  "BloodPressure",
  "SkinThickness",
  "Insulin",
  "BMI",
  "DiabetesPedigreeFunction",
  "Age",
];

export const NORMAL_RANGES = {
  Pregnancies: { min: 0, max: 6, unit: "" },
  Glucose: { min: 70, max: 140, unit: "mg/dL" },
  BloodPressure: { min: 60, max: 90, unit: "mmHg" },
  SkinThickness: { min: 10, max: 50, unit: "mm" },
  Insulin: { min: 16, max: 166, unit: "µU/mL" },
  BMI: { min: 18.5, max: 30, unit: "kg/m²" },
  DiabetesPedigreeFunction: { min: 0.08, max: 1.2, unit: "" },
  Age: { min: 18, max: 80, unit: "" },
};

export const FIELD_DB_KEYS = {
  Pregnancies: "pregnancies",
  Glucose: "glucose",
  BloodPressure: "blood_pressure",
  SkinThickness: "skin_thickness",
  Insulin: "insulin",
  BMI: "bmi",
  DiabetesPedigreeFunction: "diabetes_pedigree_function",
  Age: "age",
};

export const FIELD_ICONS = {
  Pregnancies: UserRound,
  Glucose: Droplets,
  BloodPressure: Gauge,
  SkinThickness: Activity,
  Insulin: Syringe,
  BMI: Scale,
  DiabetesPedigreeFunction: Dna,
  Age: Calendar,
};