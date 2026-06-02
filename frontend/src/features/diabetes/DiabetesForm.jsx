import { Activity, Loader2 } from "lucide-react";

import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import FormGrid from "../../components/ui/FormGrid";

import { DIABETES_FIELDS } from "./diabetesFields";

export default function DiabetesForm({
  t,
  form,
  loading,
  disabled,
  onChange,
  onSubmit,
}) {
  return (
    <FormGrid onSubmit={onSubmit}>
      {DIABETES_FIELDS.map((field) => {
        const Icon = field.icon;

        return (
          <InputField
            key={field.name}
            variant="green"
            type={field.type || "text"}
            icon={<Icon size={18} />}
            label={t[field.labelKey]}
            name={field.name}
            value={form[field.name]}
            onChange={onChange}
            placeholder={t[field.placeholderKey]}
            step={field.step}
          />
        );
      })}

      <Button type="submit" variant="green" fullWidth disabled={loading || disabled}>
        {loading ? (
          <>
            <Loader2 size={18} />
            {t.btnPredicting}
          </>
        ) : (
          <>
            <Activity size={18} />
            {t.btnPredict}
          </>
        )}
      </Button>
    </FormGrid>
  );
}