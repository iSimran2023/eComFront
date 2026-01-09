import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import getImageUrl from '../utils/imageHelper';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

const Shop = () => {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products');
                setProducts(res.data);
            } catch (err) {
                console.error("Failed to fetch products", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getGridColumns = () => {
        if (isMobile) return '1fr';
        if (isTablet) return 'repeat(2, 1fr)';
        return 'repeat(4, 1fr)';
    };

    if (loading) return (
        <div className="container fade-in" style={{ 
            padding: isMobile ? '3rem 1rem' : '4rem 1.5rem', 
            textAlign: 'center' 
        }}>
            Loading...
        </div>
    );

    return (
        <div className="container fade-in" style={{ 
            padding: isMobile ? '1rem 1rem' : '2rem 1.5rem'
        }}>
            <h1 style={{ 
                fontSize: isMobile ? '1.75rem' : '2.5rem', 
                marginBottom: isMobile ? '1.5rem' : '2rem',
                textAlign: isMobile ? 'center' : 'left'
            }}>
                All Products
            </h1>

            {products.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: isMobile ? '2rem 1rem' : '4rem 1.5rem',
                    background: '#f8fafc',
                    borderRadius: '0.5rem',
                    margin: '1rem 0'
                }}>
                    <p style={{ 
                        color: '#64748b',
                        fontSize: isMobile ? '1rem' : '1.1rem'
                    }}>
                        No products found. (Admin needs to add products)
                    </p>
                </div>
            ) : (
                <div className="grid-cols-4" style={{
                    display: 'grid',
                    gridTemplateColumns: getGridColumns(),
                    gap: isMobile ? '1rem' : '1.5rem'
                }}>
                    {products.map(product => (
                        <div key={product._id} className="card" style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div style={{ 
                                height: isMobile ? '180px' : '250px', 
                                background: '#f1f5f9', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                padding: '1rem',
                                borderRadius: isMobile ? '0.25rem 0.25rem 0 0' : '0.5rem 0.5rem 0 0'
                            }}>
                                {product.image ? (
                                    <img 
                                        src={getImageUrl(product.image)} 
                                        alt={product.name} 
                                        style={{ 
                                            maxHeight: '100%', 
                                            maxWidth: '100%', 
                                            objectFit: 'contain' 
                                        }} 
                                    />
                                ) : (
                                    <span style={{ color: '#64748b', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                                        No Image
                                    </span>
                                )}
                            </div>
                            <div style={{ 
                                padding: isMobile ? '1rem' : '1.5rem',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <h3 style={{ 
                                    fontSize: isMobile ? '1.1rem' : '1.25rem', 
                                    marginBottom: '0.5rem',
                                    lineHeight: 1.3
                                }}>
                                    {product.name}
                                </h3>
                                <p style={{ 
                                    color: 'var(--accent)', 
                                    fontWeight: 'bold', 
                                    marginBottom: isMobile ? '0.75rem' : '1rem',
                                    fontSize: isMobile ? '1.1rem' : '1.25rem'
                                }}>
                                    NPR {typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                                </p>
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: isMobile ? '0.5rem' : '0.5rem',
                                    marginTop: 'auto'
                                }}>
                                    <button
                                        onClick={() => {
                                            addToCart({
                                                product,
                                                quantity: 1,
                                                customization: { text: '', instructions: '', logoPath: null, hasFee: false }
                                            });
                                            toast.success(`${product.name} added to cart!`);
                                        }}
                                        className="btn btn-primary"
                                        style={{ 
                                            width: '100%',
                                            fontSize: isMobile ? '0.9rem' : '1rem',
                                            padding: isMobile ? '0.5rem' : '0.75rem'
                                        }}
                                    >
                                        Add to Cart
                                    </button>
                                    <Link 
                                        to={`/product/${product._id}`} 
                                        className="btn btn-outline" 
                                        style={{ 
                                            width: '100%', 
                                            textAlign: 'center',
                                            fontSize: isMobile ? '0.9rem' : '1rem',
                                            padding: isMobile ? '0.5rem' : '0.75rem'
                                        }}
                                    >
                                        Customize
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Shop;