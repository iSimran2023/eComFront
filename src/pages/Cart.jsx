import React from 'react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import api from '../api';
import getImageUrl from '../utils/imageHelper';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity } = useCart();
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const subtotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    const totalFees = cart.reduce((sum, item) => sum + (item.customization.hasFee ? (item.product?.customizationFee !== undefined ? item.product.customizationFee : 5) : 0), 0);
    const finalTotal = subtotal + totalFees;

    if (cart.length === 0) {
        return (
            <div className="container fade-in" style={{ 
                padding: isMobile ? '3rem 1rem' : '4rem 1.5rem', 
                textAlign: 'center' 
            }}>
                <h2 style={{ 
                    marginBottom: isMobile ? '1rem' : '1.5rem',
                    fontSize: isMobile ? '1.5rem' : '2rem'
                }}>
                    Your Cart is Empty
                </h2>
                <Link to="/shop" className="btn btn-primary" style={{
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    padding: isMobile ? '0.75rem 1.5rem' : '1rem 2rem'
                }}>
                    Go Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container fade-in" style={{ 
            padding: isMobile ? '1rem 1rem' : '2rem 1.5rem'
        }}>
            <h1 style={{ 
                fontSize: isMobile ? '1.5rem' : '2rem', 
                marginBottom: isMobile ? '1.5rem' : '2rem' 
            }}>
                Shopping Cart
            </h1>

            <div className="cart-layout" style={{ 
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '1.5rem' : '2rem'
            }}>
                <div style={{ 
                    flex: isMobile ? 'none' : 2,
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: isMobile ? '1rem' : '1rem',
                    width: '100%'
                }}>
                    {cart.map((item, index) => (
                        <div key={index} className="card" style={{ 
                            padding: isMobile ? '0.75rem' : '1rem', 
                            display: 'flex', 
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? '0.75rem' : '1rem', 
                            alignItems: isMobile ? 'stretch' : 'center',
                            position: 'relative'
                        }}>
                            {/* Product Image */}
                            <div style={{ 
                                width: isMobile ? '100%' : '80px', 
                                height: isMobile ? '120px' : '80px', 
                                background: '#f1f5f9', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                borderRadius: '0.5rem',
                                flexShrink: 0
                            }}>
                                <img
                                    src={getImageUrl(item.product?.image)}
                                    alt={item.product?.name || 'Product'}
                                    style={{ 
                                        maxWidth: '100%', 
                                        maxHeight: '100%', 
                                        objectFit: 'contain' 
                                    }}
                                />
                            </div>
                            
                            {/* Product Details */}
                            <div style={{ 
                                flex: 1,
                                width: '100%'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '0.5rem'
                                }}>
                                    <h3 style={{ 
                                        fontSize: isMobile ? '1rem' : '1.1rem',
                                        margin: 0,
                                        flex: 1
                                    }}>
                                        {item.product?.name || 'Product'}
                                    </h3>
                                    <button 
                                        onClick={() => removeFromCart(index)} 
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            cursor: 'pointer', 
                                            color: '#ef4444',
                                            padding: isMobile ? '0.25rem' : '0.5rem'
                                        }}
                                    >
                                        <Trash2 size={isMobile ? 18 : 20} />
                                    </button>
                                </div>
                                
                                <div style={{ 
                                    fontSize: isMobile ? '0.8rem' : '0.9rem', 
                                    color: '#64748b', 
                                    marginTop: '0.25rem' 
                                }}>
                                    {item.customization.text && (
                                        <div style={{ marginBottom: '0.25rem' }}>Text: {item.customization.text}</div>
                                    )}
                                    {item.customization.logoPath && (
                                        <div style={{ marginBottom: '0.25rem' }}>Logo: Uploaded</div>
                                    )}
                                    {item.customization.hasFee && (() => {
                                        const fee = item.product?.customizationFee !== undefined ? item.product.customizationFee : 5;
                                        return fee > 0 ? (
                                            <div style={{ 
                                                color: 'var(--accent)', 
                                                fontWeight: '600', 
                                                marginTop: '0.25rem', 
                                                fontSize: isMobile ? '0.8rem' : '0.85rem' 
                                            }}>
                                                + NPR {fee.toFixed(2)} Customization Charge
                                            </div>
                                        ) : (
                                            <div style={{ 
                                                color: 'var(--accent)', 
                                                fontWeight: '600', 
                                                marginTop: '0.25rem', 
                                                fontSize: isMobile ? '0.7rem' : '0.75rem', 
                                                textTransform: 'uppercase' 
                                            }}>
                                                Customized
                                            </div>
                                        );
                                    })()}
                                </div>
                                
                                {/* Quantity and Price for Mobile */}
                                <div style={{
                                    display: isMobile ? 'flex' : 'none',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '0.75rem'
                                }}>
                                    {/* Quantity Controls */}
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.75rem', 
                                        background: '#f1f5f9', 
                                        padding: '0.25rem 0.5rem', 
                                        borderRadius: '0.5rem' 
                                    }}>
                                        <button
                                            onClick={() => updateQuantity(index, item.quantity - 1)}
                                            style={{ 
                                                background: 'white', 
                                                border: '1px solid #e2e8f0', 
                                                width: '28px', 
                                                height: '28px', 
                                                borderRadius: '4px', 
                                                cursor: 'pointer', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                fontSize: '1rem', 
                                                fontWeight: 'bold' 
                                            }}
                                        >
                                            -
                                        </button>
                                        <span style={{ 
                                            fontWeight: '600', 
                                            minWidth: '20px', 
                                            textAlign: 'center',
                                            fontSize: '0.9rem'
                                        }}>
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(index, item.quantity + 1)}
                                            style={{ 
                                                background: 'white', 
                                                border: '1px solid #e2e8f0', 
                                                width: '28px', 
                                                height: '28px', 
                                                borderRadius: '4px', 
                                                cursor: 'pointer', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                fontSize: '1rem', 
                                                fontWeight: 'bold' 
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
                                    
                                    {/* Price for Mobile */}
                                    <div style={{ 
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem'
                                    }}>
                                        NPR {((item.product?.price || 0) * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Quantity and Price for Desktop */}
                            <div style={{ 
                                textAlign: 'right', 
                                display: isMobile ? 'none' : 'flex',
                                flexDirection: 'column', 
                                alignItems: 'flex-end', 
                                gap: '0.5rem',
                                minWidth: '120px'
                            }}>
                                {/* Quantity Controls */}
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.75rem', 
                                    background: '#f1f5f9', 
                                    padding: '0.25rem 0.5rem', 
                                    borderRadius: '0.5rem' 
                                }}>
                                    <button
                                        onClick={() => updateQuantity(index, item.quantity - 1)}
                                        style={{ 
                                            background: 'white', 
                                            border: '1px solid #e2e8f0', 
                                            width: '24px', 
                                            height: '24px', 
                                            borderRadius: '4px', 
                                            cursor: 'pointer', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            fontSize: '1rem', 
                                            fontWeight: 'bold' 
                                        }}
                                    >
                                        -
                                    </button>
                                    <span style={{ 
                                        fontWeight: '600', 
                                        minWidth: '20px', 
                                        textAlign: 'center' 
                                    }}>
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(index, item.quantity + 1)}
                                        style={{ 
                                            background: 'white', 
                                            border: '1px solid #e2e8f0', 
                                            width: '24px', 
                                            height: '24px', 
                                            borderRadius: '4px', 
                                            cursor: 'pointer', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            fontSize: '1rem', 
                                            fontWeight: 'bold' 
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                                
                                {/* Price for Desktop */}
                                <div style={{ 
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem'
                                }}>
                                    NPR {((item.product?.price || 0) * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div style={{ 
                    flex: isMobile ? 'none' : 1,
                    width: '100%'
                }}>
                    <div className="card" style={{ 
                        padding: isMobile ? '1rem' : '1.5rem',
                        position: isMobile ? 'static' : 'sticky',
                        top: isMobile ? 'auto' : '100px'
                    }}>
                        <h3 style={{ 
                            marginBottom: isMobile ? '0.75rem' : '1rem',
                            fontSize: isMobile ? '1.1rem' : '1.25rem'
                        }}>
                            Order Summary
                        </h3>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            marginBottom: '0.5rem',
                            fontSize: isMobile ? '0.9rem' : '1rem'
                        }}>
                            <span>Items Subtotal</span>
                            <span>+ NPR {subtotal.toFixed(2)}</span>
                        </div>
                        {totalFees > 0 && (
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                marginBottom: '0.75rem', 
                                color: 'var(--accent)',
                                fontSize: isMobile ? '0.9rem' : '1rem'
                            }}>
                                <span>Customize Charges</span>
                                <span>+ NPR {totalFees.toFixed(2)}</span>
                            </div>
                        )}
                        <hr style={{ 
                            border: 'none', 
                            borderTop: '1px solid #e2e8f0', 
                            margin: isMobile ? '0.75rem 0' : '1rem 0' 
                        }} />
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            marginBottom: isMobile ? '0.75rem' : '1rem', 
                            fontWeight: 'bold', 
                            fontSize: isMobile ? '1.1rem' : '1.2rem' 
                        }}>
                            <span>Total</span>
                            <span>NPR {finalTotal.toFixed(2)}</span>
                        </div>
                        <Link 
                            to="/checkout" 
                            className="btn btn-primary" 
                            style={{ 
                                width: '100%',
                                fontSize: isMobile ? '0.9rem' : '1rem',
                                padding: isMobile ? '0.75rem' : '1rem'
                            }}
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;