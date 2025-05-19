// import * as React from 'react';
import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Restaurant } from '@src/types';
import MapCard from './commons/MapCard';
import Grid from '@mui/material/Grid';
import { convertPlaceToRestaurant } from '@lib/util';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '1200px',
  maxHeight: '80vh',
  overflow: 'auto',
  bgcolor: 'background.paper',
  // border: '2px solid #000',
  borderRadius: '10px',
  boxShadow: 24,
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

const gridItemStyle = {
  padding: '10px',
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
      sx={{ zIndex: 1300 }}
    >
      <Box sx={style}>
        <Grid container spacing={4}>
          {restaurants.map((restaurant, idx) => {
            // const restaurant = convertPlaceToRestaurant(place);
            return (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={idx}
                sx={gridItemStyle}
              >
                <MapCard
                  restaurant={restaurant}
                  visitDate={
                    // restaurant.place_name
                    //   ? state.histories[restaurant.place_name]?.date
                    //   : undefined
                    undefined
                  }
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Modal>
  );
}
