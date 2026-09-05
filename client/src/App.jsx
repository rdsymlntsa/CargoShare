import { useSelector } from 'react-redux'
function App() {
     const auth = useSelector((state) => state.auth);

  console.log(auth);

  return (
    <div className="flex bg-black  min-h-screen items-center justify-center" 
     >
      <h1 className="text-6xl text-teal-500 font-bold">
        CargoShare
      </h1>
    </div>
  );
}

export default App
