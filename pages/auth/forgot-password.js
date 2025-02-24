// pages/auth/forgot-password.js
import { useState, useEffect } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import styles from "../../styles/Login.module.css";
import { auth } from "../../firebaseConfig";


const backgrounds = [
  { id: 1, src: "https://lofistudy.fra1.cdn.digitaloceanspaces.com/backgrounds/Night.mp4", alt: "Night", note: "Night" },
  { id: 2, src: "https://lofistudy.fra1.cdn.digitaloceanspaces.com/backgrounds/Rain.mp4", alt: "Rain", note: "Rain" },
  { id: 3, src: "https://lofistudy.fra1.cdn.digitaloceanspaces.com/backgrounds/Train.mp4", alt: "Train", note: "Train" },
  { id: 4, src: "https://lofistudy.fra1.cdn.digitaloceanspaces.com/backgrounds/Classroom.mp4", alt: "Classroom", note: "Classroom" },
  { id: 5, src: "https://lofistudy.fra1.cdn.digitaloceanspaces.com/backgrounds/Autumn.mp4", alt: "Autumn", note: "Autumn" },
  { id: 6, src: "https://lofistudy.fra1.cdn.digitaloceanspaces.com/backgrounds/Couch.mp4", alt: "Couch", note: "Couch" },
  { id: 7, src: "https://lofistudy.fra1.cdn.digitaloceanspaces.com/backgrounds/Skyrim.mp4", alt: "Skyrim", note: "Skyrim" },
  { id: 8, src: "https://lofistudy.fra1.cdn.digitaloceanspaces.com/backgrounds/Train2.mp4", alt: "Train2", note: "Train2" },
  { id: 9, src: "https://lofistudy.fra1.cdn.digitaloceanspaces.com/backgrounds/Chillroom.mp4", alt: "Chillroom", note: "Chillroom" },
];

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [background, setBackground] = useState(null);

  useEffect(() => {
    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    setBackground(randomBackground);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.container}>
      {background && (
        <video
          className={styles.videoBackground}
          autoPlay
          loop
          muted
          src={background.src}
          alt={background.alt}
        />
      )}
      <div className={styles.gradientOverlay}></div>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Reset Password</h1>
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className={styles.authInput}
          />
          <button type="submit" className={styles.authButton}>
            Reset Password
          </button>
        </form>
        {message && <p className={styles.authMessage}>{message}</p>}
        {error && <p className={styles.authError}>{error}</p>}
        <Link href="/auth/signin">
          <p className={styles.authLink}>Back to Sign In</p>
        </Link>
      </div>
    </div>
  );
}