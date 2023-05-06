import { Restaurant } from '@src/types';

const InfoWindow = ({ data }: { data: Restaurant }) => {
  return (
    <div>
      <div>{data.name}</div>
      <div>{data.tags}</div>
      <div>{data.period}</div>
      <button className="add-event-btn">일정 추가하기</button>
    </div>
  );
};

export default InfoWindow;
