import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import MapCard from '@components/commons/MapCard';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useBookMarkActions } from '@src/context/BookMarkContext';
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '1200px',
  maxHeight: '80vh',
  bgcolor: 'background.paper',
  borderRadius: '10px',
  boxShadow: 24,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const contentStyle = {
  overflowY: 'auto',
  minHeight: 0,
  p: 4,
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#555',
  },
};



export default function ListModal({
  open,
  handleClose,
  restaurants,
}: {
  open: boolean;
  handleClose: () => void;
  restaurants: any[];
}) {
  const { addBookmark, removeBookmark } = useBookMarkActions();

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{ zIndex: 1300 }}
    >
      <Box sx={style}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
            zIndex: 10,
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box sx={contentStyle}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              pt: 2,
            }}
          >
            {restaurants.map((restaurant, idx) => {
              return (
                <Box
                  key={idx}
                  sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                >
                  <MapCard
                    restaurant={restaurant}
                    visitDate={undefined}
                    onBookmarkAdd={addBookmark}
                    onBookmarkRemove={removeBookmark}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
