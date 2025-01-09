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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Products List</h2>
        <Badge variant="outline" className="px-4 py-1">
          Admin View
        </Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">#{product.id}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>${product.price.toFixed(2)}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/admin/product/update/${product.id}`}>
                      Update
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
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
      <div className="container">
        <PaginationComponent
          pathName="admin"
          currentPage={page || 1}
          totalPages={pageSize || 12}
        />
      </div>

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
