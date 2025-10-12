import React from "react";

const Footer = () => {
  const year = 2025; // fixed year

  const styles = {
    footer: {
      width: "100%",
      padding: "1.5rem 2rem",
      background: "linear-gradient(90deg, #007bff, #6610f2)", // header gradient
      color: "#fff",
      textAlign: "center",
      fontSize: "1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginTop: "auto",
      boxShadow: "0 -3px 10px rgba(102, 16, 242, 0.4)",
      userSelect: "none",
    },
  };

  return (
    <footer style={styles.footer}>
      <div>© {year} Task Karo. All rights reserved.</div>
    </footer>
  );
};

export default Footer;
