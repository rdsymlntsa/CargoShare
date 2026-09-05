import { useSelector } from 'react-redux'
import Login from "./pages/auth/Login"
function App() {
     const auth = useSelector((state) => state.auth);

  console.log(auth);

  return (
    <Login>

    </Login>
  );
}

export default App
