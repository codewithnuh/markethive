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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import Image from "next/image";

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
  const [openAlertIndex, setOpenAlertIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const [productPictures, setProductPictures] = useState<string[]>(
    product.images || []
  );
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

    // Ensure there are at least 3 images
    if (productPictures.length < 3) {
      setFileError("Please ensure at least 3 images are uploaded.");
      setIsLoading(false);
      return;
    }

    const payload = {
      id: product.id,
      name: data.name,
      description: data.description,
      images: productPictures,
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

          {/* Uploaded images section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Uploaded Images</h3>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {productPictures.map((url, index) => (
                <div key={index} className="relative group aspect-square">
                  <Image
                    fill
                    src={url || "/placeholder.svg"}
                    alt={`Product ${index + 1}`}
                    className="rounded-lg border border-border w-full h-full object-cover transition-all duration-300 group-hover:opacity-75 dark:border-gray-700"
                  />
                  <AlertDialog
                    open={openAlertIndex === index}
                    onOpenChange={(isOpen) =>
                      setOpenAlertIndex(isOpen ? index : null)
                    }
                  >
                    <AlertDialogTitle className="sr-only">
                      Update Product Images
                    </AlertDialogTitle>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        aria-label={`Delete image ${index + 1}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-background border border-border">
                      <AlertDialogHeader>
                        <h3 className="text-lg font-semibold">Delete Image</h3>
                        <p className="text-muted-foreground">
                          Are you sure you want to delete this image? This
                          action cannot be undone.
                        </p>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setProductPictures((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                            setOpenAlertIndex(null);
                            toast({
                              variant: "default",
                              title: "Image Removed",
                              description: `Image ${
                                index + 1
                              } has been removed.`,
                            });
                          }}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setOpenAlertIndex(null)}
                        >
                          Cancel
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </div>

          {/* Upload new images */}
          <UploadButton
            className="ut-button:bg-secondary ut-button:w-full"
            endpoint="imageUploader"
            onClientUploadComplete={(files) => {
              if (files.length > 0) {
                const uploadedUrls = files.map((file) => file.url);
                setProductPictures((prev) => [...prev, ...uploadedUrls]);

                toast({
                  variant: "default",
                  title: "Images Uploaded",
                  description:
                    "Your new images have been uploaded successfully.",
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
