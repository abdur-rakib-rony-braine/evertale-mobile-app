import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getInitialState = (userData?: any) => ({
  shippingAddress: {
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    phone: userData?.phone || '',
    email: userData?.email || '',
    address: userData?.customer?.shippingAddress?.address || userData?.address || '',
    address2: userData?.customer?.shippingAddress?.address2 || userData?.address2 || '',
    suburb: userData?.customer?.shippingAddress?.suburb || userData?.suburb || '',
    postcode: userData?.customer?.shippingAddress?.postcode || userData?.postcode || '',
    state: userData?.customer?.shippingAddress?.state || userData?.state || '',
    country: userData?.customer?.shippingAddress?.country || userData?.country || 'Australia',
  },
  billingAddress: {
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    phone: userData?.phone || '',
    email: userData?.email || '',
    address: userData?.customer?.billingAddress?.address || userData?.address || '',
    address2: userData?.customer?.billingAddress?.address2 || userData?.address2 || '',
    suburb: userData?.customer?.billingAddress?.suburb || userData?.suburb || '',
    postcode: userData?.customer?.billingAddress?.postcode || userData?.postcode || '',
    state: userData?.customer?.billingAddress?.state || userData?.state || '',
    country: userData?.customer?.billingAddress?.country || userData?.country || 'Australia',
    companyLabel: '',
  },
  sameAsShipping: false,
  shipping: {
    method: '',
    cost: 0,
  },
  deliveryInstructions: '',
  order: null,
  notes: '',
  orderId: '',
  showContactForm: false,
  fieldErrors: {},
});

export const useCheckoutStore = create<any>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      initializeWithUserData: (userData: any) => {
        if (!userData) return;
        
        const currentState = get();
        
        const mergeAddressData = (currentAddress: any, userAddressData: any, isBilling = false) => {
          return {
            ...currentAddress,
            firstName: userAddressData.firstName || currentAddress.firstName || '',
            lastName: userAddressData.lastName || currentAddress.lastName || '',
            email: userAddressData.email || currentAddress.email || '',
            phone: userAddressData.phone || currentAddress.phone || '',
            address: userAddressData.address || currentAddress.address || '',
            address2: userAddressData.address2 || currentAddress.address2 || '',
            suburb: userAddressData.suburb || currentAddress.suburb || '',
            postcode: userAddressData.postcode || currentAddress.postcode || '',
            state: userAddressData.state || currentAddress.state || '',
            country: userAddressData.country || currentAddress.country || 'Australia',
            ...(isBilling && { companyLabel: currentAddress.companyLabel || '' })
          };
        };
        
        const shippingAddress = mergeAddressData(
          currentState.shippingAddress,
          {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            address: userData.customer?.shippingAddress?.address || userData.address,
            address2: userData.customer?.shippingAddress?.address2 || userData.address2,
            suburb: userData.customer?.shippingAddress?.suburb || userData.suburb,
            postcode: userData.customer?.shippingAddress?.postcode || userData.postcode,
            state: userData.customer?.shippingAddress?.state || userData.state,
            country: userData.customer?.shippingAddress?.country || userData.country,
          }
        );
        
        set({
          shippingAddress,
          billingAddress: currentState.sameAsShipping ? { ...shippingAddress } : mergeAddressData(
            currentState.billingAddress,
            {
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email,
              phone: userData.phone,
              address: userData.customer?.billingAddress?.address || userData.address,
              address2: userData.customer?.billingAddress?.address2 || userData.address2,
              suburb: userData.customer?.billingAddress?.suburb || userData.suburb,
              postcode: userData.customer?.billingAddress?.postcode || userData.postcode,
              state: userData.customer?.billingAddress?.state || userData.state,
              country: userData.customer?.billingAddress?.country || userData.country,
            },
            true
          )
        });
      },

      setShippingAddress: (data: any) => {
        const sameAsShipping = get().sameAsShipping;
        set({
          shippingAddress: data,
          billingAddress: sameAsShipping ? { ...data } : get().billingAddress,
        });
      },

      setBillingAddress: (data: any) => {
        set({ billingAddress: data });
      },

      setSameAsShipping: (value: boolean) => {
        const shippingAddress = get().shippingAddress;
        set({
          sameAsShipping: value,
          billingAddress: value ? { ...shippingAddress } : get().billingAddress,
        });
      },

      setShipping: (newData: any) => set({ shipping: newData }),

      setOrder: (newData: any) => set({ order: { ...newData } }),
      setOrderId: (newData: string) => set({ orderId: newData }),
      setNotes: (newData: string) => set({ notes: newData }),
      setDeliveryInstruction: (newData: string) => set({ deliveryInstructions: newData }),

      setFieldErrors: (errors: any) => set({ fieldErrors: errors }),
      clearFieldErrors: () => set({ fieldErrors: {} }),

      resetCheckout: () => set(getInitialState()),
      setShowContactForm: (value: boolean) => set({ showContactForm: value }),
    }),
    {
      name: 'evertale-checkout-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: any) => ({
        order: state.order,
        shippingAddress: state.shippingAddress,
        billingAddress: state.billingAddress,
        shipping: state.shipping,
        notes: state.notes,
        deliveryInstructions: state.deliveryInstructions,
        sameAsShipping: state.sameAsShipping,
        orderId: state.orderId,
      }),
    }
  )
);