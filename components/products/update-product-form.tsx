"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { UploadButton } from "@/lib/uploadthing";
import { useToast } from "@/hooks/use-toast";
import { updateProduct } from "@/lib/actions/product/actions";
import { Loader2 } from "lucide-react";
import { DescriptionField } from "./product-creation/description-field";
import { AttributesField } from "./product-creation/attributes-field";
import { CategoryField } from "./product-creation/category-field";
import { NameField } from "./product-creation/name-field";
import { PriceField } from "./product-creation/price-field";
import { ProductFormData, productSchema } from "./product-creation/schema";
import { StockField } from "./product-creation/stock-field";

interface SubmitButtonProps {
  text: string;
  isLoading: boolean;
}

interface UpdateProductFormProps {
  product: Partial<{
    id: string;
    name: string;
    description: string;
    images: string[];
    price: number;
    stock: number;
    attributes: { key: string; value: string }[];
  }>;
}

function SubmitButton({ text, isLoading }: SubmitButtonProps) {
  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating Product...
        </>
      ) : (
        text
      )}
    </Button>
  );
}

export default function UpdateProductForm({ product }: UpdateProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [productPictures, setProductPictures] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [attributes, setAttributes] = useState<
    { key: string; value: string }[]
  >(product.attributes || []);

  const defaultValues = {
    name: product.name,
    description: product.description,
    stock: product.stock,
    price: product.price,
    attributes: product.attributes,
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
    setIsLoading(true);

    if (productPictures.length !== 3) {
      setFileError(
        "Please upload exactly 3 new images before updating the product."
      );
      setIsLoading(false);
      return;
    }
    const imagesToUse = productPictures;

    const payload = {
      id: product.id,
      name: data.name,
      description: data.description,
      images: imagesToUse,
      price: Number(data.price),
      stock: Number(data.stock),
      category: data.category,
      attributes: attributes,
    };

    try {
      const result = await updateProduct(JSON.parse(JSON.stringify(payload)));

      if (result.success) {
        toast({
          variant: "default",
          title: "Product Updated",
          description: "Your product has been updated successfully.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Product Update Failed",
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Error in updateProduct:", error);
      toast({
        variant: "destructive",
        title: "Product Update Error",
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
                if (files.length === 3) {
                  const uploadedUrls = files.map((file) => file.url);
                  setProductPictures(uploadedUrls);
                  setFileError(null);

                  toast({
                    variant: "default",
                    title: "Images Uploaded",
                    description:
                      "Your 3 new images have been uploaded successfully.",
                  });
                } else {
                  setFileError("Please upload exactly 3 images.");
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
            {productPictures.length === 3 && (
              <p className="text-sm text-green-500 mt-1">
                3 new images uploaded successfully.
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

      <SubmitButton text="Update Product" isLoading={isLoading} />
    </form>
  );
}
