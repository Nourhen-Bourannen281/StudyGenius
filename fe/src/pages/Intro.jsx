
import { useEffect, useState } from "react";
import "./Intro.css";

function Intro({ onFinish }) {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHide(true);

      setTimeout(() => {
        onFinish();
      }, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`intro ${hide ? "intro-hide" : ""}`}>
      <div className="intro-content">

        <img
          src="/splash.png"
          alt="StudyGenius"
          className="splash-image"
        />

        <p>Learn smarter. Study better.</p>

        <div className="intro-loader">
          <span></span>
        </div>

      </div>
    </div>
  );
}

export default Intro;
