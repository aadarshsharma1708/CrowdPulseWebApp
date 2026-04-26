import React from 'react'
import { Navigate , useNavigate } from 'react-router-dom'
import './Hero.css'
function Hero() {
    const navigate = useNavigate();
    const handleNavigate = () => {
        navigate('/createPoll');
    }
    return (
        <div className="hero">
            <h1>
                Welcome to <br />
                <span>CrowdPulse</span>
            </h1>

            <p>
                Create live polls, share them instantly with anyone, and watch results
                update in real-time. Whether it's for a classroom, event, or team
                decision — CrowdPulse makes collecting opinions simple and fun!
            </p>

            <div className="hero-buttons">
                <button className="primary-btn" onClick={handleNavigate}>Create a Poll</button>
                <button className="secondary-btn">View My Polls</button>
            </div>
        </div>
    )
}

export default Hero
