import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../api';
import getImageUrl from '../utils/imageHelper';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await api.get('/products?featured=true');
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setFeaturedProducts(res.data);
                } else {
                    // Try query parameter if dedicated endpoint is empty/restricted
                    const resQuery = await api.get('/products?isFeatured=true');
                    if (Array.isArray(resQuery.data) && resQuery.data.length > 0) {
                        setFeaturedProducts(resQuery.data);
                    } else {
                        // Final fallback: fetch all and filter
                        const resAll = await api.get('/products');
                        if (Array.isArray(resAll.data)) {
                            setFeaturedProducts(resAll.data.filter(p => p.isFeatured));
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching featured products", err);
                try {
                    const resAll = await api.get('/products');
                    if (Array.isArray(resAll.data)) {
                        setFeaturedProducts(resAll.data.filter(p => p.isFeatured));
                    }
                } catch (err2) {
                    console.error("Fallback failed", err2);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    return (
        <div className="fade-in">
            {/* Hero Section */}
            <section style={{
                padding: isMobile ? '3rem 1rem' : '4rem 0',
                textAlign: 'center',
                background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)'
            }}>
                <div className="container" style={{
                    paddingLeft: isMobile ? '1rem' : '1.5rem',
                    paddingRight: isMobile ? '1rem' : '1.5rem'
                }}>
                    <h1 style={{ 
                        fontSize: isMobile ? '2.5rem' : '3.5rem', 
                        fontWeight: '800', 
                        marginBottom: isMobile ? '1rem' : '1.5rem', 
                        color: 'var(--primary)',
                        lineHeight: 1.2
                    }}>
                        Hydrate in <span style={{ color: 'var(--accent)' }}>Style</span>.
                    </h1>
                    <p style={{ 
                        fontSize: isMobile ? '1rem' : '1.2rem', 
                        color: 'var(--text-light)', 
                        maxWidth: '600px', 
                        margin: '0 auto 2rem',
                        lineHeight: 1.6
                    }}>
                        Premium custom bottles designed by you. Add your name, logo, or message to create the perfect companion for your journey.
                    </p>
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? '0.75rem' : '1rem', 
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Link to="/shop" className="btn btn-primary" style={{
                            width: isMobile ? '100%' : 'auto',
                            fontSize: isMobile ? '0.9rem' : '1rem'
                        }}>
                            Customize Now <ArrowRight size={isMobile ? 16 : 18} style={{ marginLeft: '0.5rem' }} />
                        </Link>
                        <Link to="/shop" className="btn btn-outline" style={{
                            width: isMobile ? '100%' : 'auto',
                            fontSize: isMobile ? '0.9rem' : '1rem'
                        }}>
                            Browse Collection
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Section */}
            <section className="container" style={{ 
                padding: isMobile ? '3rem 1rem' : '4rem 1.5rem'
            }}>
                <h2 style={{ 
                    fontSize: isMobile ? '1.75rem' : '2rem', 
                    marginBottom: isMobile ? '1.5rem' : '2rem', 
                    textAlign: 'center' 
                }}>
                    Featured Collections
                </h2>

                {loading ? (
                    <div style={{ textAlign: 'center' }}>Loading featured products...</div>
                ) : featuredProducts.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        color: 'var(--text-light)',
                        padding: '2rem 1rem'
                    }}>
                        No featured products yet. Please check back later or browse our{' '}
                        <Link to="/shop" style={{ color: 'var(--accent)' }}>full catalog</Link>.
                    </div>
                ) : (
                    <div className="grid-cols-4" style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: isMobile ? '1.5rem' : '2rem'
                    }}>
                        {featuredProducts.map((product) => (
                            <div key={product._id} className="card" style={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div style={{ 
                                    height: isMobile ? '200px' : '250px', 
                                    background: '#f1f5f9', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    padding: '1rem'
                                }}>
                                    <img
                                        src={getImageUrl(product.image)}
                                        alt={product.name}
                                        style={{ 
                                            maxHeight: '100%', 
                                            maxWidth: '100%', 
                                            objectFit: 'contain'
                                        }}
                                    />
                                </div>
                                <div style={{ 
                                    padding: isMobile ? '1.25rem' : '1.5rem',
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <h3 style={{ 
                                        fontSize: isMobile ? '1.1rem' : '1.25rem', 
                                        marginBottom: '0.5rem',
                                        flex: 1
                                    }}>
                                        {product.name}
                                    </h3>
                                    <p style={{ 
                                        color: 'var(--accent)', 
                                        fontWeight: 'bold', 
                                        marginBottom: isMobile ? '0.75rem' : '1rem',
                                        fontSize: isMobile ? '1rem' : '1.1rem'
                                    }}>
                                        NPR {typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                                    </p>
                                    <Link 
                                        to={`/product/${product._id}`} 
                                        className="btn btn-outline" 
                                        style={{ 
                                            width: '100%',
                                            fontSize: isMobile ? '0.9rem' : '1rem',
                                            padding: isMobile ? '0.5rem' : '0.75rem'
                                        }}
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;