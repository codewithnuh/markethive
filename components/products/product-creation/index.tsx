"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { productSchema, ProductFormData } from "./schema";
import { NameField } from "./name-field";
import { DescriptionField } from "./description-field";
import { AttributesField } from "./attributes-field";
import { CategoryField } from "./category-field";
import { PriceField } from "./price-field";
import { StockField } from "./stock-field";
import { UploadButton } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function ProductCreationForm() {
  const { toast } = useToast();
  const [productPictures, setProductPictures] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<
    { key: string; value: string }[]
  >([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      stock: 0,
      price: 0,
      attributes: [],
    },
  });

  const onSubmit = (data: ProductFormData): void => {
    console.log({ images: productPictures });
    console.log("Form data:", { ...data, attributes });
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardContent className="grid gap-6 pt-6">
          <NameField
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
          />
          <DescriptionField
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
          />
          <UploadButton
            className="ut-button:bg-primary ut-button:w-full"
            endpoint="imageUploader"
            onClientUploadComplete={(files) => {
              if (files.length > 0) {
                // Extract URLs from the uploaded files
                const uploadedUrls = files.map((file) => file.url);

                // Update state with the new URLs
                setProductPictures((prev) => [...prev, ...uploadedUrls]);

                // Show a success toast
                toast({
                  variant: "default",
                  title: "Images Uploaded",
                  description: "Your images have been uploaded successfully.",
                });
              }
            }}
            onUploadError={(err) => {
              // Show an error toast if upload fails
              toast({
                variant: "destructive",
                title: "Upload Error",
                description: `Error: ${err.message}`,
              });
            }}
          />

          <CategoryField control={control} errors={errors} />
          {/* <ImageUploadField control={control} /> */}
          <StockField register={register} errors={errors} />
          <PriceField register={register} errors={errors} />
          <AttributesField
            attributes={attributes}
            setAttributes={setAttributes}
            setValue={setValue}
            errors={errors}
          />
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        Create Product
      </Button>
    </form>
  );
}
