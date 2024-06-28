import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const renderPageNumbers = (): React.ReactNode[] => {
    const pageNumbers: React.ReactNode[] = [];
    const DOTS = "...";

    const range = (start: number, end: number) => {
      const length = end - start + 1;
      return Array.from({ length }, (_, idx) => idx + start);
    };

    const leftSiblingIndex = Math.max(currentPage - 1, 1);
    const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2;
      const leftRange = range(1, leftItemCount);

      return [...leftRange, DOTS, totalPages].map(renderPageItem);
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);

      return [1, DOTS, ...rightRange].map(renderPageItem);
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, DOTS, ...middleRange, DOTS, totalPages].map(renderPageItem);
    }

    return range(1, totalPages).map(renderPageItem);
  };

  const renderPageItem = (
    item: number | string,
    index: number
  ): React.ReactNode => {
    if (typeof item === "string") {
      return (
        <span key={`${item}-${index}`} className="mx-1">
          {item}
        </span>
      );
    }

    return (
      <button
        key={item}
        onClick={() => onPageChange(item)}
        className={`mx-1 px-3 py-1 rounded ${
          currentPage === item
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        {item}
      </button>
    );
  };

  return <div className="flex justify-center">{renderPageNumbers()}</div>;
};

export default Pagination;
