import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { FaTrophy, FaChevronLeft, FaChevronRight, FaFilter, FaExclamationTriangle } from 'react-icons/fa';
import styles from '../styles/ChallengeSidebar.module.css';

export default function ChallengeSidebar() {
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [filter, setFilter] = useState('all'); // all, daily, weekly, monthly
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  // Close sidebar when clicking outside
  const handleClickOutside = useCallback((event) => {
    if (isExpanded && !event.target.closest(`.${styles.sidebar}`)) {
      setIsExpanded(false);
    }
  }, [isExpanded]);

  // Add click outside listener
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    if (session?.user) {
      fetchChallenges();
    }
  }, [session, filter]);

  const fetchChallenges = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/challenges');
      if (!response.ok) {
        throw new Error('Failed to fetch challenges');
      }
      const data = await response.json();
      setChallenges(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError(err.message);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (challengeId) => {
    try {
      const res = await fetch('/api/challenges/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId,
          email: session.user.email,
        }),
      });
      
      if (res.ok) {
        fetchChallenges(); // Refresh challenges
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading challenges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  if (!challenges || challenges.length === 0) {
    return (
      <div className={styles.noResults}>No challenges available</div>
    );
  }

  return (
    <>
      <div className={`${styles.sidebar} ${isExpanded ? styles.expanded : ''}`}>
      
          <div className={styles.devWarning}>
            <FaExclamationTriangle />
            <span>Challenges may not work and are still in development</span>
          </div>
        
        <div className={styles.tooltipWrapper}>
          <button 
            className={styles.toggleButton}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Close Challenges' : 'Open Challenges'}
          >
            <FaChevronLeft />
          </button>
          <div className={styles.tooltip}>
            {isExpanded ? 'Close Challenges' : 'View Challenges'}
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <FaTrophy className={styles.icon} />
            <h2>Daily Challenges</h2>
            <div className={styles.filterContainer}>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <FaFilter className={styles.filterIcon} />
            </div>
          </div>

          <div className={styles.challengeList}>
            {challenges.map(challenge => (
              <div 
                key={challenge.id} 
                className={`${styles.challenge} ${challenge.completed ? styles.completed : ''}`}
                onClick={() => !challenge.completed && updateProgress(challenge.id)}
              >
                <div className={styles.challengeHeader}>
                  <h3>{challenge.title}</h3>
                  <span className={styles.reward}>{challenge.reward}</span>
                </div>
                <p>{challenge.description}</p>
                {!challenge.completed && (
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progress}
                      style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                    />
                    <span className={styles.progressText}>
                      {challenge.progress}/{challenge.total}
                    </span>
                  </div>
                )}
                <div className={styles.challengeFooter}>
                  <span className={styles.type}>{challenge.type}</span>
                  <span className={styles.category}>{challenge.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.backdrop} />
    </>
  );
} 