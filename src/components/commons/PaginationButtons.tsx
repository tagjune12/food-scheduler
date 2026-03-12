import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
export default function PaginationButtons({
  page,
  dataPerPage,
  totalDataLength,
  btnClickListener,
  restaurantListRef,
  isMobile,
}: {
  page: number;
  dataPerPage: number;
  totalDataLength: number;
  btnClickListener: (page: number) => void;
  restaurantListRef: React.RefObject<HTMLDivElement>;
  isMobile?: boolean;
}) {
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    btnClickListener(value);
    restaurantListRef.current?.scrollTo({ top: 0 });
  };

  return (
    <Stack spacing={1}>
      <Pagination
        count={Math.ceil(
          totalDataLength / (dataPerPage > 0 ? dataPerPage : 10),
        )}
        size={isMobile ? "small" : "medium"}
        siblingCount={isMobile ? 0 : 1}
        boundaryCount={isMobile ? 1 : 1}
        showFirstButton
        showLastButton
        page={page}
        onChange={handleChange}
      />
    </Stack>
  );
}
