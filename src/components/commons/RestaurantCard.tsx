import '@components/commons/RestaurantCard.scss';
import { Restaurant } from '@src/types';
import {
  useContext,
  useState,
  useRef,
  DragEvent,
  DragEventHandler,
  MouseEvent,
  MouseEventHandler,
} from 'react';
import { UseDispatch } from '@src/App';
import { getNumTypeToday } from '@lib/util';

type RestaurantCardProps = {
  restaurant: Restaurant;
  visitDate?: string;
};

const RestaurantCard = ({ restaurant, visitDate }: RestaurantCardProps) => {
  const dispatch = useContext(UseDispatch);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDrag, setIsDrag] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);

  const getDiffDate = (visitDate: string): number => {
    const today = getNumTypeToday();
    const visit = (() => {
      const temp = visitDate.split('-');

      return {
        year: parseInt(temp[0]),
        month: parseInt(temp[1]),
        date: parseInt(temp[2]),
      };
    })();

    const diffMs =
      new Date(today.year, today.month, today.date).getTime() -
      new Date(visit.year, visit.month, visit.date).getTime();

    console.log(
      restaurant.name,
      ':',
      today,
      visit,
      diffMs / (1000 * 60 * 60 * 24),
    );

    return diffMs / (1000 * 60 * 60 * 24);
  };

  const onBtnClick = () => {
    dispatch({ type: 'showModal', payload: restaurant });
  };

  const onDragStart = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDrag(true);
    // setStartX(e.pageX + scrollRef.current.scrollLeft);
    console.log('Drag Start');
    if (scrollRef.current) {
      setStartX(event.pageX + scrollRef.current.scrollLeft);
    } else {
      setStartX(event.pageX + 0);
    }
  };

  const onDragEnd = () => {
    console.log('Drag End');
    setIsDrag(false);
  };

  const onDragMove = (event: DragEvent) => {
    console.log('Drag Move');
    if (scrollRef.current) {
      if (isDrag) {
        scrollRef.current.scrollLeft = startX - event.pageX;
      }
    }
  };

  const throttle = (func: Function, ms: number): unknown => {
    let throttled = false;
    return (...args: Array<any>) => {
      if (!throttled) {
        throttled = true;
        setTimeout(() => {
          func(...args);
          throttled = false;
        }, ms);
      }
    };
  };
  const delay: number = 100;
  const onThrottleDragMove = throttle(
    onDragMove,
    delay,
  ) as MouseEventHandler<HTMLDivElement>;

  return (
    <>
      <div className="card-container">
        <h3>{restaurant.name}</h3>
        <div>
          {visitDate
            ? `${getDiffDate(visitDate)}일전 방문`
            : '최근 방문한적 없음'}
        </div>
        <div className="progress-wrapper">
          <progress value={visitDate ? getDiffDate(visitDate) : 0} max={28} />
        </div>
        {
          <div id="tags">
            {/* <button>{'<'}</button> */}
            <div
              className="tag-container"
              ref={scrollRef}
              onMouseDown={onDragStart}
              onMouseMove={isDrag ? onThrottleDragMove : undefined}
              onMouseUp={onDragEnd}
              onMouseLeave={onDragEnd}
            >
              {restaurant.tags?.map((tag, index) => (
                <div key={index} className="tag">
                  {tag}
                </div>
              ))}
            </div>
            {/* <button>{'>'}</button> */}
          </div>
        }
        <button onClick={onBtnClick}>오늘은 이거다</button>
      </div>
    </>
  );
};

export default RestaurantCard;
