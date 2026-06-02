import { FileImage, Loader2, Upload } from "lucide-react";

import Button from "../../components/ui/Button";
import { diabetesStyles as styles } from "./diabetesStyles";

export default function DiabetesOCRUpload({
  t,
  fileInputRef,
  uploading,
  uploadName,
  extractedKeys,
  onFileChange,
  onSelectFile,
}) {
  return (
    <div style={styles.uploadBox}>
      <div style={styles.uploadTitle}>
        <FileImage size={18} />
        {t.ocrTitle}
      </div>

      <div style={styles.uploadDescription}>{t.ocrDesc}</div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/tiff,application/pdf"
        onChange={onFileChange}
        style={{ display: "none" }}
      />

      <div style={styles.uploadActions}>
        <Button
          type="button"
          variant="green"
          disabled={uploading}
          onClick={onSelectFile}
        >
          {uploading ? <Loader2 size={16} /> : <Upload size={16} />}
          {uploading ? t.ocrBtnReading : t.ocrBtnSelect}
        </Button>

        {uploadName && !uploading && (
          <span style={styles.uploadName}>
            {uploadName}

            {extractedKeys.length > 0 && (
              <strong style={styles.successText}>
                ({extractedKeys.length} {t.fieldsFilled})
              </strong>
            )}
          </span>
        )}
      </div>
    </div>
  );
}