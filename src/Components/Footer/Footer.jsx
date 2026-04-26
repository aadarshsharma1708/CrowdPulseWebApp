import React from 'react'
import './Footer.css'

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <div className="footer">
            <div className="footer-container">
                <div>
                    <h4>CrowdPulse</h4>
                    <p>Empowering voices through real-time data. Create, share, and analyze interactive polls instantly.</p>
                </div>

                <div>
                    <h4>Resources</h4>
                    <p>Blog</p>
                    <p>Help Center</p>
                    <p>Docs</p>
                </div>

                <div>
                    <h4>Legal</h4>
                    <p>Terms of Service</p>
                    <p>Privacy Policy</p>
                    <p>Cookie Policy</p>
                </div>

                <div>
                    <h4>Have Questions?</h4>
                    <p>Contact Us</p>
                    <p><a href="mailto:support@crowdpulse.com" className="footer-mail">support@crowdpulse.com</a></p>
                </div>
            </div>

            <hr className="footer-divider" />

            <div className="footer-bottom">
                <p className="copyright-text">
                    &copy; {currentYear} CrowdPulse. All rights reserved.
                </p>
            </div>
        </div>
    )
}

export default Footer