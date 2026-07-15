import { UploadSingleFileHandler } from './handlers/upload-single-file.handler';
import { UploadMultipleFilesHandler } from './handlers/upload-multiple-files.handler';

export const UploadCommandHandlers = [
  UploadSingleFileHandler,
  UploadMultipleFilesHandler,
];
