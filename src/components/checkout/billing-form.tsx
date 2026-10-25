import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import debounce from "lodash/debounce";

import AddressFinder from "@/components/comps/address-finder";
import { useCheckoutStore } from "@/store/checkout-store";

const AUSTRALIAN_STATES = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"];

const billingSchema = z
  .object({
    sameAsShipping: z.boolean(),
    billing: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      companyLabel: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      address2: z.string().optional(),
      suburb: z.string().optional(),
      state: z.string().optional(),
      postcode: z.string().optional(),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.sameAsShipping) return;
    const b = data.billing;
    const required = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "suburb",
      "state",
      "postcode",
    ];
    for (const field of required) {
      if (!b[field as keyof typeof b] || b[field as keyof typeof b]?.trim() === "") {
        ctx.addIssue({
          path: ["billing", field],
          message: `${field.replace(/([A-Z])/g, " $1")} is required`,
          code: z.ZodIssueCode.custom,
        });
      }
    }
    if (b.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) {
      ctx.addIssue({
        path: ["billing", "email"],
        message: "Invalid email format",
        code: z.ZodIssueCode.custom,
      });
    }
    if (b.phone) {
      try {
        const phoneNumber = parsePhoneNumberWithError(b.phone, "AU");
        if (!(phoneNumber.isValid() && phoneNumber.country === "AU")) {
          ctx.addIssue({
            path: ["billing", "phone"],
            message: "Must be a valid Australian phone number",
            code: z.ZodIssueCode.custom,
          });
        }
      } catch {
        ctx.addIssue({
          path: ["billing", "phone"],
          message: "Must be a valid Australian phone number",
          code: z.ZodIssueCode.custom,
        });
      }
    }
    if (b.postcode && !/^\d{4}$/.test(b.postcode)) {
      ctx.addIssue({
        path: ["billing", "postcode"],
        message: "Postcode must be exactly 4 digits",
        code: z.ZodIssueCode.custom,
      });
    } else if (
      b.postcode &&
      (parseInt(b.postcode) < 200 || parseInt(b.postcode) > 9999)
    ) {
      ctx.addIssue({
        path: ["billing", "postcode"],
        message: "Invalid Australian postcode range",
        code: z.ZodIssueCode.custom,
      });
    }
  });

type BillingFormValues = z.infer<typeof billingSchema>;

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
    <Text style={[styles.label, hasError && styles.labelError]}>{children}</Text>
    {optional && <Text style={styles.optional}> (optional)</Text>}
  </View>
);

