import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Wheel } from 'react-custom-roulette';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
console.log(backendUrl);
const socket = io(`${backendUrl}`); // Connect to backend on port 3005

// Define wheel data with roulette numbers
const wheelData = [
  { option: '0', style: { backgroundColor: '#16a34a', textColor: 'white' } },
  { option: '32', style: { backgroundColor: '#dc2626', textColor: 'white' } },
  { option: '15', style: { backgroundColor: '#000000', textColor: 'white' } },
  { option: '19', style: { backgroundColor: '#dc2626', textColor: 'white' } },
  { option: '4', style: { backgroundColor: '#000000', textColor: 'white' } },
  { option: '21', style: { backgroundColor: '#dc2626', textColor: 'white' } },
  { option: '2', style: { backgroundColor: '#000000', textColor: 'white' } },
  { option: '25', style: { backgroundColor: '#dc2626', textColor: 'white' } },
  { option: '17', style: { backgroundColor: '#000000', textColor: 'white' } },
  { option: '34', style: { backgroundColor: '#dc2626', textColor: 'white' } },
  { option: '6', style: { backgroundColor: '#000000', textColor: 'white' } },
  { option: '27', style: { backgroundColor: '#dc2626', textColor: 'white' } },
  { option: '13', style: { backgroundColor: '#000000', textColor: 'white' } },
  { option: '36', style: { backgroundColor: '#dc2626', textColor: 'white' } },
  { option: '11', style: { backgroundColor: '#000000', textColor: 'white' } },
  { option: '30', style: { backgroundColor: '#dc2626', textColor: 'white' } },
];

const App = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  // Fetch initial leaderboard and user rank
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const storedUsername = sessionStorage.getItem('username');
    if (token && storedUsername) {
      setUsername(storedUsername);
      setLoggedIn(true);
      fetchLeaderboard();
      fetchUserRank();
    }
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    socket.on('leaderboard-update', (data) => {
      console.log('Leaderboard update received:', data);
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
        // Find current user's rank from the updated leaderboard
        const userEntry = data.leaderboard.find(player => player.username === username);
        if (userEntry) {
          setUserRank(userEntry.rank);
        }
      }
    });
    return () => {
      socket.off('leaderboard-update');
    };
  }, [username]);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${backendUrl}/leaderboard`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };
  
  const fetchUserRank = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/user-rank`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserRank(response.data.rank);
    } catch (error) {
      console.error('Error fetching user rank:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${backendUrl}/login`, {
        username,
        password,
      });
      const token = response.data.token;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('username', username);
      setLoggedIn(true);
      // Fetch leaderboard and user rank immediately after login
      fetchLeaderboard();
      fetchUserRank();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSpinClick = () => {
    if (!isSpinning) {
      // Generate random prize number
      const newPrizeNumber = Math.floor(Math.random() * wheelData.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
      setIsSpinning(true);
    }
  };

  const handleSpinStop = async () => {
    setMustSpin(false);
    setIsSpinning(false);
    
    // Get the actual number from the wheel
    const wheelValue = wheelData[prizeNumber].option;
    console.log('Wheel landed on:', wheelValue);
    
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post(
        `${backendUrl}/increment-score`,
        { increment: wheelValue }, // Send the actual wheel value
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.leaderboard) {
        setLeaderboard(response.data.leaderboard);
        const userEntry = response.data.leaderboard.find(player => player.username === username);
        if (userEntry) {
          setUserRank(userEntry.rank);
        }
      }
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  if (!loggedIn) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: '#1a1a1a',
        color: 'white'
      }}>
        <div style={{ 
          width: '100%',
          maxWidth: '400px',
          padding: '2rem',
          backgroundColor: '#2a2a2a',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h1>Casino Login</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: 'none' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: 'none' }}
            />
            <button 
              onClick={handleLogin}
              style={{
                padding: '0.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#1a1a1a',
      color: 'white'
    }}>
      <div style={{  
        display: 'flex',
        width: '100%',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        overflow: 'hidden'
      }}>
        {/* Left side - Roulette */}
        <div style={{ 
          width: '50%',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRight: '2px solid #333'
        }}>
          <h1 style={{ marginBottom: '2rem' }}>Casino Roulette</h1>
          <div style={{ width: '80%', maxWidth: '400px' }}>
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={wheelData}
              onStopSpinning={handleSpinStop}
              radiusLineWidth={1}
              fontSize={16}
              outerBorderColor="#888"
              outerBorderWidth={3}
              innerRadius={40}
              innerBorderColor="#888"
              innerBorderWidth={2}
              spinDuration={0.1}
            />
          </div>
          <button 
            onClick={handleSpinClick}
            disabled={isSpinning}
            style={{
              marginTop: '2rem',
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              backgroundColor: isSpinning ? '#666' : '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isSpinning ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s'
            }}
          >
            {isSpinning ? 'Spinning...' : 'SPIN'}
          </button>
        </div>

        {/* Right side - Leaderboard */}
        <div style={{ 
          width: '50%',
          padding: '2rem',
          backgroundColor: '#2a2a2a'
        }}>
          <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Leaderboard</h1>
          <div style={{ 
            backgroundColor: '#333',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0,
              margin: 0
            }}>
              {leaderboard.map((player) => (
                <li 
                  key={player.username}
                  style={{
                    padding: '1rem',
                    margin: '0.5rem 0',
                    backgroundColor: player.username === username ? '#dc2626' : '#1a1a1a',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'transform 0.2s',
                    transform: player.username === username ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <span>#{player.rank} {player.username}</span>
                  <span style={{ 
                    backgroundColor: '#333',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.9rem'
                  }}>
                    {player.score} pts
                  </span>
                </li>
              ))}
            </ul>
            <div style={{ 
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: '#1a1a1a',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0 }}>
                Your Rank: <strong>{userRank !== null ? `#${userRank}` : 'Loading...'}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;