import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useCart } from "../contexts/CartContext";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import getImageUrl from "../utils/imageHelper";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1024
  );

  // Customization State
  const [text, setText] = useState("");
  const [instructions, setInstructions] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const handleAddToCart = async () => {
    setUploading(true);
    let logoPath = null;

    try {
      if (logoFile) {
        const formData = new FormData();
        formData.append("image", logoFile);
        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        logoPath = uploadRes.data.filePath;
      }

      addToCart({
        product,
        quantity: 1,
        customization: {
          text,
          instructions,
          logoPath,
          hasFee: Boolean(text.trim() || logoPath),
        },
      });

      navigate("/cart");
      toast.success("Added to cart");
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Failed to upload logo or add to cart.");
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return (
      <div
        className="container fade-in"
        style={{
          padding: isMobile ? "2rem 1rem" : "4rem 1.5rem",
          textAlign: "center",
        }}
      >
        Loading...
      </div>
    );

  if (!product)
    return (
      <div
        className="container fade-in"
        style={{
          padding: isMobile ? "2rem 1rem" : "4rem 1.5rem",
          textAlign: "center",
        }}
      >
        <h2>Product not found</h2>
        <button
          onClick={() => navigate("/shop")}
          className="btn btn-primary"
          style={{ marginTop: "1rem" }}
        >
          Browse Products
        </button>
      </div>
    );

  return (
    <div
      className="container fade-in"
      style={{
        padding: isMobile ? "1rem 1rem" : "2rem 1.5rem",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        className="btn btn-outline"
        style={{
          marginBottom: isMobile ? "1.5rem" : "2rem",
          fontSize: isMobile ? "0.9rem" : "1rem",
          padding: isMobile ? "0.5rem 1rem" : "0.75rem 1.5rem",
        }}
      >
        <ArrowLeft
          size={isMobile ? 14 : 16}
          style={{ marginRight: "0.5rem" }}
        />
        Back
      </button>

      <div
        className="product-details"
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "2rem" : isTablet ? "3rem" : "4rem",
        }}
      >
        {/* Product Image Section */}
        <div
          style={{
            flex: 1,
            width: "100%",
            minHeight: isMobile ? "200px" : isTablet ? "300px" : "400px",
            maxHeight: isMobile ? "250px" : isTablet ? "350px" : "500px",
            aspectRatio: "1/1",
            background: "#f1f5f9",
            borderRadius: isMobile ? "0.75rem" : "1rem",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          {product.image && (
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              style={{
                maxHeight: "90%",
                maxWidth: "90%",
                objectFit: "contain",
              }}
            />
          )}
        </div>

        {/* Customization Form */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "1rem" : "1.5rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: isMobile ? "1.75rem" : isTablet ? "2rem" : "2.5rem",
                marginBottom: "0.5rem",
                lineHeight: 1.2,
              }}
            >
              {product.name}
            </h1>
            <p
              style={{
                fontSize: isMobile ? "1.25rem" : "1.5rem",
                color: "var(--accent)",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}
            >
              NPR {product.price.toFixed(2)}
            </p>
            <p
              style={{
                marginTop: "0.5rem",
                color: "var(--text-light)",
                fontSize: isMobile ? "0.95rem" : "1rem",
                lineHeight: 1.6,
              }}
            >
              {product.description}
            </p>
            {(text.trim() || logoFile) &&
              (() => {
                const fee =
                  product.customizationFee !== undefined
                    ? product.customizationFee
                    : 5;
                return fee > 0 ? (
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: isMobile ? "0.5rem" : "0.5rem 1rem",
                      background: "#f0f9ff",
                      color: "#0369a1",
                      borderRadius: "0.5rem",
                      fontSize: isMobile ? "0.85rem" : "0.9rem",
                      fontWeight: "bold",
                    }}
                  >
                    + NPR {fee.toFixed(2)} Customization Charge
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: isMobile ? "0.5rem" : "0.5rem 1rem",
                      background: "#f0f9ff",
                      color: "#0369a1",
                      borderRadius: "0.5rem",
                      fontSize: isMobile ? "0.85rem" : "0.9rem",
                      fontWeight: "bold",
                    }}
                  >
                    ✨ Customized
                  </div>
                );
              })()}
          </div>

          {product.allowCustomization !== false ? (
            <div
              className="card"
              style={{
                padding: isMobile ? "1rem" : "1.5rem",
              }}
            >
              <h3
                style={{
                  marginBottom: isMobile ? "0.75rem" : "1rem",
                  fontSize: isMobile ? "1.1rem" : "1.25rem",
                }}
              >
                Customize It (Optional)
              </h3>

              <div style={{ marginBottom: isMobile ? "0.75rem" : "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                    fontSize: isMobile ? "0.9rem" : "1rem",
                  }}
                >
                  Name / Text on Bottle (Optional)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter text here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={20}
                  style={{
                    fontSize: isMobile ? "0.9rem" : "1rem",
                    padding: isMobile ? "0.75rem" : "1rem",
                  }}
                />
                <div
                  style={{
                    fontSize: isMobile ? "0.8rem" : "0.85rem",
                    color: "#64748b",
                    marginTop: "0.25rem",
                  }}
                >
                  Max 20 characters
                </div>
              </div>

              <div style={{ marginBottom: isMobile ? "0.75rem" : "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                    fontSize: isMobile ? "0.9rem" : "1rem",
                  }}
                >
                  Upload Logo (Optional)
                </label>
                <input
                  type="file"
                  className="input"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{
                    fontSize: isMobile ? "0.9rem" : "1rem",
                    padding: isMobile ? "0.5rem" : "1rem",
                  }}
                />
                {logoFile && (
                  <div
                    style={{
                      fontSize: isMobile ? "0.8rem" : "0.85rem",
                      color: "#10b981",
                      marginTop: "0.25rem",
                      fontWeight: "500",
                    }}
                  >
                    ✓ {logoFile.name} selected
                  </div>
                )}
              </div>

              <div style={{ marginBottom: isMobile ? "0.75rem" : "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                    fontSize: isMobile ? "0.9rem" : "1rem",
                  }}
                >
                  Special Instructions
                </label>
                <textarea
                  className="input"
                  rows={isMobile ? 2 : 3}
                  placeholder="E.g., specific font, placement preference..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  style={{
                    fontSize: isMobile ? "0.9rem" : "1rem",
                    padding: isMobile ? "0.75rem" : "1rem",
                    minHeight: isMobile ? "80px" : "100px",
                  }}
                />
              </div>
            </div>
          ) : (
            <div
              className="card"
              style={{
                padding: isMobile ? "1rem" : "1.5rem",
                textAlign: "center",
                background: "#f8fafc",
                border: "1px dashed #cbd5e1",
              }}
            >
              <p
                style={{
                  color: "#64748b",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                }}
              >
                Customization is not available for this item.
              </p>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            className="btn btn-primary"
            style={{
              padding: isMobile ? "0.75rem" : "1rem",
              fontSize: isMobile ? "1rem" : "1.1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            disabled={uploading}
          >
            {uploading ? (
              "Processing..."
            ) : (
              <>
                <ShoppingBag
                  size={isMobile ? 16 : 20}
                  style={{ marginRight: "0.5rem" }}
                />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
