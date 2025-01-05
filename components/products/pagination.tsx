import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PaginationComponent = ({
  totalPages,
  currentPage,
  pathName,
}: {
  totalPages: number;
  currentPage: number;
  pathName: string;
}) => {
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];

    // Always include the first page
    pages.push(1);

    // Show ellipsis if we're far from the first page
    if (currentPage > 3) {
      pages.push("...");
    }

    // Sliding window of pages around the current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Show ellipsis if we're far from the last page
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Always include the last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePageNumbers();

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            href={`/${pathName}?page=${Math.max(currentPage - 1, 1)}`}
            className={
              currentPage === 1 ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>

        {/* Page Links */}
        {pages.map((page, index) => (
          <PaginationItem key={index}>
            {typeof page === "number" ? (
              <PaginationLink
                href={`/${pathName}?page=${page}`}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            ) : (
              <span className="mx-1 text-muted-foreground">...</span>
            )}
          </PaginationItem>
        ))}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            href={`/${pathName}?page=${Math.min(currentPage + 1, totalPages)}`}
            className={
              currentPage === totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;
