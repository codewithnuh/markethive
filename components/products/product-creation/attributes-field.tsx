import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FieldErrors, UseFormSetValue } from "react-hook-form";
import { ProductFormData } from "./schema";

interface AttributesFieldProps {
  attributes: { key: string; value: string }[];
  setAttributes: React.Dispatch<
    React.SetStateAction<{ key: string; value: string }[]>
  >;
  setValue: UseFormSetValue<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

export function AttributesField({
  attributes,
  setAttributes,
  setValue,
  errors,
}: AttributesFieldProps) {
  const [newAttributeKey, setNewAttributeKey] = useState("");
  const [newAttributeValue, setNewAttributeValue] = useState("");

  const addAttribute = () => {
    if (newAttributeKey && newAttributeValue) {
      const updatedAttributes = [
        ...attributes,
        { key: newAttributeKey, value: newAttributeValue },
      ];
      setAttributes(updatedAttributes);
      setValue("attributes", updatedAttributes);
      setNewAttributeKey("");
      setNewAttributeValue("");
    }
  };

  const removeAttribute = (index: number) => {
    const updatedAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(updatedAttributes);
    setValue("attributes", updatedAttributes);
  };

  return (
    <div className="grid gap-2">
      <Label>Attributes</Label>
      <div className="flex gap-2">
        <Input
          placeholder="Key"
          value={newAttributeKey}
          onChange={(e) => setNewAttributeKey(e.target.value)}
        />
        <Input
          placeholder="Value"
          value={newAttributeValue}
          onChange={(e) => setNewAttributeValue(e.target.value)}
        />
        <Button type="button" onClick={addAttribute}>
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {attributes.map((attr, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="flex-grow">
              {attr.key}: {attr.value}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeAttribute(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      {errors.attributes && (
        <p className="text-sm text-red-500">{errors.attributes.message}</p>
      )}
    </div>
  );
}
