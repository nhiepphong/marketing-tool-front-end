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
  const DOTS = "...";

  const range = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
  };

  const renderPagination = (): (number | string)[] => {
    if (totalPages <= 7) {
      return range(1, totalPages);
    }

    if (currentPage <= 3) {
      return [...range(1, 5), DOTS, totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, DOTS, ...range(totalPages - 4, totalPages)];
    }

    return [
      1,
      DOTS,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      DOTS,
      totalPages,
    ];
  };

  const renderPageItem = (
    item: number | string,
    index: number
  ): React.ReactNode => {
    if (item === DOTS) {
      return (
        <span key={`${item}-${index}`} className="mx-1">
          {item}
        </span>
      );
    }

    return (
      <button
        key={item}
        onClick={() => onPageChange(item as number)}
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

  return (
    <div className="flex justify-center">
      {renderPagination().map(renderPageItem)}
    </div>
  );
};

export default Pagination;
