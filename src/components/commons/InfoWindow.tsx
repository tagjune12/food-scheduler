import { Restaurant } from '@src/types';
import '@components/commons/InfoWindow.scss';

const InfoWindow = ({ data }: { data: Restaurant }) => {
  return (
    <div className="info-window-container">
      <div className="title">{data.name}</div>
      <button className="close-btn">❌</button>
      <div>{data.tags}</div>
      <button className="add-event-btn">일정 추가하기</button>
    </div>
  );
};

export default InfoWindow;
