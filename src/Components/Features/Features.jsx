import React from 'react'
import './features.css'
function Features() {
    return (
        <div className="features">

            <div className="card">
                <h3>⚡ Real-Time Results</h3>
                <p>
                    See votes update live without refreshing the page. Perfect for live
                    events and meetings.
                </p>
            </div>

            <div className="card">
                <h3>🔗 Easy Sharing</h3>
                <p>
                    Share polls with a single link or QR code — anyone can vote instantly
                    from any device.
                </p>
            </div>

            <div className="card">
                <h3>🛡 Secure & Fast</h3>
                <p>
                    Built for speed, reliability, and scalability. Your data is always safe.
                </p>
            </div>

        </div>
    )
}

export default Features
