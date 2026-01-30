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
import Image from "next/image";
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
         <div className="md:col-span-1 space-y-4">
            <h2 className="text-2xl font-bold">General Information</h2>
            <p className="text-muted-foreground text-sm">Provide basic details about your product.</p>
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
            <p className="text-muted-foreground text-sm">Upload at least 3 high-quality images.</p>
         </div>
         <div className="md:col-span-2">
            <Card className="rounded-[2rem] border-none shadow-none bg-secondary/20 p-8">
              <CardContent className="p-0 space-y-6">
                <div className="flex flex-wrap gap-4">
                   {productPictures.map((url, i) => (
                     <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden bg-background">
                        <Image src={url} alt="upload" fill className="object-cover" />
                     </div>
                   ))}
                </div>
                <UploadButton
                  className="ut-button:bg-blue-600 ut-button:rounded-full ut-button:h-12 ut-button:w-full ut-label:text-muted-foreground"
                  endpoint="imageUploader"
                  onClientUploadComplete={(files) => {
                    if (files.length > 0) {
                      const uploadedUrls = files.map((file) => file.url);
                      setProductPictures((prev) => [...prev, ...uploadedUrls]);
                      if ([...productPictures, ...uploadedUrls].length >= 3) setFileError(null);
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
            <p className="text-muted-foreground text-sm">Set the price and current stock levels.</p>
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
            <p className="text-muted-foreground text-sm">Add technical details or attributes.</p>
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
           <SubmitButton text="Create Product" isLoading={isLoading} />
        </div>
      </div>
    </form>
  );
}
