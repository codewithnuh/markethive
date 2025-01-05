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
import { UploadButton } from "@/lib/uploadthing";
import { useToast } from "@/hooks/use-toast";
import { addProduct } from "@/lib/actions/product/actions";
import { Loader2 } from "lucide-react";
interface SubmitButtonProps {
  text: string;
  isLoading: boolean;
}

function SubmitButton({ text, isLoading }: SubmitButtonProps) {
  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Product...
        </>
      ) : (
        text
      )}
    </Button>
  );
}

export default function ProductCreationForm({
  type,
}: {
  type: "Create" | "Update";
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [productPictures, setProductPictures] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [attributes, setAttributes] = useState<
    { key: string; value: string }[]
  >([]);
  const defaultValues = {
    name: "",
    description: "",
    stock: 0,
    price: 0,
    attributes: [],
  };
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const onSubmit = async (data: ProductFormData) => {
    if (productPictures.length < 3) {
      setFileError("Please upload at least 3 images");
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please upload at least 3 images",
      });
      return;
    }

    setIsLoading(true);

    // Construct payload to match Prisma schema
    const payload = {
      name: data.name,
      description: data.description,
      images: productPictures,
      price: Number(data.price),
      stock: Number(data.stock),
      category: data.category,
      attributes: attributes,
    };

    try {
      let result;
      if (type === "Create") {
        result = await addProduct(JSON.parse(JSON.stringify(payload)));
      }
      console.log(JSON.parse(JSON.stringify(payload)));
      if (result!.success) {
        // Reset form state
        setValue("name", "");
        setValue("description", "");
        setValue("stock", 0);
        setValue("price", 0);
        setValue("attributes", []);
        setProductPictures([]);
        setAttributes([]);
        setFileError(null);

        toast({
          variant: "default",
          title: "Product Created",
          description: "Your product has been created successfully.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Product Creation Failed",
          description: result!.error,
        });
      }
    } catch (error) {
      console.error("Error in addProduct:", error);
      toast({
        variant: "destructive",
        title: "Product Creation Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
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

          <div className="space-y-2">
            <UploadButton
              className="ut-button:bg-secondary ut-button:w-full"
              endpoint="imageUploader"
              onClientUploadComplete={(files) => {
                if (files.length > 0) {
                  const uploadedUrls = files.map((file) => file.url);
                  setProductPictures((prev) => [...prev, ...uploadedUrls]);

                  if ([...productPictures, ...uploadedUrls].length >= 3) {
                    setFileError(null);
                  }

                  toast({
                    variant: "default",
                    title: "Images Uploaded",
                    description: "Your images have been uploaded successfully.",
                  });
                }
              }}
              onUploadError={(err) => {
                setFileError(err.message);
                toast({
                  variant: "destructive",
                  title: "Upload Error",
                  description: `Error: ${err.message}`,
                });
              }}
            />
            {fileError && (
              <p className="text-sm text-red-500 mt-1">{fileError}</p>
            )}
            {productPictures.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {productPictures.length} image(s) uploaded. Minimum 3 required.
              </p>
            )}
          </div>

          <CategoryField control={control} errors={errors} />
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

      <SubmitButton text="Create Product" isLoading={isLoading} />
    </form>
  );
}
