import type { Product, ProductSizeChart, SizeChartMeasurement } from "@/lib/api/products";
import {
  ChevronDown,
  Info,
  RefreshCw,
  Ruler,
  Truck,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const CONTACT_URL = "/contact";
const SHIPPING_URL = "/shipping";
const RETURNS_URL = "/returns-exchanges";
const AUSPOST_URL = "https://auspost.com.au";

type SheetKey = "details" | "shipping" | "size" | null;

interface ProductInfoSheetsProps {
  product: Product;
}

interface SheetShellProps {
  icon: React.ReactNode;
  trigger: string;
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const SheetShell = ({
  icon,
  trigger,
  visible,
  onClose,
  title,
  children,
}: SheetShellProps) => (
  <>
    <View style={styles.triggerRow}>
      {icon}
      <Text style={styles.triggerText}>{trigger}</Text>
      <ChevronDown size={18} color="#A8A29E" />
    </View>

    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Pressable
            onPress={onClose}
            style={styles.modalClose}
            hitSlop={8}
            accessibilityLabel="Close"
          >
            <X size={18} color="#1C1917" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.modalBody}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        <View style={styles.modalFooter}>
          <Text style={styles.modalFooterText}>
            Questions?{" "}
            <Text
              style={styles.modalFooterLink}
              onPress={() => Linking.openURL(CONTACT_URL)}
            >
              Contact us
            </Text>
          </Text>
        </View>
      </View>
    </Modal>
  </>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.sectionHeading}>{children}</Text>
);

