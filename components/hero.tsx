import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default async function HeroSection() {
  return (
    <section className="w-full">
      {/* Main Hero */}
      <div className="container px-4 py-6 md:py-12">
        <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-3">
              <h2 className="text-sm font-medium tracking-wide text-muted-foreground">
                Your Tech. Your Future.
              </h2>
              <h1 className="text-3xl  font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Upgrade Your Life with Smart Savings
              </h1>
              <p className="max-w-[600px]  text-muted-foreground md:text-xl">
                Shop the best deals on laptops, phones, and accessories.
                Experience innovation at unbeatable prices.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground"
                asChild
              >
                <Link href={"/products"}>Start Shopping</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={"/products"}>View All Products</Link>
              </Button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[500px] lg:ml-auto">
            <Image
              src="/hero.png"
              width={600}
              height={600}
              alt="Laptops and Smartphones"
              className="aspect-square object-contain dark:brightness-90"
              priority
            />
          </div>
        </div>
      </div>

      {/* New Arrivals */}
      <div className="container px-4 py-8">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">
          Discover What&apos;s New
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:gap-12">
          {[1, 2].map((item) => (
            <Card key={item} className="overflow-hidden">
              <Link href="#" className="group block">
                <div className="grid grid-cols-2 items-center gap-4 p-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium tracking-wide text-muted-foreground">
                      Just Arrived
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Explore the latest in cutting-edge devices.
                    </p>
                  </div>
                  <div className="relative aspect-square">
                    <Image
                      src={`/placeholder.svg`}
                      width={200}
                      height={200}
                      alt={`New Arrival ${item}`}
                      className="object-contain transition-transform duration-300 group-hover:scale-105 dark:brightness-90"
                    />
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Collections */}
      <div className="container px-4 py-8">
        <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">
          Shop by Category
        </h2>
        <div className="no-scrollbar items-center justify-center flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-full w-24 flex-none snap-center md:w-32"
            >
              <Image
                src={`/placeholder.svg`}
                width={128}
                height={128}
                alt={`Category ${i + 1}`}
                className="rounded-full shadow-md border-ring border-black dark:border-white border-2 border-dashed object-contain dark:brightness-90"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
