import { useSelector } from 'react-redux'

function App() {
   const reduxState = useSelector((state) => state);

  console.log(reduxState);

  return (
    <div className="flex bg-black min-h-screen items-center justify-center">
      <h1 className="text-4xl text-teal-500 font-bold">
        CargoShare
      </h1>
    </div>
  );
}

export default App
