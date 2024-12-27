import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { ProductFormData, ApiResponse } from "./schema";

interface NameFieldProps {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  watch: UseFormWatch<ProductFormData>;
}

export function NameField({
  register,
  errors,
  setValue,
  watch,
}: NameFieldProps) {
  const [isTitleLoading, setIsTitleLoading] = useState(false);
  const name = watch("name");

  const handleOptimizeTitle = async (): Promise<void> => {
    if (!name || isTitleLoading) return;

    setIsTitleLoading(true);
    try {
      const response = await fetch("/api/optimize-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: name }),
      });

      if (!response.ok) throw new Error("Failed to optimize title");

      const data = (await response.json()) as ApiResponse;
      if (typeof data.text === "string") {
        setValue("name", data.text, { shouldValidate: true });
      }
    } catch (error) {
      console.error(
        "Error optimizing title:",
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setIsTitleLoading(false);
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="name">Product Name</Label>
      <Input id="name" {...register("name")} />
      {errors.name && (
        <p className="text-sm text-red-500">{errors.name.message}</p>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={handleOptimizeTitle}
        disabled={!name || isTitleLoading}
      >
        {isTitleLoading ? "Optimizing..." : "Optimize Title with AI"}
      </Button>
    </div>
  );
}
