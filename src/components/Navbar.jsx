import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    // Simple active check
    const isActive = (path) => location.pathname === path ? 'active' : '';

    const closeMenu = () => setIsOpen(false);

    return (
        <nav className="navbar">
            <div className="container nav-content">
                <Link to="/" className="nav-logo" onClick={closeMenu}>
                    <ShoppingBag size={28} color="var(--accent)" />
                    <span>CustomNep</span>
                </Link>

                <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className={`nav-links ${isOpen ? 'open' : ''}`}>
                    <Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMenu}>Home</Link>
                    <Link to="/shop" className={`nav-link ${isActive('/shop')}`} onClick={closeMenu}>Shop</Link>
                    <Link to="/track-order" className={`nav-link ${isActive('/track-order')}`} onClick={closeMenu}>Track Order</Link>
                    <Link to="/cart" className={`nav-link ${isActive('/cart')}`} onClick={closeMenu}>
                        Cart
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
