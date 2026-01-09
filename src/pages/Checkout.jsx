import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'sonner';

const Checkout = () => {
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customerName: '',
        address: '',
        phone: '',
        deliveryRegion: 'Inside Valley' // Default
    });
    const [submitting, setSubmitting] = useState(false);
    const [deliveryFees, setDeliveryFees] = useState({
        'Inside Valley': 50,
        'Outside Valley': 150
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings');
                if (res.data) {
                    setDeliveryFees({
                        'Inside Valley': res.data.deliveryInsideValley || 50,
                        'Outside Valley': res.data.deliveryOutsideValley || 150
                    });
                }
            } catch (err) {
                console.error('Failed to fetch delivery settings:', err);
                toast.error('Failed to load delivery fees. Using default rates.');
            }
        };
        fetchSettings();
    }, []);

    const itemsTotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    const customizeTotal = cart.reduce((sum, item) => {
        const fee = item.customization?.hasFee ? (item.product?.customizationFee !== undefined ? item.product.customizationFee : 5) : 0;
        return sum + fee;
    }, 0);
    const subtotal = itemsTotal + customizeTotal;

    const totalWithDelivery = subtotal + (deliveryFees[formData.deliveryRegion] || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const orderData = {
            ...formData,
            items: cart.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                customization: {
                    ...item.customization,
                    customizationFee: item.customization?.hasFee ? (item.product?.customizationFee !== undefined ? item.product.customizationFee : 5) : 0
                }
            })),
            totalAmount: totalWithDelivery,
            deliveryCharge: deliveryFees[formData.deliveryRegion]
        };

        try {
            const res = await api.post('/orders', orderData);
            toast.success('Order Placed Successfully!');
            clearCart();
            
            if (res.data && res.data._id) {
                const history = JSON.parse(localStorage.getItem('my_orders') || '[]');
                history.unshift({
                    id: res.data._id,
                    date: new Date().toISOString(),
                    total: totalWithDelivery
                });
                localStorage.setItem('my_orders', JSON.stringify(history.slice(0, 10)));
                navigate(`/order-success/${res.data._id}`);
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to place order.');
        } finally {
            setSubmitting(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="container fade-in" style={{ padding: '2rem 0', maxWidth: '800px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Checkout</h1>
                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Your cart is empty</p>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => navigate('/')}
                        style={{ marginTop: '1rem' }}
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container fade-in" style={{ padding: '2rem 0', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Checkout</h1>

            <div className="card checkout-layout" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name</label>
                        <input
                            type="text"
                            className="input"
                            required
                            value={formData.customerName}
                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                            placeholder="Enter your full name"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Delivery Address</label>
                        <textarea
                            className="input"
                            rows="3"
                            required
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Enter complete delivery address"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Phone Number</label>
                        <input
                            type="tel"
                            className="input"
                            required
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>Delivery Region</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="region"
                                    value="Inside Valley"
                                    checked={formData.deliveryRegion === 'Inside Valley'}
                                    onChange={e => setFormData({ ...formData, deliveryRegion: e.target.value })}
                                />
                                Inside Kathmandu Valley (NPR {deliveryFees['Inside Valley'].toFixed(2)})
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="region"
                                    value="Outside Valley"
                                    checked={formData.deliveryRegion === 'Outside Valley'}
                                    onChange={e => setFormData({ ...formData, deliveryRegion: e.target.value })}
                                />
                                Outside Valley (NPR {deliveryFees['Outside Valley'].toFixed(2)})
                            </label>
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>Order Summary</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Items Subtotal</span>
                            <span>NPR {itemsTotal.toFixed(2)}</span>
                        </div>
                        {customizeTotal > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--accent)' }}>
                                <span>Customization Charges</span>
                                <span>+ NPR {customizeTotal.toFixed(2)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Delivery Fee ({formData.deliveryRegion})</span>
                            <span>+ NPR {deliveryFees[formData.deliveryRegion]?.toFixed(2) || '0.00'}</span>
                        </div>
                        <hr style={{ margin: '1rem 0', borderColor: '#e2e8f0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold' }}>
                            <span>Total Amount</span>
                            <span>NPR {totalWithDelivery.toFixed(2)}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={() => navigate(-1)}
                            disabled={submitting}
                        >
                            Back to Cart
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;