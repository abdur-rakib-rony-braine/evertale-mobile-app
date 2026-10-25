import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown } from "lucide-react-native";

import AddressFinder from "@/components/comps/address-finder";
import { useCheckoutStore } from "@/store/checkout-store";

const AUSTRALIAN_STATES = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"];

const shippingSchema = z.object({
  shipping: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string(),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .transform((v) => v.trim())
      .refine((value) => value.length >= 8, "Must be a valid phone number"),
    address: z.string().min(1, "Address is required"),
    address2: z.string().optional(),
    suburb: z.string().min(1, "Suburb is required"),
    state: z.string().min(1, "State is required"),
    postcode: z
      .string()
      .min(1, "Postcode is required")
      .regex(/^\d{4}$/, "Postcode must be exactly 4 digits")
      .refine(
        (val) => parseInt(val) >= 200 && parseInt(val) <= 9999,
        "Invalid Australian postcode range"
      ),
  }),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
  initialData?: Partial<ShippingFormValues>;
  userData?: any;
}

const FieldError = ({ message }: { message?: string }) =>
  message ? <Text style={styles.errorText}>{message}</Text> : null;

const FormLabel = ({
  hasError,
  children,
  optional,
}: {
  hasError?: boolean;
  children: React.ReactNode;
  optional?: boolean;
}) => (
  <View style={styles.labelRow}>
    <Text style={[styles.label, hasError && styles.labelError]}>
      {children}
    </Text>
    {optional && <Text style={styles.optional}> (optional)</Text>}
  </View>
);

