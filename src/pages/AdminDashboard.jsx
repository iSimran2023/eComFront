import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { toast } from "sonner";
import getImageUrl from "../utils/imageHelper";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    customizationFee: 5,
    allowCustomization: true,
    isFeatured: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [settings, setSettings] = useState({
    deliveryInsideValley: 50,
    deliveryOutsideValley: 150,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) navigate("/admin");
    fetchData();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "orders") {
        const res = await api.get("/orders");
        setOrders(res.data);
      } else if (activeTab === "products") {
        const res = await api.get("/products");
        setProducts(res.data);
      } else if (activeTab === "settings") {
  const settingsRes = await api.get("/settings");
  setSettings(settingsRes.data);

  const productsRes = await api.get("/products");
  setProducts(productsRes.data);
}

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      fetchData();
      toast.success("Order status updated");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      let imagePath = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const upload = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imagePath = upload.data.filePath;
      }

      await api.post("/products", { ...newProduct, image: imagePath });
      setNewProduct({
        name: "",
        price: "",
        description: "",
        image: "",
        isFeatured: false,
        customizationFee: 5,
        allowCustomization: true,
      });
      setImageFile(null);
      fetchData();
      toast.success("Product Added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
      toast.success("Product deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleQuickUpdate = async (id, data) => {
    try {
      await api.patch(`/products/${id}`, data);
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, ...data } : p))
      );
      toast.success("Updated");
    } catch (err) {
      console.error("Update error detail:", err);
      toast.error(
        "Update failed: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await api.post("/settings", settings);
      toast.success("Settings updated successfully");
    } catch (err) {
      toast.error("Failed to update settings");
    }
  };

  return (
    <div
      className="container fade-in"
      style={{
        padding: isMobile ? "1rem 1rem" : "2rem 1.5rem",
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          marginBottom: isMobile ? "1.5rem" : "2rem",
          gap: isMobile ? "1rem" : "0",
        }}
      >
        <h1
          style={{
            fontSize: isMobile ? "1.5rem" : "2rem",
            margin: 0,
          }}
        >
          Admin Dashboard
        </h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
          className="btn btn-outline"
          style={{
            width: isMobile ? "100%" : "auto",
            fontSize: isMobile ? "0.9rem" : "1rem",
          }}
        >
          Logout
        </button>
      </div>

      {/* Stats Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: isMobile ? "0.75rem" : "1rem",
          marginBottom: isMobile ? "1.5rem" : "2rem",
        }}
      >
        <div
          className="card"
          style={{
            padding: isMobile ? "1rem" : "1.5rem",
            textAlign: "center",
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              fontSize: isMobile ? "1.25rem" : "1.5rem",
              fontWeight: "bold",
            }}
          >
            {orders.length}
          </div>
          <div
            style={{
              color: "#64748b",
              fontSize: isMobile ? "0.8rem" : "0.9rem",
            }}
          >
            Total Orders
          </div>
        </div>
        <div
          className="card"
          style={{
            padding: isMobile ? "1rem" : "1.5rem",
            textAlign: "center",
            borderTop: "4px solid #f59e0b",
          }}
        >
          <div
            style={{
              fontSize: isMobile ? "1.25rem" : "1.5rem",
              fontWeight: "bold",
              color: "#f59e0b",
            }}
          >
            {orders.filter((o) => o.status === "Pending").length}
          </div>
          <div
            style={{
              color: "#64748b",
              fontSize: isMobile ? "0.8rem" : "0.9rem",
            }}
          >
            Pending
          </div>
        </div>
        <div
          className="card"
          style={{
            padding: isMobile ? "1rem" : "1.5rem",
            textAlign: "center",
            borderTop: "4px solid #3b82f6",
          }}
        >
          <div
            style={{
              fontSize: isMobile ? "1.25rem" : "1.5rem",
              fontWeight: "bold",
              color: "#3b82f6",
            }}
          >
            {orders.filter((o) => o.status === "Processing").length}
          </div>
          <div
            style={{
              color: "#64748b",
              fontSize: isMobile ? "0.8rem" : "0.9rem",
            }}
          >
            Processing
          </div>
        </div>
        <div
          className="card"
          style={{
            padding: isMobile ? "1rem" : "1.5rem",
            textAlign: "center",
            borderTop: "4px solid #10b981",
          }}
        >
          <div
            style={{
              fontSize: isMobile ? "1.25rem" : "1.5rem",
              fontWeight: "bold",
              color: "#10b981",
            }}
          >
            {orders.filter((o) => o.status === "Delivered").length}
          </div>
          <div
            style={{
              color: "#64748b",
              fontSize: isMobile ? "0.8rem" : "0.9rem",
            }}
          >
            Delivered
          </div>
        </div>
      </div>

      {/* Tab Buttons */}
      <div
        style={{
          display: "flex",
          gap: isMobile ? "0.5rem" : "1rem",
          marginBottom: isMobile ? "1.5rem" : "2rem",
          flexWrap: "wrap",
        }}
      >
        <button
          className={`btn ${
            activeTab === "orders" ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => setActiveTab("orders")}
          style={{
            flex: isMobile ? 1 : "none",
            fontSize: isMobile ? "0.9rem" : "1rem",
            padding: isMobile ? "0.5rem 1rem" : "0.75rem 1.5rem",
          }}
        >
          Orders
        </button>
        <button
          className={`btn ${
            activeTab === "products" ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => setActiveTab("products")}
          style={{
            flex: isMobile ? 1 : "none",
            fontSize: isMobile ? "0.9rem" : "1rem",
            padding: isMobile ? "0.5rem 1rem" : "0.75rem 1.5rem",
          }}
        >
          Products
        </button>
        <button
          className={`btn ${
            activeTab === "settings" ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => setActiveTab("settings")}
          style={{
            flex: isMobile ? 1 : "none",
            fontSize: isMobile ? "0.9rem" : "1rem",
            padding: isMobile ? "0.5rem 1rem" : "0.75rem 1.5rem",
          }}
        >
          Settings
        </button>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          Loading...
        </div>
      ) : (
        <>
        {activeTab === 'settings' && (
                        <div className="card" style={{ padding: '2rem', maxWidth: '600px' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Global Settings</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Inside Kathmandu Valley Delivery (NPR)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={settings.deliveryInsideValley || ''}
                                        onChange={e => setSettings({ ...settings, deliveryInsideValley: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Outside Valley Delivery (NPR)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={settings.deliveryOutsideValley || ''}
                                        onChange={e => setSettings({ ...settings, deliveryOutsideValley: Number(e.target.value) })}
                                    />
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleUpdateSettings}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Save Settings
                                </button>
                            </div>
                        </div>
                    )}
          {activeTab === "orders" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="card"
                  style={{
                    padding: isMobile ? "1rem" : "1.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      justifyContent: "space-between",
                      marginBottom: isMobile ? "0.75rem" : "1rem",
                      gap: isMobile ? "0.75rem" : "0",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: isMobile ? "1rem" : "1.1rem",
                          margin: 0,
                        }}
                      >
                        Order #{order._id.slice(-6)}
                      </h3>
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: isMobile ? "0.8rem" : "0.9rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <select
                      className="input"
                      style={{
                        width: isMobile ? "100%" : "auto",
                        fontSize: isMobile ? "0.9rem" : "1rem",
                      }}
                      value={order.status}
                      onChange={(e) =>
                        handleStatusUpdate(order._id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>

                  <div
                    style={{
                      marginBottom: "1rem",
                      fontSize: isMobile ? "0.9rem" : "1rem",
                    }}
                  >
                    <div>
                      <strong>Customer:</strong> {order.customerName}
                    </div>
                    <div>
                      <strong>Phone:</strong> {order.phone}
                    </div>
                    <div style={{ wordBreak: "break-word" }}>
                      <strong>Address:</strong> {order.address}
                    </div>
                    {order.deliveryRegion && (
                      <div
                        style={{
                          fontSize: isMobile ? "0.8rem" : "0.85rem",
                          color: "#64748b",
                          marginTop: "0.25rem",
                        }}
                      >
                        Region: {order.deliveryRegion} (Charge: NPR{" "}
                        {order.deliveryCharge?.toFixed(2)})
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                    }}
                  >
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          flexDirection: isMobile ? "column" : "row",
                          gap: isMobile ? "0.5rem" : "1rem",
                          marginBottom: "1rem",
                          borderBottom:
                            i < order.items.length - 1
                              ? "1px solid #e2e8f0"
                              : "none",
                          paddingBottom: "0.5rem",
                        }}
                      >
                        {item.product?.image && (
                          <img
                            src={getImageUrl(item.product.image)}
                            alt={item.product.name}
                            style={{
                              width: isMobile ? "20%" : "20px",
                              height: isMobile ? "600px" : "60px",
                              maxHeight: isMobile ? "200px" : "60px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: "bold",
                              fontSize: isMobile ? "0.95rem" : "1rem",
                            }}
                          >
                            {item.product?.name} (x{item.quantity})
                          </div>
                          <div
                            style={{
                              fontSize: isMobile ? "0.8rem" : "0.85rem",
                              color: "#64748b",
                              marginTop: "0.25rem",
                            }}
                          >
                            {item.customization.text && (
                              <div style={{ marginBottom: "0.25rem" }}>
                                <strong>Text:</strong> "
                                {item.customization.text}"
                              </div>
                            )}
                            {item.customization.logoPath && (
                              <div style={{ marginTop: "0.25rem" }}>
                                <a
                                  href={getImageUrl(
                                    item.customization.logoPath
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    color: "blue",
                                    textDecoration: "underline",
                                    fontSize: isMobile ? "0.8rem" : "0.85rem",
                                  }}
                                >
                                  View Logo
                                </a>
                              </div>
                            )}
                            {item.customization.hasFee &&
                              (() => {
                                const fee =
                                  item.customization.customizationFee ??
                                  item.product?.customizationFee ??
                                  5;
                                return fee > 0 ? (
                                  <div
                                    style={{
                                      color: "var(--accent)",
                                      fontWeight: "bold",
                                      marginTop: "0.25rem",
                                      fontSize: isMobile ? "0.8rem" : "0.85rem",
                                    }}
                                  >
                                    + NPR {fee.toFixed(2)} Customization Charge
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      color: "var(--accent)",
                                      fontWeight: "bold",
                                      marginTop: "0.25rem",
                                      fontSize: isMobile ? "0.7rem" : "0.75rem",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    Customized
                                  </div>
                                );
                              })()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: "1rem",
                      borderTop: "2px solid #e2e8f0",
                      paddingTop: "1rem",
                      fontSize: isMobile ? "0.85rem" : "0.9rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <span style={{ color: "#64748b" }}>Items Subtotal</span>
                      <span>
                        + NPR{" "}
                        {(
                          order.totalAmount -
                          (order.deliveryCharge || 0) -
                          order.items.reduce(
                            (sum, item) =>
                              sum + (item.customization?.customizationFee || 0),
                            0
                          )
                        ).toFixed(2)}
                      </span>
                    </div>
                    {order.items.some((i) => i.customization?.hasFee) && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>
                          Customize Charges
                        </span>
                        <span>
                          + NPR{" "}
                          {order.items
                            .reduce(
                              (sum, item) =>
                                sum +
                                (item.customization?.customizationFee || 0),
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span style={{ color: "#64748b" }}>
                        Delivery Fee ({order.deliveryRegion || "Regular"})
                      </span>
                      <span>
                        + NPR {(order.deliveryCharge || 0).toFixed(2)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: "bold",
                        fontSize: isMobile ? "1rem" : "1.1rem",
                        marginTop: "0.5rem",
                        borderTop: "1px solid #e2e8f0",
                        paddingTop: "0.5rem",
                      }}
                    >
                      <span>Total Amount</span>
                      <span>NPR {order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "products" && (
            <div>
              {/* Add Product Form */}
              <div
                className="card"
                style={{
                  padding: isMobile ? "1rem" : "1.5rem",
                  marginBottom: isMobile ? "1.5rem" : "2rem",
                }}
              >
                <h3
                  style={{
                    fontSize: isMobile ? "1.25rem" : "1.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  Add New Product
                </h3>
                <form
                  onSubmit={handleAddProduct}
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: isMobile ? "0.75rem" : "1rem",
                  }}
                >
                  <input
                    className="input"
                    placeholder="Name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    required
                    style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                  />
                  <input
                    className="input"
                    type="number"
                    placeholder="Price"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    required
                    style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                  />
                  <input
                    className="input"
                    placeholder="Description"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                    style={{
                      gridColumn: isMobile ? "span 1" : "span 2",
                      fontSize: isMobile ? "0.9rem" : "1rem",
                    }}
                  />
                  <input
                    className="input"
                    type="number"
                    placeholder="Customization Fee (e.g. 5)"
                    value={newProduct.customizationFee}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        customizationFee: e.target.value,
                      })
                    }
                    style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                  />
                  <input
                    className="input"
                    type="file"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    required
                    style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                  />
                  <label
                    style={{
                      gridColumn: isMobile ? "span 1" : "span 2",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      background: "#f8fafc",
                      padding: "0.5rem",
                      borderRadius: "0.5rem",
                      fontSize: isMobile ? "0.9rem" : "1rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={newProduct.allowCustomization}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          allowCustomization: e.target.checked,
                        })
                      }
                    />
                    <strong>Enable Customization</strong> (Allow users to add
                    text/logo)
                  </label>
                  <label
                    style={{
                      gridColumn: isMobile ? "span 1" : "span 2",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: isMobile ? "0.9rem" : "1rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={newProduct.isFeatured || false}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          isFeatured: e.target.checked,
                        })
                      }
                    />
                    Featured Product (Show on Homepage)
                  </label>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      gridColumn: isMobile ? "span 1" : "span 2",
                      fontSize: isMobile ? "0.9rem" : "1rem",
                    }}
                  >
                    Add Product
                  </button>
                </form>
              </div>

              {/* Product List - ORIGINAL PRODUCT CARD INTERFACE MAINTAINED */}
              <div
                className="grid-cols-4"
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: isMobile ? "1rem" : "1.5rem",
                }}
              >
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="card"
                    style={{
                      padding: "1rem",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        height: "150px",
                        background: "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      {product.image && (
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          style={{
                            maxHeight: "100%",
                            maxWidth: "100%",
                            objectFit: "contain",
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        marginTop: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: "bold" }}>
                            NPR {product.price}
                          </span>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#64748b",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            Fee:{" "}
                            <input
                              type="number"
                              defaultValue={
                                product.customizationFee !== undefined
                                  ? product.customizationFee
                                  : 5
                              }
                              onBlur={(e) =>
                                handleQuickUpdate(product._id, {
                                  customizationFee: Number(e.target.value),
                                })
                              }
                              style={{
                                width: "50px",
                                padding: "2px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "4px",
                              }}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          style={{
                            color: "red",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          handleQuickUpdate(product._id, {
                            isFeatured: !product.isFeatured,
                          })
                        }
                        className={`btn ${
                          product.isFeatured ? "btn-primary" : "btn-outline"
                        }`}
                        style={{
                          width: "100%",
                          fontSize: "0.8rem",
                          padding: "0.5rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {product.isFeatured ? "Featured ✓" : "Set as Featured"}
                      </button>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.25rem",
                          fontSize: "0.85rem",
                        }}
                      >
                        Price (NPR)
                      </label>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.75rem",
                          marginTop: "0.25rem",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={product.allowCustomization !== false}
                          onChange={(e) =>
                            handleQuickUpdate(product._id, {
                              allowCustomization: e.target.checked,
                            })
                          }
                        />
                        Customizable
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
