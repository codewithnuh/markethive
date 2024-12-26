import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface AttributeInputProps {
  attributes: string[];
  setAttributes: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function AttributeInput({
  attributes,
  setAttributes,
}: AttributeInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addAttribute();
    }
  };

  const addAttribute = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !attributes.includes(trimmedValue)) {
      setAttributes([...attributes, trimmedValue]);
      setInputValue("");
    }
  };

  const removeAttribute = (attribute: string) => {
    setAttributes(attributes.filter((a) => a !== attribute));
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder="Enter attribute and press Enter or comma"
        />
        <Button onClick={addAttribute} type="button">
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {attributes.map((attribute) => (
          <Badge key={attribute} variant="secondary">
            {attribute}
            <Button
              variant="ghost"
              size="sm"
              className="ml-1 h-auto p-0 text-muted-foreground"
              onClick={() => removeAttribute(attribute)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
