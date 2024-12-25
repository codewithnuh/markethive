import {
  BadgeDollarSign,
  CarIcon,
  Search,
  IndianRupeeIcon,
} from "lucide-react";
import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Hero = () => {
  return (
    <section className="py-20 text-foreground dark:text-foreground">
      <div className="container grid grid-cols-1 gap-2 sm:grid-cols-2 place-items-center">
        <div>
          <div className="max-w-md space-y-6">
            <h1 className="text-3xl font-bold sm:text-4xl">
              Don&apos;t miss out on exclusive deals made for you.
            </h1>
            <p className="flex items-center space-x-2 text-muted-foreground">
              <CarIcon className="h-5 w-5" />
              <span>Free US delivery for orders over $200</span>
            </p>
            <div className="flex shadow-sm mb-8">
              <Select>
                <SelectTrigger className="w-[180px] rounded-l-md rounded-r-none  bg-primary/10 hover:bg-primary/20 dark:bg-background  text-foreground dark:hover:bg-background/70 border-r-2 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none">
                  <SelectValue
                    placeholder="Head Phones"
                    defaultValue={"headphones"}
                    className="placeholder:text-white"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ui-ux">UI UX</SelectItem>
                  <SelectItem value="web-dev">Web Development</SelectItem>
                  <SelectItem value="mobile-dev">Mobile Development</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-grow">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="rounded-l-none rounded-r-md pl-3 pr-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none dark:bg-background dark:text-foreground border-l-0"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-0 top-0 h-full rounded-l-none bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                >
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2 border-t border-gray-500 pt-10">
              <div className="space-y-1">
                <IndianRupeeIcon className="text-primary" />
                <p className="font-bold text-black dark:text-white">
                  Moneyback
                </p>
                <p className=" text-black dark:text-white">
                  Did you change your mind? You can return the product within 14
                  days.
                </p>
              </div>
              <div className="space-y-1">
                <IndianRupeeIcon className="text-primary" />
                <p className="font-bold text-black dark:text-white">
                  Moneyback
                </p>
                <p className=" text-black dark:text-white">
                  Did you change your mind? You can return the product within 14
                  days.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Carousel className="w-full max-w-xs lg:max-w-md">
            <CarouselContent>
              {Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <div className="flex aspect-square items-center justify-center rounded-md bg-primary/10 p-6 dark:bg-primary/20">
                      <span className="text-3xl font-semibold text-primary dark:text-primary-foreground">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
              <CarouselPrevious className="relative left-0 top-0 h-8 w-8 translate-x-0 translate-y-0" />
              <CarouselNext className="relative right-0 top-0 h-8 w-8 translate-x-0 translate-y-0" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Hero;
