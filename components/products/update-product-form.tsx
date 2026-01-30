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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
         <div className="md:col-span-1 space-y-4">
            <h2 className="text-2xl font-bold">General Information</h2>
            <p className="text-muted-foreground text-sm">Update the core details of your product.</p>
         </div>
         <div className="md:col-span-2">
            <Card className="rounded-[2rem] border-none shadow-none bg-secondary/20 p-8">
              <CardContent className="p-0 grid gap-8">
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
                <CategoryField control={control} errors={errors} />
              </CardContent>
            </Card>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t pt-12">
         <div className="md:col-span-1 space-y-4">
            <h2 className="text-2xl font-bold">Media</h2>
            <p className="text-muted-foreground text-sm">Manage product images. At least 3 required.</p>
         </div>
         <div className="md:col-span-2">
            <Card className="rounded-[2rem] border-none shadow-none bg-secondary/20 p-8">
              <CardContent className="p-0 space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {productPictures.map((url, index) => (
                    <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden bg-background">
                      <Image
                        fill
                        src={url || "/placeholder.svg"}
                        alt={`Product ${index + 1}`}
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <button
                        type="button"
                        onClick={() => {
                           setProductPictures((prev) => prev.filter((_, i) => i !== index));
                           toast({ title: "Image removed" });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
                <UploadButton
                  className="ut-button:bg-blue-600 ut-button:rounded-full ut-button:h-12 ut-button:w-full"
                  endpoint="imageUploader"
                  onClientUploadComplete={(files) => {
                    if (files.length > 0) {
                      const uploadedUrls = files.map((file) => file.url);
                      setProductPictures((prev) => [...prev, ...uploadedUrls]);
                      toast({ title: "Images Uploaded" });
                    }
                  }}
                  onUploadError={(err) => setFileError(err.message)}
                />
                {fileError && <p className="text-sm text-red-500 font-medium">{fileError}</p>}
              </CardContent>
            </Card>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t pt-12">
         <div className="md:col-span-1 space-y-4">
            <h2 className="text-2xl font-bold">Pricing & Inventory</h2>
            <p className="text-muted-foreground text-sm">Adjust pricing and stock availability.</p>
         </div>
         <div className="md:col-span-2">
            <Card className="rounded-[2rem] border-none shadow-none bg-secondary/20 p-8">
              <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <PriceField register={register} errors={errors} />
                <StockField register={register} errors={errors} />
              </CardContent>
            </Card>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t pt-12">
         <div className="md:col-span-1 space-y-4">
            <h2 className="text-2xl font-bold">Specifications</h2>
            <p className="text-muted-foreground text-sm">Update technical attributes.</p>
         </div>
         <div className="md:col-span-2">
            <Card className="rounded-[2rem] border-none shadow-none bg-secondary/20 p-8">
              <CardContent className="p-0">
                <AttributesField
                  attributes={attributes}
                  setAttributes={setAttributes}
                  setValue={setValue}
                  errors={errors}
                />
              </CardContent>
            </Card>
         </div>
      </div>

      <div className="pt-12 flex justify-end border-t">
        <div className="w-full md:w-1/3">
           <SubmitButton text="Update Product" isLoading={isLoading} />
        </div>
      </div>
    </form>
  );
}