const ProductInfoSheets = ({ product }: ProductInfoSheetsProps) => {
  const [open, setOpen] = useState<SheetKey>(null);
  const [unit, setUnit] = useState<"inch" | "cm">("inch");

  const chart: ProductSizeChart | null =
    typeof product?.sizeChart === "object" && product.sizeChart !== null
      ? (product.sizeChart as ProductSizeChart)
      : null;

  const sizeOptions: string[] = chart?.sizes || [];
  const measurements: SizeChartMeasurement[] = chart?.measurements || [];
  const chartImages: string[] = chart?.images || [];

  return (
    <View style={styles.container}>
      {/* Product Details */}
      <Pressable onPress={() => setOpen("details")}>
        <SheetShell
          icon={<Info size={18} color="#57534E" />}
          trigger="Product Details"
          visible={open === "details"}
          onClose={() => setOpen(null)}
          title="Product Details"
        >
          <Text style={styles.bodyText}>
            {stripHtml(product?.description || "")}
          </Text>
        </SheetShell>
      </Pressable>

      {/* Shipping And Returns */}
      <Pressable onPress={() => setOpen("shipping")}>
        <SheetShell
          icon={<Truck size={18} color="#57534E" />}
          trigger="Shipping And Returns"
          visible={open === "shipping"}
          onClose={() => setOpen(null)}
          title="Shipping And Returns"
        >
          <Text style={styles.bodyText}>
            You should expect your order to ship within 3-5 business days,
            unless noted otherwise (pre-ordered items will have an estimated
            shipping date within the title of the product and on your
            confirmation page). It will then be shipped via our regular carrier.
          </Text>

          <View style={styles.section}>
            <SectionHeading>Domestic (Within Australia)</SectionHeading>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Standard (Australia Post)
              </Text>
              <Text style={styles.bodyText}>
                $9.70 flat rate - Delivery estimate, 2-3 business days from
                dispatch.
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Express (Australia Post)
              </Text>
              <Text style={styles.bodyText}>
                $12.70 flat rate - Delivery estimate, 1-2 business days from
                dispatch.
              </Text>
            </View>
            <Text style={styles.bodyText}>
              Calculate estimated delivery time from postcode 3043{" "}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL(AUSPOST_URL)}
              >
                here
              </Text>
            </Text>
          </View>

          <View style={styles.section}>
            <SectionHeading>Returns Policy</SectionHeading>
            <Text style={styles.bodyText}>
              We hope that you love every item from our Evertale shop! Your joy
              in our pieces is of utmost importance. We understand however that
              sometimes items don't fit, or work out as planned and therefore we
              will happily accept exchanges of items in their original condition
              (unworn, unwashed with tags attached, folded neatly in the
              Evertale bag it came in) mailed back within 30 days of receiving
              your garment.
            </Text>
            <Text style={styles.bodyText}>
              Unfortunately we are unable to honour a return outside of the 30
              days return period.
            </Text>
          </View>

          <View style={styles.linkCardsRow}>
            <Pressable
              style={styles.linkCard}
              onPress={() => Linking.openURL(SHIPPING_URL)}
            >
              <Truck size={28} color="#78716C" />
              <Text style={styles.linkCardTitle}>Shipping Policy</Text>
              <Text style={styles.linkCardSubtitle}>View full details</Text>
            </Pressable>
            <Pressable
              style={styles.linkCard}
              onPress={() => Linking.openURL(RETURNS_URL)}
            >
              <RefreshCw size={28} color="#78716C" />
              <Text style={styles.linkCardTitle}>Returns & Exchanges</Text>
              <Text style={styles.linkCardSubtitle}>View full details</Text>
            </Pressable>
          </View>
        </SheetShell>
      </Pressable>

      {/* Size Guide */}
      <Pressable onPress={() => setOpen("size")}>
        <SheetShell
          icon={<Ruler size={18} color="#57534E" />}
          trigger="Size Guide"
          visible={open === "size"}
          onClose={() => setOpen(null)}
          title="Size Guide"
        >
          <Text style={styles.bodyText}>
            Please use the following garment measurements as a guide to help you
            determine your perfect fit. Evertale garments are designed to flow
            with freedom to move.
          </Text>
          <Text style={styles.bodyText}>
            Please note due to the handmade nature, with each run of garments
            the sizing may vary. Please ensure you review the size chart of each
            individual product to determine your correct size before purchasing.
          </Text>

          <View style={styles.unitCard}>
            <Text style={styles.unitLabel}>Measurement Preference</Text>
            <View style={styles.unitRow}>
              <Pressable
                style={[
                  styles.unitButton,
                  unit === "inch" && styles.unitButtonActive,
                ]}
                onPress={() => setUnit("inch")}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    unit === "inch" && styles.unitButtonTextActive,
                  ]}
                >
                  Inches
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.unitButton,
                  unit === "cm" && styles.unitButtonActive,
                ]}
                onPress={() => setUnit("cm")}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    unit === "cm" && styles.unitButtonTextActive,
                  ]}
                >
                  Centimeters
                </Text>
              </Pressable>
            </View>
          </View>

          {sizeOptions.length > 0 && measurements.length > 0 ? (
            <View style={styles.tableWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                      SIZE ({unit === "inch" ? "inches" : "cm"})
                    </Text>
                    {sizeOptions.map((s) => (
                      <Text
                        key={s}
                        style={[styles.tableCell, styles.tableHeaderCell]}
                      >
                        {s}
                      </Text>
                    ))}
                  </View>
                  {measurements.map((m, rowIdx) => (
                    <View
                      key={rowIdx}
                      style={[
                        styles.tableRow,
                        rowIdx % 2 === 1 && styles.tableRowAlt,
                      ]}
                    >
                      <Text style={[styles.tableCell, styles.tableCellBold]}>
                        {String(m.measurementName || "").toUpperCase()}
                      </Text>
                      {sizeOptions.map((s) => {
                        const sizeData = (m.sizes || []).find(
                          (sz) => sz.size === s
                        );
                        if (!sizeData) {
                          return (
                            <Text key={s} style={styles.tableCell}>
                              -
                            </Text>
                          );
                        }
                        if (unit === "inch") {
                          return (
                            <Text key={s} style={styles.tableCell}>
                              {sizeData.end
                                ? `${sizeData.start}-${sizeData.end}`
                                : sizeData.start}
                            </Text>
                          );
                        }
                        const startCm = Math.round(
                          parseFloat(sizeData.start) * 2.54
                        );
                        const endCm = sizeData.end
                          ? Math.round(parseFloat(sizeData.end) * 2.54)
                          : null;
                        return (
                          <Text key={s} style={styles.tableCell}>
                            {endCm ? `${startCm}-${endCm}` : startCm}
                          </Text>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionHeading>Garment Guide</SectionHeading>
            {[
              ["Bust / under arm", "Measured from underarm to underarm."],
              ["Bodice", "Measured from the top of the shoulder to the waist seam."],
              ["Length", "This is the full length of the dress from top to bottom."],
              ["Sleeve", "The length of the sleeve from shoulder to cuff."],
            ].map(([title, body], i) => (
              <View key={i} style={styles.guideRow}>
                <Text style={styles.guideNumber}>{i + 1}.</Text>
                <Text style={styles.bodyText}>
                  <Text style={styles.guideTitle}>{title}:</Text> {body}
                </Text>
              </View>
            ))}
          </View>

          {chartImages.length > 0 ? (
            <View style={styles.sizeChartImages}>
              {chartImages.map((image, idx) => (
                <View key={idx} style={styles.sizeChartImageWrapper}>
                  <Image
                    source={{ uri: image }}
                    style={styles.sizeChartImage}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionHeading>How To Measure</SectionHeading>
            {[
              ["Arm", "Measure from your shoulder bone to your wrist."],
              ["Bust", "Measure around the fullest part of your chest with your arms down."],
              ["Waist", "Measure around the narrowest point of your natural waistline."],
              ["Hips", "Measure around the widest part of your hip, normally 20/23cm from your waist."],
            ].map(([title, body], i) => (
              <View key={i} style={styles.guideRow}>
                <Text style={styles.guideNumber}>
                  {String.fromCharCode(97 + i)}.
                </Text>
                <Text style={styles.bodyText}>
                  <Text style={styles.guideTitle}>{title}:</Text> {body}
                </Text>
              </View>
            ))}
          </View>
        </SheetShell>
      </Pressable>
    </View>
  );
};

const stripHtml = (html: string) =>
  html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#F5F5F4",
    marginTop: 32,
  },

  triggerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
    color: "#44403C",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E5E4",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1917",
  },
  modalClose: {
    backgroundColor: "#F5F5F4",
    padding: 8,
    borderRadius: 999,
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 12,
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: "#E7E5E4",
    backgroundColor: "#FAFAF9",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  modalFooterText: {
    fontSize: 14,
    color: "#57534E",
  },
  modalFooterLink: {
    color: "#AE7857",
    textDecorationLine: "underline",
  },

  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#57534E",
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1917",
    marginBottom: 12,
  },
  section: {
    marginTop: 24,
  },

  link: {
    color: "#AE7857",
    fontWeight: "500",
    textDecorationLine: "underline",
  },

  card: {
    borderWidth: 1,
    borderColor: "#F5F5F4",
    backgroundColor: "#FAFAF9",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1917",
    marginBottom: 4,
  },

  linkCardsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  linkCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  linkCardTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1C1917",
    textAlign: "center",
  },
  linkCardSubtitle: {
    fontSize: 11,
    color: "#78716C",
    textAlign: "center",
  },

  unitCard: {
    borderWidth: 1,
    borderColor: "#F5F5F4",
    backgroundColor: "#FAFAF9",
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  unitLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#1C1917",
    marginBottom: 12,
  },
  unitRow: {
    flexDirection: "row",
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    backgroundColor: "#FFFFFF",
  },
  unitButtonActive: {
    backgroundColor: "#1C1917",
    borderColor: "#1C1917",
  },
  unitButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#57534E",
  },
  unitButtonTextActive: {
    color: "#FFFFFF",
  },

  tableWrapper: {
    borderWidth: 1,
    borderColor: "#F5F5F4",
    borderRadius: 6,
    overflow: "hidden",
    marginVertical: 16,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  tableRowAlt: {
    backgroundColor: "rgba(250,250,249,0.5)",
  },
  tableCell: {
    minWidth: 80,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    textAlign: "center",
    color: "#57534E",
    borderRightWidth: 1,
    borderRightColor: "#F5F5F4",
  },
  tableCellBold: {
    fontWeight: "600",
    color: "#1C1917",
    textAlign: "left",
  },
  tableHeaderCell: {
    fontWeight: "600",
    color: "#1C1917",
    backgroundColor: "#FAFAF9",
  },

  guideRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  guideNumber: {
    fontSize: 14,
    color: "#57534E",
    fontWeight: "500",
  },
  guideTitle: {
    color: "#1C1917",
    fontWeight: "500",
  },

  sizeChartImages: {
    gap: 16,
    marginVertical: 16,
  },
  sizeChartImageWrapper: {
    width: 200,
    height: 300,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F5F5F4",
    backgroundColor: "#FAFAF9",
  },
  sizeChartImage: {
    width: "100%",
    height: "100%",
  },
});

export default ProductInfoSheets;