const BillingForm = ({ initialData }: any) => {
  const {
    setBillingAddress,
    setSameAsShipping,
    setFieldErrors,
    clearFieldErrors,
    sameAsShipping: storeSame,
    shippingAddress,
  } = useCheckoutStore();

  const [showStatePicker, setShowStatePicker] = useState(false);

  const {
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BillingFormValues>({
    resolver: zodResolver(billingSchema) as any,
    defaultValues: {
      sameAsShipping: initialData?.sameAsShipping ?? storeSame ?? false,
      billing: initialData?.billing ?? {},
    },
    mode: "onChange",
  });

  const sameAsShipping = watch("sameAsShipping");
  const billingValues = watch("billing");

  const debouncedSetBillingAddress = useMemo(
    () => debounce(setBillingAddress, 300),
    [setBillingAddress]
  );

  useEffect(() => {
    setSameAsShipping(sameAsShipping);
  }, [sameAsShipping, setSameAsShipping]);

  useEffect(() => {
    debouncedSetBillingAddress(billingValues);
  }, [sameAsShipping, billingValues, debouncedSetBillingAddress]);

  useEffect(() => () => debouncedSetBillingAddress.cancel(), [debouncedSetBillingAddress]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) setFieldErrors(errors);
    else clearFieldErrors();
  }, [errors, setFieldErrors, clearFieldErrors]);

  useEffect(() => {
    if (initialData) {
      reset({
        sameAsShipping: initialData.sameAsShipping ?? storeSame ?? true,
        billing: initialData.billing ?? {},
      });
    }
  }, [initialData, reset, storeSame]);

  useEffect(() => {
    if (
      !sameAsShipping &&
      shippingAddress &&
      (!billingValues?.firstName || billingValues.firstName === "")
    ) {
      Object.entries({
        firstName: shippingAddress.firstName || "",
        lastName: shippingAddress.lastName || "",
        email: shippingAddress.email || "",
        phone: shippingAddress.phone || "",
        address: shippingAddress.address || "",
        address2: shippingAddress.address2 || "",
        suburb: shippingAddress.suburb || "",
        state: shippingAddress.state || "",
        postcode: shippingAddress.postcode || "",
        companyLabel: billingValues?.companyLabel || "",
      }).forEach(([key, value]) =>
        setValue(`billing.${key}` as any, value, { shouldValidate: false })
      );
    }
  }, [sameAsShipping, shippingAddress, setValue, billingValues]);

  const inputCls = (fieldName: string) => [
    styles.input,
    (errors.billing as any)?.[fieldName] ? styles.inputError : null,
  ];

  const handleAddressSelect = (data: any) => {
    setValue("billing.address", data.address, { shouldValidate: true });
    setValue("billing.suburb", data.suburb, { shouldValidate: true });
    setValue("billing.state", data.state, { shouldValidate: true });
    setValue("billing.postcode", data.postcode, { shouldValidate: true });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={styles.stepText}>Step 2</Text>
        <Text style={styles.heading}>Billing Address</Text>
      </View>

      <View style={styles.radioGroup}>
        <Pressable
          style={styles.radioRow}
          onPress={() => setValue("sameAsShipping", true, { shouldValidate: true })}
        >
          <View
            style={[
              styles.checkbox,
              sameAsShipping && styles.checkboxActive,
            ]}
          >
            {sameAsShipping && <Check size={10} color="#FFFFFF" strokeWidth={3} />}
          </View>
          <Text
            style={[
              styles.radioText,
              sameAsShipping && styles.radioTextActive,
            ]}
          >
            Same as shipping address
          </Text>
        </Pressable>

        <Pressable
          style={styles.radioRow}
          onPress={() => setValue("sameAsShipping", false, { shouldValidate: true })}
        >
          <View
            style={[
              styles.checkbox,
              !sameAsShipping && styles.checkboxActive,
            ]}
          >
            {!sameAsShipping && <Check size={10} color="#FFFFFF" strokeWidth={3} />}
          </View>
          <Text
            style={[
              styles.radioText,
              !sameAsShipping && styles.radioTextActive,
            ]}
          >
            Use a different address
          </Text>
        </Pressable>
      </View>

      {!sameAsShipping && (
        <View style={styles.formBlock}>
          <View style={styles.row}>
            <View style={styles.field}>
              <FormLabel hasError={!!errors.billing?.firstName}>First Name *</FormLabel>
              <Controller
                control={control}
                name="billing.firstName"
                render={({ field }) => (
                  <TextInput
                    style={inputCls("firstName")}
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholderTextColor="#A8A29E"
                  />
                )}
              />
              <FieldError message={errors.billing?.firstName?.message} />
            </View>

            <View style={styles.field}>
              <FormLabel hasError={!!errors.billing?.lastName}>Last Name *</FormLabel>
              <Controller
                control={control}
                name="billing.lastName"
                render={({ field }) => (
                  <TextInput
                    style={inputCls("lastName")}
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholderTextColor="#A8A29E"
                  />
                )}
              />
              <FieldError message={errors.billing?.lastName?.message} />
            </View>
          </View>

          <View style={styles.field}>
            <FormLabel optional>Company</FormLabel>
            <Controller
              control={control}
              name="billing.companyLabel"
              render={({ field }) => (
                <TextInput
                  style={inputCls("companyLabel")}
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholderTextColor="#A8A29E"
                />
              )}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.field}>
              <FormLabel hasError={!!errors.billing?.email}>Email *</FormLabel>
              <Controller
                control={control}
                name="billing.email"
                render={({ field }) => (
                  <TextInput
                    style={inputCls("email")}
                    value={field.value}
                    onChangeText={field.onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#A8A29E"
                  />
                )}
              />
              <FieldError message={errors.billing?.email?.message} />
            </View>

            <View style={styles.field}>
              <FormLabel hasError={!!errors.billing?.phone}>Phone *</FormLabel>
              <Controller
                control={control}
                name="billing.phone"
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
              <FieldError message={errors.billing?.phone?.message} />
            </View>
          </View>

          <View style={styles.field}>
            <FormLabel hasError={!!errors.billing?.address}>Address *</FormLabel>
            <Controller
              control={control}
              name="billing.address"
              render={({ field }) => (
                <View style={{ zIndex: 100 }}>
                  <AddressFinder
                    defaultValue={field.value}
                    onAddressSelect={handleAddressSelect}
                  />
                </View>
              )}
            />
            <FieldError message={errors.billing?.address?.message} />
          </View>

          <View style={styles.field}>
            <FormLabel optional>Address Line 2</FormLabel>
            <Controller
              control={control}
              name="billing.address2"
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
              <FormLabel hasError={!!errors.billing?.state}>State *</FormLabel>
              <Controller
                control={control}
                name="billing.state"
                render={({ field }) => (
                  <>
                    <Pressable
                      style={[
                        styles.input,
                        styles.selectTrigger,
                        errors.billing?.state && styles.inputError,
                      ]}
                      onPress={() => setShowStatePicker((prev) => !prev)}
                    >
                      <Text
                        style={[
                          styles.selectText,
                          !field.value && styles.selectPlaceholder,
                        ]}
                      >
                        {field.value || "Select your state"}
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
                              field.value === s && styles.dropdownItemActive,
                            ]}
                            onPress={() => {
                              field.onChange(s);
                              setShowStatePicker(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownText,
                                field.value === s && styles.dropdownTextActive,
                              ]}
                            >
                              {s}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </>
                )}
              />
              <FieldError message={errors.billing?.state?.message} />
            </View>

            <View style={styles.field}>
              <FormLabel hasError={!!errors.billing?.suburb}>Suburb *</FormLabel>
              <Controller
                control={control}
                name="billing.suburb"
                render={({ field }) => (
                  <TextInput
                    style={inputCls("suburb")}
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholderTextColor="#A8A29E"
                  />
                )}
              />
              <FieldError message={errors.billing?.suburb?.message} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.field}>
              <FormLabel hasError={!!errors.billing?.postcode}>Postcode *</FormLabel>
              <Controller
                control={control}
                name="billing.postcode"
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
              <FieldError message={errors.billing?.postcode?.message} />
            </View>
          </View>
        </View>
      )}
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
  radioGroup: {
    gap: 10,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#D6D3D1",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: "#1C1917",
    borderColor: "#1C1917",
  },
  radioText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#78716C",
  },
  radioTextActive: {
    color: "#292524",
  },
  formBlock: {
    gap: 20,
    paddingTop: 8,
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

export default BillingForm;