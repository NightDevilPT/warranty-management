export interface UploadedFile {
  key: string;
  url: string;
  publicUrl: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface SingleFileUploadResponse {
  file: UploadedFile;
}

export interface MultipleFilesUploadResponse {
  files: UploadedFile[];
  count: number;
}

export interface UploadOptions {
  folder?: string;
}
