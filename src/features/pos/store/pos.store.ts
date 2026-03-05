import { create } from 'zustand';
import type { PosCartItem, PaymentMethod } from '../hooks/use-pos';

interface PosState {
    cart: PosCartItem[];
    paymentMethod: PaymentMethod;
    promotionCode: string;
    cashReceived: string;
    clientId: string;
    addItem: (item: PosCartItem) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    setPaymentMethod: (method: PaymentMethod) => void;
    setPromotionCode: (code: string) => void;
    setCashReceived: (amount: string) => void;
    setClientId: (clientId: string) => void;
    clearCart: () => void;
}

export const usePosStore = create<PosState>((set) => ({
    cart: [],
    paymentMethod: 'CASH',
    promotionCode: '',
    cashReceived: '',
    clientId: '',
    addItem: (item) =>
        set((state) => {
            const existing = state.cart.find((i) => i.productId === item.productId);
            if (existing) {
                return {
                    cart: state.cart.map((i) =>
                        i.productId === item.productId
                            ? { ...i, quantity: i.quantity + item.quantity, total: i.unitPrice * (i.quantity + item.quantity) - i.discount }
                            : i,
                    ),
                };
            }
            return { cart: [...state.cart, item] };
        }),
    removeItem: (productId) =>
        set((state) => ({ cart: state.cart.filter((i) => i.productId !== productId) })),
    updateQuantity: (productId, quantity) =>
        set((state) => ({
            cart: state.cart
                .map((i) =>
                    i.productId === productId
                        ? { ...i, quantity, total: i.unitPrice * quantity - i.discount }
                        : i,
                )
                .filter((i) => i.quantity > 0),
        })),
    setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
    setPromotionCode: (promotionCode) => set({ promotionCode }),
    setCashReceived: (cashReceived) => set({ cashReceived }),
    setClientId: (clientId) => set({ clientId }),
    clearCart: () => set({ cart: [], promotionCode: '', cashReceived: '', clientId: '' }),
}));
