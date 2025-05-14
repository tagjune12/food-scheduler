import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
export default function PaginationButtons({
  page,
  dataPerPage,
  totalDataLength,
  btnClickListener,
  restaurantListRef,
}: {
  page: number;
  dataPerPage: number;
  totalDataLength: number;
  btnClickListener: (page: number) => void;
  restaurantListRef: React.RefObject<HTMLDivElement>;
}) {
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    btnClickListener(value);
    console.log('restaurantListRef', restaurantListRef.current);
    restaurantListRef.current?.scrollTo({ top: 0 });
  };

  return (
    <Stack spacing={1}>
      <Pagination
        count={Math.ceil(
          totalDataLength / (dataPerPage > 0 ? dataPerPage : 10),
        )}
        showFirstButton
        showLastButton
        page={page}
        onChange={handleChange}
      />
    </Stack>
  );
}