const ShippingForm = ({ initialData, userData }: ShippingFormProps) => {
  const { setShippingAddress, setFieldErrors, clearFieldErrors, shippingAddress } =
    useCheckoutStore();

  const [showStatePicker, setShowStatePicker] = useState(false);

  const { control, watch, setValue, formState: { errors }, reset } =
    useForm<ShippingFormValues>({
      resolver: zodResolver(shippingSchema),
      defaultValues: initialData || {
        shipping: {
          firstName: shippingAddress.firstName || "",
          lastName: shippingAddress.lastName || "",
          email: shippingAddress.email || "",
          phone: shippingAddress.phone || "",
          address: shippingAddress.address || "",
          address2: shippingAddress.address2 || "",
          suburb: shippingAddress.suburb || "",
          state: shippingAddress.state || "",
          postcode: shippingAddress.postcode || "",
        },
      },
      mode: "onChange",
    });

  useEffect(() => {
    const subscription = watch((value) => {
      if (value.shipping) {
        setShippingAddress(value.shipping);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setShippingAddress]);

  useEffect(() => {
    if (errors.shipping && Object.keys(errors.shipping).length > 0) {
      setFieldErrors(errors);
    } else {
      clearFieldErrors();
    }
  }, [errors, setFieldErrors, clearFieldErrors]);

  useEffect(() => {
    if (initialData) reset(initialData);
  }, [initialData, reset]);

  const inputCls = (fieldName: keyof NonNullable<ShippingFormValues["shipping"]>) =>
    [
      styles.input,
      errors.shipping?.[fieldName] ? styles.inputError : null,
    ];

  const handleAddressSelect = (data: {
    address: string;
    suburb: string;
    state: string;
    postcode: string;
  }) => {
    setValue("shipping.address", data.address, { shouldValidate: true });
    setValue("shipping.suburb", data.suburb, { shouldValidate: true });
    setValue("shipping.state", data.state, { shouldValidate: true });
    setValue("shipping.postcode", data.postcode, { shouldValidate: true });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={styles.stepText}>Step 1</Text>
        <Text style={styles.heading}>Shipping Address</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.field}>
          <FormLabel hasError={!!errors.shipping?.firstName}>
            First Name *
          </FormLabel>
          <Controller
            control={control}
            name="shipping.firstName"
            render={({ field }) => (
              <TextInput
                style={inputCls("firstName")}
                value={field.value}
                onChangeText={field.onChange}
                placeholderTextColor="#A8A29E"
              />
            )}
          />
          <FieldError message={errors.shipping?.firstName?.message} />
        </View>

        <View style={styles.field}>
          <FormLabel hasError={!!errors.shipping?.lastName}>
            Last Name *
          </FormLabel>
          <Controller
            control={control}
            name="shipping.lastName"
            render={({ field }) => (
              <TextInput
                style={inputCls("lastName")}
                value={field.value}
                onChangeText={field.onChange}
                placeholderTextColor="#A8A29E"
              />
            )}
          />
          <FieldError message={errors.shipping?.lastName?.message} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.field}>
          <FormLabel>Email *</FormLabel>
          <Controller
            control={control}
            name="shipping.email"
            render={({ field }) => (
              <TextInput
                style={[inputCls("email"), !!userData?.email && styles.inputDisabled]}
                value={field.value}
                onChangeText={field.onChange}
                editable={!userData?.email}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#A8A29E"
              />
            )}
          />
        </View>

        <View style={styles.field}>
          <FormLabel hasError={!!errors.shipping?.phone}>Phone *</FormLabel>
          <Controller
            control={control}
            name="shipping.phone"
            render={({ field }) => (
              <TextInput
                style={inputCls("phone")}
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="phone-pad"
                placeholder="+61 4xx xxx xxx"
                placeholderTextColor="#A8A29E"
              />
            )}
          />
          <FieldError message={errors.shipping?.phone?.message} />
        </View>
      </View>

      <View style={styles.field}>
        <FormLabel hasError={!!errors.shipping?.address}>Address *</FormLabel>
        <Controller
          control={control}
          name="shipping.address"
          render={({ field }) => (
            <View style={{ zIndex: 100 }}>
              <AddressFinder
                defaultValue={field.value}
                onAddressSelect={handleAddressSelect}
              />
            </View>
          )}
        />
        <FieldError message={errors.shipping?.address?.message} />
      </View>

      <View style={styles.field}>
        <FormLabel optional>Address Line 2</FormLabel>
        <Controller
          control={control}
          name="shipping.address2"
          render={({ field }) => (
            <TextInput
              style={inputCls("address2")}
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Apartment, suite, unit, etc."
              placeholderTextColor="#A8A29E"
            />
          )}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.field}>
          <FormLabel hasError={!!errors.shipping?.state}>State *</FormLabel>
          <Pressable
            style={[
              styles.input,
              styles.selectTrigger,
              errors.shipping?.state && styles.inputError,
            ]}
            onPress={() => setShowStatePicker((prev) => !prev)}
          >
            <Text
              style={[
                styles.selectText,
                !watch("shipping.state") && styles.selectPlaceholder,
              ]}
            >
              {watch("shipping.state") ||
                (errors.shipping?.state ? "State is required" : "Select your state")}
            </Text>
            <ChevronDown size={16} color="#78716C" />
          </Pressable>
          {showStatePicker ? (
            <View style={styles.dropdown}>
              {AUSTRALIAN_STATES.map((s) => (
                <Pressable
                  key={s}
                  style={[
                    styles.dropdownItem,
                    watch("shipping.state") === s && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setValue("shipping.state", s, { shouldValidate: true });
                    setShowStatePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      watch("shipping.state") === s && styles.dropdownTextActive,
                    ]}
                  >
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          <FieldError message={errors.shipping?.state?.message} />
        </View>

        <View style={styles.field}>
          <FormLabel hasError={!!errors.shipping?.suburb}>Suburb *</FormLabel>
          <Controller
            control={control}
            name="shipping.suburb"
            render={({ field }) => (
              <TextInput
                style={inputCls("suburb")}
                value={field.value}
                onChangeText={field.onChange}
                placeholderTextColor="#A8A29E"
              />
            )}
          />
          <FieldError message={errors.shipping?.suburb?.message} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.field}>
          <FormLabel hasError={!!errors.shipping?.postcode}>Postcode *</FormLabel>
          <Controller
            control={control}
            name="shipping.postcode"
            render={({ field }) => (
              <TextInput
                style={inputCls("postcode")}
                value={field.value}
                onChangeText={field.onChange}
                placeholder="e.g. 2000"
                keyboardType="numeric"
                maxLength={4}
                placeholderTextColor="#A8A29E"
              />
            )}
          />
          <FieldError message={errors.shipping?.postcode?.message} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 20,
  },
  stepText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2.16,
    textTransform: "uppercase",
    color: "#A8A29E",
    marginBottom: 4,
  },
  heading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#292524",
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  field: {
    flex: 1,
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#78716C",
  },
  labelError: {
    color: "#F87171",
  },
  optional: {
    fontSize: 12,
    color: "#A8A29E",
    fontWeight: "400",
    textTransform: "none",
    letterSpacing: 0,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#292524",
  },
  inputError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  inputDisabled: {
    backgroundColor: "#FAFAF9",
    color: "#A8A29E",
  },
  selectTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontSize: 14,
    color: "#292524",
  },
  selectPlaceholder: {
    color: "#A8A29E",
  },
  dropdown: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    marginTop: 4,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  dropdownItemActive: {
    backgroundColor: "#FAFAF9",
  },
  dropdownText: {
    fontSize: 14,
    color: "#57534E",
  },
  dropdownTextActive: {
    color: "#1C1917",
    fontWeight: "600",
  },
  errorText: {
    fontSize: 12,
    color: "#F87171",
    marginTop: 2,
  },
});

export default ShippingForm;