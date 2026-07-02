import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-auto">
      <div className="container text-center small">
        <p className="mb-1">© {new Date().getFullYear()} MediCharm. All rights reserved.</p>
        <p className="mb-0">
          <Link to="/about" className="text-decoration-none">About Us</Link>
          {" "}|{" "}
          Helpline: <a href="tel:108" className="text-decoration-none">108</a>
          {" "}|{" "}
          Email: <a href="mailto:help@medicharm.example" className="text-decoration-none">help@medicharm.example</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
