import React from 'react'
import Navbar from '../../Components/Navbar/Navbar'
import Hero from '../../Components/Hero/Hero'
import Features from '../../Components/Features/Features'
import Footer from '../../Components/Footer/Footer'
import './Home.css'
function Home() {
    return (
        <div className='home'>
            {/* <Navbar /> */}
            <Hero />
            <Features />
            {/* <Footer /> */}
        </div>
    )
}

export default Home
