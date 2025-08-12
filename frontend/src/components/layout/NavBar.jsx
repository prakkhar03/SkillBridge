import { useState } from "react"
import './NavBar.css';
import { GiHamburgerMenu } from "react-icons/gi";

export const NavBar = () => {
    const [show, setShow] = useState(false);
    const handleButtonToggle = () => {
        return setShow(!show);
    };

    return (
        <header>
            <div className="container">
                <div className="grid navbar-grid">
                    <div className="Logo">
                        <a href="/">
                            <img src="7.png" alt="Logo" />
                        </a>
                    </div>

                    <nav className={`menu-mobile ${show ? 'menu-open' : ''}`}>
                        <ul>
                            <li>
                                <a href="/">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="/about">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="/country">
                                    Country
                                </a>
                            </li>
                            <li>
                                <a href="/contact">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </nav>
                    <div className="ham-menu">
                        <button onClick={handleButtonToggle}>
                            <GiHamburgerMenu />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}