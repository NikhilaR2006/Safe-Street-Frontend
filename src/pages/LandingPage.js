import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LandingPage.module.css";
import { ArrowRight } from "lucide-react";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContainer}>
        {/* Background Image with Overlay */}
        <div className={styles.backgroundOverlay} />
        <img
          src="https://cdn.builder.io/api/v1/image/assets/47ee3d4f73e64238812a1df7fb1f54ea/c39dad62765c2c55fa3b96ddacc026dbdc6ca301?placeholderIfAbsent=true"
          alt="Road Background"
          className={styles.backgroundImage}
        />

        {/* Content */}
        <div className={styles.contentCard}>
          <h1 className={styles.title}>
            <span className={styles.titleBold}>SAFE</span>
            <span className={styles.titleLight}>STREET</span>
          </h1>
          <span className={styles.subtitle}>Road Damage Detection</span>
          <p className={styles.description}>
            Advanced AI-powered solution for detecting and analyzing road damages
            with precision and efficiency.
          </p>

          <button
            onClick={() => navigate("/login")}
            className={styles.loginButton}
            aria-label="Login to SafeStreet"
          >
            Get Started
            <ArrowRight size={20} className={styles.buttonIcon} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default LandingPage;