import restaurants from '@data/restaurants.json'; // 런타임에서 절대경로 적용 안됨(왜지)

function App() {
  return (
    <>
      {restaurants.map((restaurant, index) => (
        <p key={index}>{JSON.stringify(restaurant)}</p>
      ))}
    </>
  );
}

export default App;
