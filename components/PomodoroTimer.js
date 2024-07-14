import { useState, useEffect, useRef, useCallback } from 'react';
import Draggable from 'react-draggable';
import styles from '../styles/PomodoroTimer.module.css';

const pomodoroDurations = {
  pomodoro: 1500,
  shortBreak: 300,
  longBreak: 900
};

export default function PomodoroTimer() {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(pomodoroDurations.pomodoro);
  const [currentMode, setCurrentMode] = useState('pomodoro');
  const [isMinimized, setIsMinimized] = useState(false);
  const timerRef = useRef(null);

  const handleTimerEnd = useCallback(() => {
    if (currentMode === 'pomodoro') {
      setCurrentMode('shortBreak');
      setTimeLeft(pomodoroDurations.shortBreak);
    } else if (currentMode === 'shortBreak') {
      setCurrentMode('pomodoro');
      setTimeLeft(pomodoroDurations.pomodoro);
    } else if (currentMode === 'longBreak') {
      setCurrentMode('pomodoro');
      setTimeLeft(pomodoroDurations.pomodoro);
    }
    setIsTimerRunning(false);
  }, [currentMode]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            handleTimerEnd();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, handleTimerEnd]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(pomodoroDurations[currentMode]);
  };

  const changeMode = (mode) => {
    setCurrentMode(mode);
    setIsTimerRunning(false);
    setTimeLeft(pomodoroDurations[mode]);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <Draggable>
      <div className={`${styles.timerContainer} ${isMinimized ? styles.minimized : ''}`}>
        <div className={styles.header}>
          <h2>Pomodoro Timer</h2>
          <button onClick={handleMinimize} className="material-icons">remove</button>
        </div>
        <div className={styles.timerHeader}>
          <div className={`${styles.timerMode} ${currentMode === 'pomodoro' ? styles.active : ''}`} onClick={() => changeMode('pomodoro')}>Pomodoro</div>
          <div className={`${styles.timerMode} ${currentMode === 'shortBreak' ? styles.active : ''}`} onClick={() => changeMode('shortBreak')}>Short Break</div>
          <div className={`${styles.timerMode} ${currentMode === 'longBreak' ? styles.active : ''}`} onClick={() => changeMode('longBreak')}>Long Break</div>
        </div>
        <div className={styles.timerDisplay}>
          <h3>{formatTime(timeLeft)}</h3>
          <div className={styles.buttonContainer}>
            <button className={styles.startButton} onClick={toggleTimer}>
              {isTimerRunning ? 'Stop' : 'Start'}
            </button>
            <button className={styles.resetButton} onClick={resetTimer}>
              <span className="material-icons">refresh</span>
            </button>
          </div>
        </div>
      </div>
    </Draggable>
  );
}
