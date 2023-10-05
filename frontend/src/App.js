import { Container } from "react-bootstrap";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
// import UserRegister from "./screens/UserRegister";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Container className="py-3">
          <Switch>
            <Route path="/" exact>
              <HomeScreen />
            </Route>
            <Route path="/login">
              <LoginScreen />
            </Route>
            {/* <Route path="/register">
              <UserRegister />
            </Route> */}
          </Switch>
        </Container>
      </div>
    </BrowserRouter>
  );
}

export default App;
