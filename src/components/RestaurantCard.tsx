// import Button from 'react-bootstrap/Button';
// import Card from 'react-bootstrap/Card';

type Restaurant = {
  name: string;
  tags: string[];
  address: string;
  period: number;
  visit: string;
};

type RestaurantCardProps = {
  restaurant: Restaurant;
  isHistory?: boolean;
};

const RestaurantCard = ({ restaurant, isHistory }: RestaurantCardProps) => {
  return (
    <div
      style={{
        width: '100px',
        margin: 0,
      }}
    >
      <img src="#" alt="사진" />
      <h3>타이틀</h3>
      {isHistory && (
        <>
          <div>
            <progress value={15} max={30} />
          </div>
          <div>
            {restaurant.tags.map((tag, index) => (
              <p key={index}>{tag}</p>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantCard;
