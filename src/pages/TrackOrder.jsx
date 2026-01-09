import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import { Search, Package, Truck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import getImageUrl from '../utils/imageHelper';

const TrackOrder = () => {
    const [searchParams] = useSearchParams();
    const [orderId, setOrderId] = useState(searchParams.get('id') || '');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleTrack = async (e) => {
        if (e) e.preventDefault();
        if (!orderId) return;

        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const res = await api.get(`/orders/${orderId}`);
            setOrder(res.data);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 403) {
                setError('Tracking for this order has expired (older than 7 days).');
            } else if (err.response?.status === 404) {
                setError('Order not found. Please check the ID.');
            } else {
                setError('Failed to track order. Try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Auto-track if ID is in URL
    useEffect(() => {
        if (searchParams.get('id')) {
            handleTrack();
        }
    }, []);

    const getStatusStep = (status) => {
        switch (status) {
            case 'Pending': return 1;
            case 'Processing': return 2;
            case 'Delivered': return 3;
            default: return 0;
        }
    };

    return (
        <div className="container fade-in" style={{ 
            padding: isMobile ? '1rem 1rem' : '2rem 1.5rem', 
            maxWidth: '800px',
            width: '100%'
        }}>
            <h1 style={{ 
                fontSize: isMobile ? '1.75rem' : '2rem', 
                marginBottom: isMobile ? '1.5rem' : '2rem', 
                textAlign: 'center' 
            }}>
                Track Your Order
            </h1>

            <div className="card" style={{ 
                padding: isMobile ? '1.5rem' : '2rem', 
                marginBottom: isMobile ? '1.5rem' : '2rem' 
            }}>
                <form onSubmit={handleTrack} style={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '1rem' : '1rem',
                    alignItems: 'stretch'
                }}>
                    <input
                        type="text"
                        className="input"
                        placeholder="Enter Order ID"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        required
                        style={{
                            fontSize: isMobile ? '0.9rem' : '1rem'
                        }}
                    />
                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={loading}
                        style={{
                            fontSize: isMobile ? '0.9rem' : '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: isMobile ? '0.75rem' : '0.75rem 1.5rem'
                        }}
                    >
                        {loading ? 'Tracking...' : (
                            <>
                                <Search size={isMobile ? 16 : 18} style={{ marginRight: '0.5rem' }} /> 
                                Track
                            </>
                        )}
                    </button>
                </form>
                {error && (
                    <div style={{ 
                        marginTop: '1rem', 
                        color: '#ef4444', 
                        background: '#fef2f2', 
                        padding: '1rem', 
                        borderRadius: '0.5rem',
                        fontSize: isMobile ? '0.9rem' : '1rem'
                    }}>
                        {error}
                    </div>
                )}
            </div>

            {order && (
                <div className="card fade-in" style={{ 
                    padding: isMobile ? '1.5rem' : '2rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between', 
                        alignItems: isMobile ? 'flex-start' : 'center',
                        marginBottom: isMobile ? '1.5rem' : '2rem',
                        gap: isMobile ? '1rem' : '0'
                    }}>
                        <div>
                            <h2 style={{ 
                                fontSize: isMobile ? '1.25rem' : '1.5rem',
                                marginBottom: '0.25rem'
                            }}>
                                Order #{order._id.slice(-6)}
                            </h2>
                            <p style={{ 
                                color: '#64748b',
                                fontSize: isMobile ? '0.9rem' : '1rem'
                            }}>
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div style={{ 
                            padding: '0.5rem 1rem', 
                            borderRadius: '2rem', 
                            background: 'var(--primary)', 
                            color: 'white', 
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.9rem' : '1rem'
                        }}>
                            {order.status}
                        </div>
                    </div>

                    {/* Status Progress */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        position: 'relative', 
                        marginBottom: isMobile ? '2rem' : '3rem',
                        margin: isMobile ? '0 0.5rem' : '0 1rem'
                    }}>
                        {/* Connecting Line */}
                        <div style={{ 
                            position: 'absolute', 
                            top: isMobile ? '15px' : '20px', 
                            left: isMobile ? '20px' : '0', 
                            right: isMobile ? '20px' : '0', 
                            height: '4px', 
                            background: '#e2e8f0', 
                            zIndex: 0 
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            top: isMobile ? '15px' : '20px',
                            left: isMobile ? '20px' : '0',
                            height: '4px',
                            background: 'var(--success)',
                            zIndex: 0,
                            width: order.status === 'Pending' ? '0%' : order.status === 'Processing' ? '50%' : '100%',
                            transition: 'width 0.5s',
                            right: isMobile ? '20px' : '0'
                        }}></div>

                        {/* Steps */}
                        <div style={{ 
                            zIndex: 1, 
                            textAlign: 'center',
                            flex: 1,
                            minWidth: '80px'
                        }}>
                            <div style={{
                                width: isMobile ? '30px' : '40px', 
                                height: isMobile ? '30px' : '40px', 
                                borderRadius: '50%',
                                background: getStatusStep(order.status) >= 1 ? 'var(--success)' : '#e2e8f0',
                                color: 'white', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                margin: '0 auto 0.5rem'
                            }}>
                                <Package size={isMobile ? 16 : 20} />
                            </div>
                            <div style={{ 
                                fontWeight: 500,
                                fontSize: isMobile ? '0.85rem' : '1rem'
                            }}>Pending</div>
                        </div>

                        <div style={{ 
                            zIndex: 1, 
                            textAlign: 'center',
                            flex: 1,
                            minWidth: '80px'
                        }}>
                            <div style={{
                                width: isMobile ? '30px' : '40px', 
                                height: isMobile ? '30px' : '40px', 
                                borderRadius: '50%',
                                background: getStatusStep(order.status) >= 2 ? 'var(--success)' : '#e2e8f0',
                                color: 'white', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                margin: '0 auto 0.5rem'
                            }}>
                                <Truck size={isMobile ? 16 : 20} />
                            </div>
                            <div style={{ 
                                fontWeight: 500,
                                fontSize: isMobile ? '0.85rem' : '1rem'
                            }}>Processing</div>
                        </div>

                        <div style={{ 
                            zIndex: 1, 
                            textAlign: 'center',
                            flex: 1,
                            minWidth: '80px'
                        }}>
                            <div style={{
                                width: isMobile ? '30px' : '40px', 
                                height: isMobile ? '30px' : '40px', 
                                borderRadius: '50%',
                                background: getStatusStep(order.status) >= 3 ? 'var(--success)' : '#e2e8f0',
                                color: 'white', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                margin: '0 auto 0.5rem'
                            }}>
                                <CheckCircle size={isMobile ? 16 : 20} />
                            </div>
                            <div style={{ 
                                fontWeight: 500,
                                fontSize: isMobile ? '0.85rem' : '1rem'
                            }}>Delivered</div>
                        </div>
                    </div>

                    <div style={{ 
                        background: '#f8fafc', 
                        padding: isMobile ? '1rem' : '1.5rem', 
                        borderRadius: '0.5rem' 
                    }}>
                        <h3 style={{ 
                            marginBottom: isMobile ? '0.75rem' : '1rem',
                            fontSize: isMobile ? '1.1rem' : '1.25rem'
                        }}>
                            Order Details
                        </h3>
                        {order.items.map((item, i) => (
                            <div key={i} style={{ 
                                display: 'flex', 
                                flexDirection: isMobile ? 'column' : 'row',
                                gap: isMobile ? '0.75rem' : '1rem', 
                                marginBottom: isMobile ? '1rem' : '1rem', 
                                borderBottom: '1px solid #e2e8f0', 
                                paddingBottom: isMobile ? '1rem' : '1rem' 
                            }}>
                                {item.product?.image && (
                                    <img
                                        src={getImageUrl(item.product.image)}
                                        alt={item.product?.name}
                                        style={{ 
                                            width: isMobile ? '20%' : '20px', 
                                            height: isMobile ? '600px' : '60px',
                                            maxHeight: isMobile ? '200px' : '60px',
                                            objectFit: 'cover', 
                                            borderRadius: '8px' 
                                        }}
                                    />
                                )}
                                <div style={{ flex: 1, width: '100%' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        flexDirection: isMobile ? 'column' : 'row',
                                        justifyContent: 'space-between', 
                                        marginBottom: isMobile ? '0.5rem' : '0.25rem',
                                        gap: isMobile ? '0.25rem' : '0'
                                    }}>
                                        <span style={{ 
                                            fontWeight: 600,
                                            fontSize: isMobile ? '0.95rem' : '1rem'
                                        }}>
                                            {item.product?.name || 'Product'} (x{item.quantity})
                                        </span>
                                        <span style={{
                                            fontSize: isMobile ? '0.9rem' : '1rem'
                                        }}>
                                            NPR {((item.product?.price || 0) * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                    <div style={{ 
                                        fontSize: isMobile ? '0.8rem' : '0.85rem', 
                                        color: '#64748b' 
                                    }}>
                                        {item.customization?.text && (
                                            <div style={{ marginBottom: '0.25rem' }}>
                                                <strong>Text:</strong> "{item.customization.text}"
                                            </div>
                                        )}
                                        {item.customization?.logoPath && (
                                            <div style={{ marginTop: '0.25rem' }}>
                                                <a 
                                                    href={getImageUrl(item.customization.logoPath)} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    style={{ 
                                                        color: 'var(--primary)', 
                                                        textDecoration: 'underline',
                                                        fontSize: isMobile ? '0.8rem' : '0.85rem'
                                                    }}
                                                >
                                                    View Logo
                                                </a>
                                            </div>
                                        )}
                                        {item.customization?.hasFee && (() => {
                                            const fee = item.customization.customizationFee ?? item.product?.customizationFee ?? 5;
                                            return fee > 0 ? (
                                                <div style={{ 
                                                    color: 'var(--accent)', 
                                                    fontWeight: 600, 
                                                    marginTop: '0.25rem', 
                                                    fontSize: isMobile ? '0.8rem' : '0.85rem' 
                                                }}>
                                                    + NPR {fee.toFixed(2)} Customization Charge
                                                </div>
                                            ) : (
                                                <div style={{ 
                                                    color: 'var(--accent)', 
                                                    fontWeight: 600, 
                                                    marginTop: '0.25rem', 
                                                    fontSize: isMobile ? '0.7rem' : '0.75rem', 
                                                    textTransform: 'uppercase' 
                                                }}>
                                                    Customized
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* Order Summary Breakout */}
                        <div style={{ 
                            marginTop: isMobile ? '1rem' : '1.5rem', 
                            borderTop: '2px solid #e2e8f0', 
                            paddingTop: isMobile ? '0.75rem' : '1rem' 
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                marginBottom: '0.5rem',
                                fontSize: isMobile ? '0.9rem' : '1rem'
                            }}>
                                <span style={{ color: '#64748b' }}>Items Subtotal</span>
                                <span>+ NPR {(order.totalAmount - (order.deliveryCharge || 0) - (order.items.reduce((sum, item) => sum + (item.customization?.customizationFee || 0), 0))).toFixed(2)}</span>
                            </div>

                            {/* Customize Charges */}
                            {order.items.some(i => i.customization?.hasFee) && (
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    marginBottom: '0.5rem', 
                                    color: 'var(--accent)',
                                    fontSize: isMobile ? '0.9rem' : '1rem'
                                }}>
                                    <span style={{ fontWeight: 500 }}>Customize Charges</span>
                                    <span>+ NPR {order.items.reduce((sum, item) => sum + (item.customization?.customizationFee || 0), 0).toFixed(2)}</span>
                                </div>
                            )}

                            {/* Delivery Fee */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                marginBottom: '0.5rem', 
                                color: '#64748b',
                                fontSize: isMobile ? '0.9rem' : '1rem'
                            }}>
                                <span>Delivery Fee ({order.deliveryRegion || 'Regular'})</span>
                                <span>+ NPR {(order.deliveryCharge || 0).toFixed(2)}</span>
                            </div>

                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                marginTop: '1rem', 
                                fontWeight: 'bold', 
                                fontSize: isMobile ? '1.1rem' : '1.2rem', 
                                color: 'var(--text-color)' 
                            }}>
                                <span>Total Amount</span>
                                <span>NPR {order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Recent Orders History */}
            <div style={{ marginTop: isMobile ? '2rem' : '3rem' }}>
                <h3 style={{ 
                    fontSize: isMobile ? '1.1rem' : '1.25rem', 
                    marginBottom: isMobile ? '0.75rem' : '1rem' 
                }}>
                    Recent Orders
                </h3>
                {!localStorage.getItem('my_orders') ? (
                    <p style={{ 
                        color: '#64748b',
                        textAlign: 'center',
                        padding: '1rem'
                    }}>
                        No recent orders found.
                    </p>
                ) : (
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: isMobile ? '0.75rem' : '0.5rem' 
                    }}>
                        {JSON.parse(localStorage.getItem('my_orders') || '[]').map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => { setOrderId(item.id); handleTrack(); }}
                                className="card"
                                style={{
                                    padding: isMobile ? '0.75rem' : '1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    justifyContent: 'space-between',
                                    alignItems: isMobile ? 'flex-start' : 'center',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: 'none',
                                    gap: isMobile ? '0.5rem' : '0'
                                }}
                            >
                                <div style={{ width: '100%' }}>
                                    <div style={{ 
                                        fontWeight: '500',
                                        fontSize: isMobile ? '0.9rem' : '1rem'
                                    }}>
                                        Order #{item.id.slice(-6)}
                                    </div>
                                    <div style={{ 
                                        fontSize: '0.8rem', 
                                        color: '#64748b',
                                        marginTop: '0.25rem'
                                    }}>
                                        {new Date(item.date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{ 
                                    fontWeight: 'bold',
                                    fontSize: isMobile ? '1rem' : '1.1rem',
                                    alignSelf: isMobile ? 'flex-start' : 'center'
                                }}>
                                    NPR {item.total.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;