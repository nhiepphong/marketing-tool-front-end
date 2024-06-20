import { useState, useEffect } from 'react';
import axios from 'axios';

export default function usePaginationWithData(initialPage:number, initialUrl:string){
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (url:string) => {
    try {
      const response = await axios.get(url);
      setItems(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    // const apiUrl = `${initialUrl}?page=${currentPage}`;
    const apiUrl = `${initialUrl}`;
    fetchData(apiUrl)
  }, [currentPage, initialUrl]);

  const handlePageChange = (newPage:number) => {
    setCurrentPage(newPage);
  };

  return {
    items,
    currentPage,
    totalPages,
    handlePageChange,
  };
};
