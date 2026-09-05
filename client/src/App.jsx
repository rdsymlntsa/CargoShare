import { useSelector } from 'react-redux'
function App() {
   const reduxState = useSelector((state) => state);

  console.log(reduxState);

  return (
    <div className="flex bg-contain  min-h-screen items-center justify-center" 
     style={{ backgroundImage: "url('/image.jpeg')" }}>
      <h1 className="text-6xl text-teal-500 font-bold">
        CargoShare
      </h1>
    </div>
  );
}

export default App
