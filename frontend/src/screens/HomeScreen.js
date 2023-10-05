import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom"; // Import useHistory
import axios from "axios";

function HomeScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory(); // Initialize useHistory

  useEffect(() => {
    // Check if the user has a login token in their cookie
    const jwtCookie = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("login="));
    if (!jwtCookie) {
      history.push("/login");
      return;
    }

    const apiUrl = "/api/users/details";

    const fetchUserDetails = async () => {
      try {
        const userDetails = await axios.get(apiUrl);
        console.log(userDetails);
        if (userDetails) {
          setUser(userDetails.data);
          setLoading(false);
        }
      } catch (error) {
        console.log("Error fetching user details", error);
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [history]);

  if (loading) {
    return <p>Loading user details...</p>;
  }

  if (!user) {
    return <p>No user data available.</p>;
  }

  return (
    <div>
      <h2>User Details</h2>
      <p>Email: {user.email}</p>
    </div>
  );
}

export default HomeScreen;
