"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SlidersHorizontal } from "lucide-react";
import Image from "next/image";
// Mock data for demonstration
const products = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: Math.floor(Math.random() * 200) + 50,
  category: ["Electronics", "Clothing", "Books", "Home & Garden"][
    Math.floor(Math.random() * 4)
  ],
  image: `/placeholder.svg?height=200&width=200&text=Product+${i + 1}`,
}));

const categories = ["Electronics", "Clothing", "Books", "Home & Garden"];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 250]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");

  const filteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        product.price >= priceRange[0] &&
        product.price <= priceRange[1] &&
        (selectedCategories.length === 0 ||
          selectedCategories.includes(product.category))
    )
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return a.name.localeCompare(b.name);
    });

  const productsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Our Products</h1>

      {/* Mobile filter button and search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Products</SheetTitle>
              <SheetDescription>
                Adjust filters to refine your product search.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Price Range</h3>
                <Slider
                  min={0}
                  max={250}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Categories</h3>
                {categories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center space-x-2 mb-2"
                  >
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => {
                        setSelectedCategories(
                          checked
                            ? [...selectedCategories, category]
                            : selectedCategories.filter((c) => c !== category)
                        );
                      }}
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop filters and sort */}
      <div className="hidden md:flex justify-between items-center mb-6">
        <div className="space-x-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            Showing {currentProducts.length} of {filteredProducts.length}{" "}
            products
          </span>
        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {currentProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardContent className="p-4">
              <Image
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover mb-4 rounded-md"
              />
              <h3 className="font-semibold mb-2">{product.name}</h3>
              <p className="text-muted-foreground mb-2">{product.category}</p>
              <p className="font-bold">${product.price.toFixed(2)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className={
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={() => setCurrentPage(page)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
