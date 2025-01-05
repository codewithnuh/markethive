import { SlidersHorizontal } from "lucide-react";
import Form from "next/form"; // Importing the Form component

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

// Constants
const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Books",
  "Home & Garden",
] as const;

export function ProductFilters() {
  return (
    <>
      <div className="md:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
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
            <Form action="/products">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="search"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Search
                  </label>
                  <Input
                    type="search"
                    name="query"
                    id="search"
                    placeholder="Search products..."
                    className="w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Category
                  </label>
                  <Select name="category">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price Range
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      name="minPrice"
                      className="w-20"
                      min={0}
                      step="0.01"
                    />
                    <span>to</span>
                    <Input
                      type="number"
                      name="maxPrice"
                      className="w-20"
                      min={0}
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="sortBy"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Sort By
                  </label>
                  <Select name="sortBy">
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price-asc">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-desc">
                        Price: High to Low
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit">Apply Filters</Button>
              </div>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden md:block">
        <Form action="/products">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700"
              >
                Search
              </label>
              <Input
                type="search"
                name="query"
                id="search"
                placeholder="Search products..."
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <Select name="category">
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price Range
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  name="minPrice"
                  className="w-20"
                  min={0}
                  step="0.01"
                />
                <span>to</span>
                <Input
                  type="number"
                  name="maxPrice"
                  className="w-20"
                  min={0}
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="sortBy"
                className="block text-sm font-medium text-gray-700"
              >
                Sort By
              </label>
              <Select name="sortBy">
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit">Apply Filters</Button>
          </div>
        </Form>
      </div>
    </>
  );
}
