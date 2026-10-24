import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import DisplayProductsWithFilters from "@/components/comps/display-products-with-filters";
import { apiClient } from "@/lib/api/client";
import { Product } from "@/lib/api/products";
import Topbar from "@/components/comps/topbar";
import HeaderBar from "@/components/comps/header-bar";

const DRESS_CATEGORIES = [
    { title: "Mini", value: "mini" },
    { title: "Midi", value: "midi" },
    { title: "Maxi", value: "maxi" },
];

export default function SearchScreen() {
    const { q } = useLocalSearchParams();
    const query = (q as string) || "";

    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchResults = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                params.set("q", query);
                if (activeCategory) params.set("category", activeCategory);
                Object.entries(activeFilters).forEach(([k, v]) => {
                    if (v) params.set(k, v);
                });

                const res = await apiClient.get(`/api/search-suggestions?${params.toString()}`);
                if (res.data) {
                    setProducts(res.data.products || []);
                    setTotal(res.data.total || 0);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchResults();
    }, [query, activeCategory, activeFilters]);

    const handleFilterChange = (type: string, value: string) => {
        setActiveFilters((prev) => {
            const next = { ...prev };
            if (!value || next[type] === value) {
                delete next[type];
            } else {
                next[type] = value;
            }
            return next;
        });
    };

    const handleClearFilters = () => {
        setActiveFilters({});
        setActiveCategory(null);
    };

    return (
        <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <Topbar />
            <HeaderBar />
            <DisplayProductsWithFilters
                title={`Search Results For "${query}"`}
                query={query}
                products={products}
                isLoading={isLoading}
                totalItems={total}
                dressCategoryOptions={DRESS_CATEGORIES}
                activeCategory={activeCategory}
                onCategoryChange={(val) => setActiveCategory(prev => prev === val ? null : val)}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
            />
        </SafeAreaView>
    );
}