import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderSuccess = () => {
    const { id } = useParams();
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="container fade-in" style={{ 
            padding: isMobile ? '2rem 1rem' : '4rem 1.5rem', 
            textAlign: 'center', 
            maxWidth: '600px',
            width: '100%'
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: isMobile ? '1rem' : '1.5rem' 
            }}>
                <CheckCircle size={isMobile ? 48 : 64} color="var(--success)" />
            </div>
            
            <h1 style={{ 
                fontSize: isMobile ? '1.75rem' : '2.5rem', 
                marginBottom: isMobile ? '0.75rem' : '1rem',
                lineHeight: 1.2
            }}>
                Order Placed!
            </h1>
            
            <p style={{ 
                color: 'var(--text-light)', 
                marginBottom: isMobile ? '1.5rem' : '2rem', 
                fontSize: isMobile ? '1rem' : '1.1rem',
                lineHeight: 1.6
            }}>
                Thank you for your purchase. Your order has been received and is being processed.
            </p>

            <div className="card" style={{ 
                padding: isMobile ? '1.5rem' : '2rem', 
                marginBottom: isMobile ? '1.5rem' : '2rem', 
                background: '#f0fdf4', 
                borderColor: '#bbf7d0', 
                border: '1px solid',
                textAlign: 'center'
            }}>
                <p style={{ 
                    marginBottom: '0.5rem', 
                    fontWeight: '500',
                    fontSize: isMobile ? '0.9rem' : '1rem'
                }}>
                    Your Order ID
                </p>
                
                <div style={{ 
                    fontSize: isMobile ? '1.1rem' : '1.5rem', 
                    fontWeight: 'bold', 
                    fontFamily: 'monospace', 
                    letterSpacing: '1px',
                    wordBreak: 'break-all',
                    padding: isMobile ? '0.5rem' : '1rem',
                    background: 'white',
                    borderRadius: '0.5rem',
                    border: '1px solid #e2e8f0',
                    margin: '0.5rem 0'
                }}>
                    {id}
                </div>
                
                <p style={{ 
                    fontSize: isMobile ? '0.8rem' : '0.9rem', 
                    color: '#64748b', 
                    marginTop: '1rem',
                    lineHeight: 1.5
                }}>
                    Save this ID to track your order status.
                </p>
            </div>

            <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '0.75rem' : '1rem', 
                justifyContent: 'center',
                alignItems: 'stretch',
                width: '100%'
            }}>
                <Link 
                    to={`/track-order?id=${id}`} 
                    className="btn btn-primary"
                    style={{
                        width: isMobile ? '100%' : 'auto',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        padding: isMobile ? '0.75rem 1.5rem' : '1rem 2rem'
                    }}
                >
                    Track Order
                </Link>
                
                <Link 
                    to="/" 
                    className="btn btn-outline"
                    style={{
                        width: isMobile ? '100%' : 'auto',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        padding: isMobile ? '0.75rem 1.5rem' : '1rem 2rem'
                    }}
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccess;