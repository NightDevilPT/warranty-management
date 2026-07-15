"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  FileIcon,
  Loader2,
  Image as ImageIcon,
  FileText,
  AlertCircle,
  Plus,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

export interface UploadedFileInfo {
  key: string;
  url: string;
  publicUrl: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface FileUploadProps {
  onUpload: (file: File) => Promise<UploadedFileInfo | null>;
  onRemove?: (file: UploadedFileInfo) => void;
  value?: UploadedFileInfo | null;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
  buttonText?: string;
  variant?: "dropzone" | "button";
  dropzoneText?: string;
  dropzoneSubText?: string;
  supportedFormats?: string;
  showSizeHint?: boolean;
  multiple?: false;
}

export interface MultiFileUploadProps {
  onUpload: (file: File) => Promise<UploadedFileInfo | null>;
  onRemove?: (file: UploadedFileInfo) => void;
  value?: UploadedFileInfo[];
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  buttonText?: string;
  variant?: "dropzone" | "button";
  dropzoneText?: string;
  dropzoneSubText?: string;
  supportedFormats?: string;
  showSizeHint?: boolean;
  multiple: true;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="h-10 w-10 text-blue-500" />;
  }
  if (mimeType.includes("pdf")) {
    return <FileText className="h-10 w-10 text-red-500" />;
  }
  if (mimeType.includes("word") || mimeType.includes("document")) {
    return <FileText className="h-10 w-10 text-blue-600" />;
  }
  return <FileIcon className="h-10 w-10 text-muted-foreground" />;
}

export function FileUpload(props: FileUploadProps | MultiFileUploadProps) {
  if (props.multiple) {
    return <MultiFileUpload {...props} />;
  }
  return <SingleFileUpload {...props} />;
}

