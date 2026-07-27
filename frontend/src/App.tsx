import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div>Fitsens</div>
    </AuthProvider>
  );
}

export default App;
