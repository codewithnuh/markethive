import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ImageUploadProps {
  onChange: (file: File | null) => void;
  value: File | null;
}

export default function ImageUpload({ onChange, value }: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        onChange(acceptedFiles[0]);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
  });

  return (
    <div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div
            {...getRootProps()}
            className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400"
          >
            <input {...getInputProps()} />
            {value ? (
              <div className="relative h-40 w-40">
                <Image
                  src={URL.createObjectURL(value)}
                  alt="Uploaded product image"
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-lg"
                />
              </div>
            ) : isDragActive ? (
              <p>Drop the image here ...</p>
            ) : (
              <p>Drag & drop an image here, or click to select one</p>
            )}
          </div>
          {value && (
            <Button
              variant="outline"
              onClick={() => onChange(null)}
              className="mt-4"
              type="button"
            >
              Remove Image
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
