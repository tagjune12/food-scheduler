// import * as React from 'react';
import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Restaurant } from '@src/types';
import MapCard from './commons/MapCard';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
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
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        {restaurants.map((restaurant, idx) => (
          <MapCard
            key={idx}
            restaurant={restaurant}
            visitDate={
              // restaurant.place_name
              //   ? state.histories[restaurant.place_name]?.date
              //   : undefined
              undefined
            }
          />
        ))}
      </Box>
    </Modal>
  );
}