function SingleFileUpload({
  onUpload,
  onRemove,
  value,
  accept = "image/*,.pdf,.doc,.docx",
  maxSize = 10 * 1024 * 1024,
  disabled = false,
  className,
  buttonText = "Upload File",
  variant = "dropzone",
  dropzoneText = "Drag & drop or click to upload",
  dropzoneSubText,
  supportedFormats,
  showSizeHint = true,
}: FileUploadProps) {
  const [file, setFile] = useState<UploadedFileInfo | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const isImage = file?.mimeType?.startsWith("image/");

  const getMaxSizeFormatted = (): string => {
    return maxSize >= 1024 * 1024
      ? `${maxSize / (1024 * 1024)} MB`
      : `${maxSize / 1024} KB`;
  };

  const getDefaultSubText = (): string => {
    if (dropzoneSubText) return dropzoneSubText;
    const formats = supportedFormats || "Images, PDF, DOC";
    return `${formats}${showSizeHint ? ` • Max ${getMaxSizeFormatted()}` : ""}`;
  };

  const handleFile = useCallback(
    async (selectedFile: File) => {
      setError(null);

      if (selectedFile.size > maxSize) {
        setError(`File size exceeds ${getMaxSizeFormatted()} limit`);
        return;
      }

      setUploading(true);
      try {
        const uploaded = await onUpload(selectedFile);
        if (uploaded) {
          setFile(uploaded);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload file");
      } finally {
        setUploading(false);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    },
    [onUpload, maxSize],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;
      await handleFile(selectedFile);
    },
    [handleFile],
  );

  const handleRemove = useCallback(() => {
    if (file && onRemove) {
      onRemove(file);
    }
    setFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [file, onRemove]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      dropzoneRef.current &&
      !dropzoneRef.current.contains(e.relatedTarget as Node)
    ) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files?.[0];
      if (!droppedFile) return;
      await handleFile(droppedFile);
    },
    [handleFile],
  );

  if (file) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="relative rounded-lg border bg-card">
          {isImage ? (
            <div className="relative rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-black/5 backdrop-blur-[2px]" />
              <img
                src={file.publicUrl || file.url}
                alt={file.originalName}
                className="h-48 w-full object-contain bg-muted/30"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/90 hover:bg-background shadow-sm backdrop-blur-sm"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4">
              <div className="shrink-0 p-2 rounded-lg bg-muted">
                {getFileTypeIcon(file.mimeType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {file.originalName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="h-8 w-8 shrink-0"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "button") {
    return (
      <div className={cn("space-y-2", className)}>
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className="flex items-center gap-2"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Uploading..." : buttonText}
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || uploading}
        />

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        ref={dropzoneRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          disabled &&
            "opacity-50 cursor-not-allowed hover:border-muted-foreground/25 hover:bg-transparent",
          uploading && "pointer-events-none",
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              Uploading...
            </p>
          </>
        ) : (
          <>
            <div className="rounded-full bg-muted p-3">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{dropzoneText}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {getDefaultSubText()}
              </p>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function MultiFileUpload({
  onUpload,
  onRemove,
  value = [],
  accept = "image/*,.pdf,.doc,.docx",
  maxSize = 10 * 1024 * 1024,
  maxFiles = 5,
  disabled = false,
  className,
  buttonText = "Upload Files",
  variant = "dropzone",
  dropzoneText = "Drag & drop or click to upload",
  dropzoneSubText,
  supportedFormats,
  showSizeHint = true,
}: MultiFileUploadProps) {
  const [files, setFiles] = useState<UploadedFileInfo[]>(value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const canAddMore = files.length < maxFiles;

  const getMaxSizeFormatted = (): string => {
    return maxSize >= 1024 * 1024
      ? `${maxSize / (1024 * 1024)} MB`
      : `${maxSize / 1024} KB`;
  };

  const getDefaultSubText = (): string => {
    if (dropzoneSubText) return dropzoneSubText;
    const formats = supportedFormats || "Images, PDF, DOC";
    return `${formats}${showSizeHint ? ` • Max ${getMaxSizeFormatted()} each` : ""}${maxFiles > 0 ? ` • Up to ${maxFiles} files` : ""}`;
  };

  const handleFiles = useCallback(
    async (selectedFiles: FileList) => {
      setError(null);

      const remaining = maxFiles - files.length;
      if (remaining <= 0) {
        setError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const filesToUpload = Array.from(selectedFiles).slice(0, remaining);

      for (const file of filesToUpload) {
        if (file.size > maxSize) {
          setError(`${file.name} exceeds ${getMaxSizeFormatted()} limit`);
          return;
        }
      }

      setUploading(true);
      try {
        const uploadedFiles: UploadedFileInfo[] = [];

        for (const file of filesToUpload) {
          const uploaded = await onUpload(file);
          if (uploaded) {
            uploadedFiles.push(uploaded);
          }
        }

        if (uploadedFiles.length > 0) {
          setFiles((prev) => [...prev, ...uploadedFiles]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload files");
      } finally {
        setUploading(false);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    },
    [onUpload, maxSize, maxFiles, files.length],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (!selectedFiles || selectedFiles.length === 0) return;
      await handleFiles(selectedFiles);
    },
    [handleFiles],
  );

  const handleRemove = useCallback(
    (fileToRemove: UploadedFileInfo) => {
      setFiles((prev) => prev.filter((f) => f.key !== fileToRemove.key));
      onRemove?.(fileToRemove);
      setError(null);
    },
    [onRemove],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      dropzoneRef.current &&
      !dropzoneRef.current.contains(e.relatedTarget as Node)
    ) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = e.dataTransfer.files;
      if (!droppedFiles || droppedFiles.length === 0) return;
      await handleFiles(droppedFiles);
    },
    [handleFiles],
  );

  return (
    <div className={cn("space-y-3", className)}>
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => {
            const isImage = file.mimeType?.startsWith("image/");
            return (
              <div
                key={file.key || index}
                className="relative rounded-lg border bg-card"
              >
                {isImage ? (
                  <div className="flex items-center gap-4 p-3">
                    <img
                      src={file.publicUrl || file.url}
                      alt={file.originalName}
                      className="h-16 w-16 object-cover rounded-md bg-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(file)}
                      className="h-8 w-8 shrink-0"
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-3">
                    <div className="shrink-0 p-2 rounded-lg bg-muted">
                      {getFileTypeIcon(file.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(file)}
                      className="h-8 w-8 shrink-0"
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {canAddMore && (
        <>
          {variant === "button" ? (
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                disabled={disabled || uploading}
                className="flex items-center gap-2"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {uploading
                  ? "Uploading..."
                  : files.length === 0
                    ? buttonText
                    : "Add More Files"}
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled || uploading}
              />
            </div>
          ) : (
            <div
              ref={dropzoneRef}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                disabled &&
                  "opacity-50 cursor-not-allowed hover:border-muted-foreground/25 hover:bg-transparent",
                uploading && "pointer-events-none",
              )}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Uploading...
                  </p>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-muted p-3">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {files.length === 0 ? dropzoneText : "Add more files"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getDefaultSubText()}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || uploading}
          />
        </>
      )}

      {files.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {files.length} of {maxFiles} files uploaded
        </p>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
