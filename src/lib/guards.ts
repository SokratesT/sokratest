/**
 * Type guard to check if a File object has a preview property.
 *
 * @param {File} file - The file object to check.
 * @return {boolean} True if the file has a valid preview string property.
 */
export const isFileWithPreview = (
  file: File,
): file is File & { preview: string } => {
  return "preview" in file && typeof file.preview === "string";
};
