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

export const INITIAL_DIABETES_FORM = Object.fromEntries(
  FIELD_KEYS.map((key) => [key, ""])
);

export const DIABETES_FIELDS = [
  {
    name: "Pregnancies",
    icon: UserRound,
    labelKey: "labelPregnancies",
    placeholderKey: "placeholderPregnancies",
    type: "number",
  },
  {
    name: "Glucose",
    icon: Droplets,
    labelKey: "labelGlucose",
    placeholderKey: "placeholderGlucose",
    type: "number",
  },
  {
    name: "BloodPressure",
    icon: Gauge,
    labelKey: "labelBloodPressure",
    placeholderKey: "placeholderBloodPressure",
    type: "number",
  },
  {
    name: "SkinThickness",
    icon: Activity,
    labelKey: "labelSkinThickness",
    placeholderKey: "placeholderSkinThickness",
    type: "number",
  },
  {
    name: "Insulin",
    icon: Syringe,
    labelKey: "labelInsulin",
    placeholderKey: "placeholderInsulin",
    type: "number",
  },
  {
    name: "BMI",
    icon: Scale,
    labelKey: "labelBMI",
    placeholderKey: "placeholderBMI",
    type: "number",
    step: "0.1",
  },
  {
    name: "DiabetesPedigreeFunction",
    icon: Dna,
    labelKey: "labelPedigree",
    placeholderKey: "placeholderPedigree",
    type: "number",
    step: "0.001",
  },
  {
    name: "Age",
    icon: Calendar,
    labelKey: "labelAge",
    placeholderKey: "placeholderAge",
    type: "number",
  },
];

export function buildDiabetesPayload(form) {
  return Object.fromEntries(
    FIELD_KEYS.map((key) => [key, Number(form[key])])
  );
}