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
};

const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  return (
    <div
      style={{
        width: '100px',
        margin: 0,
      }}
    >
      <img src="#" alt="사진" />
      <h3>타이틀</h3>
      <div>
        {restaurant.tags.map((tag, index) => (
          <p key={index}>{tag}</p>
        ))}
      </div>
    </div>
  );
};
// const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
//   return (
//     // <Card style={{ width: '18rem' }}>
//     <Card style={{ display: 'inline-block', width: '18rem' }}>
//       <Card.Img variant="top" src="holder.js/100px180" />
//       <Card.Body>
//         <Card.Title>{restaurant.name}</Card.Title>
//         <Card.Text className="tags">
//           {restaurant.tags.map((tag, index) => (
//             <p key={index}>{tag}</p>
//           ))}
//         </Card.Text>
//       </Card.Body>
//     </Card>
//   );
// };

export default RestaurantCard;
