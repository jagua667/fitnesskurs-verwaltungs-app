const Logout = () => {
  const handleLogout = () => {
    // Entfernen des Tokens und Weiterleitung zur Login-Seite
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;

