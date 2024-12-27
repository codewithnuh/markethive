import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { ProductFormData, ApiResponse } from "./schema";

interface DescriptionFieldProps {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  watch: UseFormWatch<ProductFormData>;
}

export function DescriptionField({
  register,
  errors,
  setValue,
  watch,
}: DescriptionFieldProps) {
  const [isDescriptionLoading, setIsDescriptionLoading] = useState(false);
  const description = watch("description");

  const handleEnhanceDescription = async (): Promise<void> => {
    if (!description || isDescriptionLoading) return;

    setIsDescriptionLoading(true);
    try {
      const response = await fetch("/api/enhance-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: description }),
      });

      if (!response.ok) throw new Error("Failed to enhance description");

      const data = (await response.json()) as ApiResponse;
      if (typeof data.text === "string") {
        setValue("description", data.text, { shouldValidate: true });
      }
    } catch (error) {
      console.error(
        "Error enhancing description:",
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setIsDescriptionLoading(false);
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="description">Description</Label>
      <Textarea id="description" {...register("description")} />
      {errors.description && (
        <p className="text-sm text-red-500">{errors.description.message}</p>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={handleEnhanceDescription}
        disabled={!description || isDescriptionLoading}
      >
        {isDescriptionLoading ? "Enhancing..." : "Enhance Description with AI"}
      </Button>
    </div>
  );
}
