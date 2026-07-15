"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { toast } from "sonner";

import { debounce } from "@workspace/ui/lib/utils";

import * as api from "@/lib/feature";
import type {
  Feature,
  FeatureDetail,
  FeatureTreeItem,
  CreateFeatureInput,
  UpdateFeatureInput,
  UpdateFeatureStatusInput,
} from "@/lib/feature/types";

interface FeaturesContextType {
  items: Feature[];
  featureTree: FeatureTreeItem[];
  selectedFeature: FeatureDetail | null;
  fetchLoading: boolean;
  actionLoading: boolean;
  detailLoading: boolean;
  treeLoading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  search: string;
  statusFilter: string;
  fetchItems: () => void;
  fetchTree: () => Promise<void>;
  fetchDetail: (id: string) => Promise<void>;
  createItem: (data: CreateFeatureInput) => Promise<boolean>;
  updateItem: (id: string, data: UpdateFeatureInput) => Promise<boolean>;
  updateStatus: (
    id: string,
    data: UpdateFeatureStatusInput,
  ) => Promise<boolean>;
  setSearch: (query: string) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setStatusFilter: (status: string) => void;
  clearSelectedFeature: () => void;
}

const FeaturesContext = createContext<FeaturesContextType | null>(null);

export function FeaturesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Feature[]>([]);
  const [featureTree, setFeatureTree] = useState<FeatureTreeItem[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<FeatureDetail | null>(
    null,
  );
  const [fetchLoading, setFetchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [treeLoading, setTreeLoading] = useState(false);
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearchState] = useState("");
  const [statusFilter, setStatusFilterState] = useState("");

  const debouncedFetchRef = useRef(
    debounce(
      async (params: {
        page: number;
        limit: number;
        search: string;
        statusFilter: string;
      }) => {
        setFetchLoading(true);
        try {
          const filters: Record<string, string | number | boolean | undefined> =
            {
              page: params.page,
              limit: params.limit,
            };

          if (params.search) filters.search = params.search;
          if (params.statusFilter) filters.status = params.statusFilter;

          const res = await api.getFeatures(filters);

          if (res.success && res.data) {
            setItems(res.data);
            if (res.meta) {
              setTotal(res.meta.total || 0);
              setTotalPages(res.meta.totalPages || 0);
            }
          } else {
            toast.error(res.message || "Failed to load features");
          }
        } catch {
          toast.error("An unexpected error occurred while loading features");
        } finally {
          setFetchLoading(false);
        }
      },
      300,
    ),
  );

  const fetchItems = useCallback(() => {
    debouncedFetchRef.current({ page, limit, search, statusFilter });
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const fetchTree = useCallback(async () => {
    setTreeLoading(true);
    try {
      const res = await api.getFeatureTree();
      if (res.success && res.data) {
        setFeatureTree(res.data);
      } else {
        toast.error(res.message || "Failed to load feature tree");
      }
    } catch {
      toast.error("Failed to load feature tree");
    } finally {
      setTreeLoading(false);
    }
  }, []);

  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await api.getFeature(id);
      if (res.success && res.data) {
        setSelectedFeature(res.data);
      } else {
        toast.error(res.message || "Failed to load feature details");
      }
    } catch {
      toast.error("Failed to load feature details");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const clearSelectedFeature = useCallback(() => {
    setSelectedFeature(null);
  }, []);

  const setSearch = useCallback((query: string) => {
    setSearchState(query);
    setPageState(1);
  }, []);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPageState(1);
  }, []);

  const setStatusFilter = useCallback((status: string) => {
    setStatusFilterState(status);
    setPageState(1);
  }, []);

  const createItem = async (data: CreateFeatureInput): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await api.createFeature(data);
      if (res.success) {
        toast.success("Feature created successfully");
        fetchItems();
        fetchTree();
        return true;
      }
      toast.error(res.message || "Failed to create feature");
      return false;
    } catch {
      toast.error("Failed to create feature");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const updateItem = async (
    id: string,
    data: UpdateFeatureInput,
  ): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await api.updateFeature(id, data);
      if (res.success) {
        toast.success("Feature updated successfully");
        fetchItems();
        fetchTree();
        return true;
      }
      toast.error(res.message || "Failed to update feature");
      return false;
    } catch {
      toast.error("Failed to update feature");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const updateStatus = async (
    id: string,
    data: UpdateFeatureStatusInput,
  ): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await api.updateFeatureStatus(id, data);
      if (res.success) {
        const parentNode = featureTree.find((item) => item.id === id);
        if (
          parentNode &&
          (data.status === "DISABLED" || data.status === "COMING_SOON")
        ) {
          const childIds = parentNode.children.map((c) => c.id);
          await Promise.all(
            childIds.map((childId) =>
              api.updateFeatureStatus(childId, { status: data.status }),
            ),
          );
        }

        toast.success(`Feature status updated to ${data.status}`);
        fetchItems();
        fetchTree();
        return true;
      }
      toast.error(res.message || "Failed to update feature status");
      return false;
    } catch {
      toast.error("Failed to update feature status");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <FeaturesContext.Provider
      value={{
        items,
        featureTree,
        selectedFeature,
        fetchLoading,
        actionLoading,
        detailLoading,
        treeLoading,
        page,
        limit,
        total,
        totalPages,
        search,
        statusFilter,
        fetchItems,
        fetchTree,
        fetchDetail,
        createItem,
        updateItem,
        updateStatus,
        setSearch,
        setPage,
        setLimit,
        setStatusFilter,
        clearSelectedFeature,
      }}
    >
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeatures() {
  const context = useContext(FeaturesContext);
  if (!context) {
    throw new Error("useFeatures must be used within a FeaturesProvider");
  }
  return context;
}
