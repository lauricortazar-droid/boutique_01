import React, { useState } from 'react';
import { Product, Order, Customer, Category, BoutiqueSettings, CartItem } from '../../types';
import { PortalHeader } from './PortalHeader';
import { PortalHome } from './PortalHome';
import { PortalCatalog } from './PortalCatalog';
import { PortalAnniversaryView } from './PortalAnniversaryView';
import { PortalOrderTracker } from './PortalOrderTracker';
import { PortalProductModal } from './PortalProductModal';
import { PortalCartDrawer } from './PortalCartDrawer';
import { PortalOrderSuccessModal } from './PortalOrderSuccessModal';
import { Shield, Phone, Sparkles } from 'lucide-react';

interface PortalViewProps {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  categories: Category[];
  settings: BoutiqueSettings;
  onSaveOrderFromPortal: (order: Order, customer: Customer) => void;
  onSwitchToAdmin: () => void;
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const PortalView: React.FC<PortalViewProps> = ({
  products,
  orders,
  customers,
  categories,
  settings,
  onSaveOrderFromPortal,
  onSwitchToAdmin,
  showNotification
}) => {
  // Navigation inside portal
  const [currentPortalTab, setCurrentPortalTab] = useState<'home' | 'catalog' | 'anniversary' | 'tracker'>('home');
  const [catalogInitialCategory, setCatalogInitialCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Cart state (stored in localStorage for convenience)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('fgdll_portal_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Product Detail Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Success Modal state
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Tracker target folio
  const [trackerInitialFolio, setTrackerInitialFolio] = useState('');

  // Save cart to localStorage
  const updateCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('fgdll_portal_cart', JSON.stringify(items));
  };

  const handleAddToCart = (newItem: CartItem) => {
    setCartItems(prev => {
      // Check if identical item already in cart (same product, same variant, same custom name)
      const existingIdx = prev.findIndex(item => 
        item.productId === newItem.productId && 
        item.variantId === newItem.variantId &&
        item.customization?.personName === newItem.customization?.personName
      );

      let updated: CartItem[];
      if (existingIdx > -1) {
        updated = [...prev];
        const newQty = updated[existingIdx].quantity + newItem.quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: newQty * updated[existingIdx].unitPrice
        };
      } else {
        updated = [newItem, ...prev];
      }

      localStorage.setItem('fgdll_portal_cart', JSON.stringify(updated));
      return updated;
    });

    showNotification('success', `"${newItem.product.name}" agregado al carrito.`);
  };

  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    const updated = cartItems.map(item => {
      if (item.id === cartItemId) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: newQuantity * item.unitPrice
        };
      }
      return item;
    });
    updateCart(updated);
  };

  const handleRemoveItem = (cartItemId: string) => {
    const updated = cartItems.filter(i => i.id !== cartItemId);
    updateCart(updated);
  };

  const handleClearCart = () => {
    updateCart([]);
  };

  const handleCompleteOrder = (newOrder: Order, customer: Customer) => {
    onSaveOrderFromPortal(newOrder, customer);
    setSuccessOrder(newOrder);
    setIsCartOpen(false);
    setIsSuccessModalOpen(true);
  };

  const handleTrackSpecificOrder = (folio: string) => {
    setTrackerInitialFolio(folio);
    setCurrentPortalTab('tracker');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      
      {/* Portal Header */}
      <PortalHeader
        currentPortalTab={currentPortalTab}
        setCurrentPortalTab={setCurrentPortalTab}
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracker={() => {
          setTrackerInitialFolio('');
          setCurrentPortalTab('tracker');
        }}
        onSwitchToAdmin={onSwitchToAdmin}
        settings={settings}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 pt-6">
        {currentPortalTab === 'home' && (
          <PortalHome
            products={products}
            categories={categories}
            settings={settings}
            onNavigateToCatalog={(categorySlug) => {
              setCatalogInitialCategory(categorySlug);
              setCurrentPortalTab('catalog');
            }}
            onNavigateToAnniversary={() => setCurrentPortalTab('anniversary')}
            onSelectProduct={product => setSelectedProduct(product)}
            onOpenTracker={() => {
              setTrackerInitialFolio('');
              setCurrentPortalTab('tracker');
            }}
          />
        )}

        {currentPortalTab === 'catalog' && (
          <PortalCatalog
            products={products}
            categories={categories}
            settings={settings}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectProduct={product => setSelectedProduct(product)}
            onQuickAddToCart={handleAddToCart}
            initialCategory={catalogInitialCategory}
          />
        )}

        {currentPortalTab === 'anniversary' && (
          <PortalAnniversaryView
            products={products}
            settings={settings}
            onSelectProduct={product => setSelectedProduct(product)}
            onQuickAddToCart={handleAddToCart}
          />
        )}

        {currentPortalTab === 'tracker' && (
          <PortalOrderTracker
            orders={orders}
            settings={settings}
            initialFolio={trackerInitialFolio}
          />
        )}
      </main>

      {/* Product Detail & Add to Cart Modal */}
      <PortalProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        settings={settings}
      />

      {/* Shopping Cart Drawer */}
      <PortalCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCompleteOrder={handleCompleteOrder}
        settings={settings}
        existingCustomers={customers}
      />

      {/* Order Success Celebration & PNG Voucher Modal */}
      <PortalOrderSuccessModal
        order={successOrder}
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onTrackOrder={handleTrackSpecificOrder}
        settings={settings}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="font-serif font-bold text-slate-300">
                {settings.boutiqueName} &bull; Fraternidad Guerreros de la Luz
              </p>
              <p className="text-[10px] text-slate-500">
                Portal Oficial de Pedidos y Suministros para Servidores y Grupos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href={`https://wa.me/${settings.portal.whatsappCleanNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Phone className="h-3 w-3" /> WhatsApp: {settings.portal.whatsappNumber}
            </a>

            <button
              onClick={onSwitchToAdmin}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Panel Administrador &rarr;
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
