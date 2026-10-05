import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PlaceListItem from '@components/commons/PlaceListItem';
import { useBookMarkActions } from '@src/context/BookMarkContext';
import { useModalDispatch } from '@src/context/ModalContext';
import { convertPlaceRowToRestaurant } from '@lib/util';
import type { PlaceWithBookmark } from '@src/types';
import '@components/ListModal.scss';

type ListModalProps = {
  open: boolean;
  handleClose: () => void;
  restaurants: PlaceWithBookmark[];
};

const TITLE_ID = 'place-list-modal-title';

export default function ListModal({ open, handleClose, restaurants }: ListModalProps) {
  const { addBookmark, removeBookmark } = useBookMarkActions();
  const modalDispatch = useModalDispatch();

  const handleSelect = (place: PlaceWithBookmark) => {
    modalDispatch({ type: 'showModal', payload: convertPlaceRowToRestaurant(place) });
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby={TITLE_ID}
      sx={{ zIndex: 1300 }}
    >
      <div className="place-list-modal">
        <header className="place-list-modal-header">
          <h2 id={TITLE_ID}>
            이 근처 <span className="count">{restaurants.length}</span>곳
          </h2>
          <IconButton aria-label="닫기" onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </header>

        {restaurants.length === 0 ? (
          <p className="place-list-empty">이 영역에 표시할 장소가 없어요</p>
        ) : (
          <ul className="place-list">
            {restaurants.map((place) => (
              <PlaceListItem
                key={place.id}
                place={place}
                onBookmarkAdd={addBookmark}
                onBookmarkRemove={removeBookmark}
                onSelect={handleSelect}
              />
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
