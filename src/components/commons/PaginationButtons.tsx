import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
export default function PaginationButtons({
  page,
  dataPerPage,
  totalDataLength,
  btnClickListener,
}: {
  page: number;
  dataPerPage: number;
  totalDataLength: number;
  btnClickListener: (page: number) => void;
}) {
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    btnClickListener(value);
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
