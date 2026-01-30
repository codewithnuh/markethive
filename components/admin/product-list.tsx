"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  deleteProduct,
  PaginatedResponse,
  TransformedProduct,
} from "@/lib/actions/product/actions";
import Link from "next/link";
import PaginationComponent from "../products/pagination";

export function ProductsList({
  allProducts,
  page,
  pageSize,
}: {
  allProducts: PaginatedResponse;
  page?: number;
  pageSize?: number;
}) {
  const [products, setProducts] = useState(
    allProducts.data?.products && allProducts.data.products.length != 0
      ? allProducts.data?.products
      : []
  );
  const [selectedProduct, setSelectedProduct] =
    useState<TransformedProduct | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleDelete = (product: TransformedProduct) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    setIsUpdating(true);
    try {
      const result = await deleteProduct(selectedProduct.id);

      if (result.success) {
        setProducts(products.filter((p) => p.id !== selectedProduct.id));
        toast({
          title: "Product Deleted",
          description: `Product ${selectedProduct.name} has been deleted.`,
          duration: 3000,
        });
      } else {
        throw new Error(result.error);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setShowDeleteDialog(false);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-sm text-muted-foreground">Manage your catalog of items.</p>
        </div>
        <Button asChild className="rounded-full bg-blue-600 hover:bg-blue-700 font-bold">
           <Link href="/admin/product/create">Add Product</Link>
        </Button>
      </div>

      <div className="rounded-[1.5rem] bg-background/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent bg-secondary/30">
              <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4">ID</TableHead>
              <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4">Name</TableHead>
              <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4">Price</TableHead>
              <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4 text-center">Stock</TableHead>
              <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="border-b border-border/50 transition-colors hover:bg-secondary/10">
                <TableCell className="font-mono text-[10px] text-muted-foreground py-4">
                  #{product.id.slice(-8).toUpperCase()}
                </TableCell>
                <TableCell className="font-bold py-4">{product.name}</TableCell>
                <TableCell className="py-4 font-semibold">${product.price.toFixed(2)}</TableCell>
                <TableCell className="py-4 text-center">
                   <Badge variant={product.stock > 0 ? "secondary" : "destructive"} className="rounded-full font-bold">
                    {product.stock}
                   </Badge>
                </TableCell>
                <TableCell className="py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-blue-500/10 hover:text-blue-600">
                      <Link href={`/admin/product/update/${product.id}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-red-500/10 hover:text-red-600"
                      onClick={() => handleDelete(product)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationComponent
        pathName="admin"
        currentPage={page || 1}
        totalPages={pageSize || 12}
      />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the product{" "}
              {selectedProduct?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isUpdating}
              className="gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Confirm Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
