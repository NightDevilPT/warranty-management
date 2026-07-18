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

import * as api from "@/lib/brand";
import type {
  Brand,
  BrandDetail,
  CreateBrandInput,
  UpdateBrandInput,
} from "@/lib/brand/types";

interface BrandsContextType {
  items: Brand[];
  fetchLoading: boolean;
  actionLoading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  search: string;
  statusFilter: string;
  orgId: string;
  fetchItems: () => void;
  getItemById: (id: string) => Brand | undefined;
  getDetailById: (orgId: string, id: string) => Promise<BrandDetail | null>;
  createItem: (data: CreateBrandInput) => Promise<boolean>;
  updateItem: (id: string, data: UpdateBrandInput) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  updateStatus: (
    id: string,
    action: "activate" | "deactivate",
  ) => Promise<boolean>;
  setSearch: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setOrgId: (orgId: string) => void;
}

const BrandsContext = createContext<BrandsContextType | null>(null);

export function BrandsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Brand[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearchState] = useState("");
  const [statusFilter, setStatusFilterState] = useState("");
  const [orgId, setOrgIdState] = useState("");

  const debouncedFetchRef = useRef(
    debounce(
      async (params: {
        page: number;
        limit: number;
        search: string;
        statusFilter: string;
        orgId: string;
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
          if (params.orgId) filters.orgId = params.orgId;

          const res = await api.getBrands(filters);

          if (res.success && res.data) {
            setItems(res.data);
            if (res.meta) {
              setTotal(res.meta.total || 0);
              setTotalPages(res.meta.totalPages || 0);
            }
          } else {
            toast.error(res.message || "Failed to load brands");
          }
        } catch {
          toast.error("An unexpected error occurred");
        } finally {
          setFetchLoading(false);
        }
      },
      300,
    ),
  );

  const fetchItems = useCallback(() => {
    debouncedFetchRef.current({ page, limit, search, statusFilter, orgId });
  }, [page, limit, search, statusFilter, orgId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const getItemById = useCallback(
    (id: string): Brand | undefined => {
      return items.find((item) => item.id === id);
    },
    [items],
  );

  const getDetailById = useCallback(
    async (detailOrgId: string, id: string): Promise<BrandDetail | null> => {
      try {
        const res = await api.getBrand(detailOrgId, id);
        if (res.success && res.data) {
          return res.data;
        }
        return null;
      } catch {
        return null;
      }
    },
    [],
  );

  const setSearch = useCallback((query: string) => {
    setSearchState(query);
    setPageState(1);
  }, []);

  const setStatusFilter = useCallback((status: string) => {
    setStatusFilterState(status);
    setPageState(1);
  }, []);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPageState(1);
  }, []);

  const setOrgId = useCallback((newOrgId: string) => {
    setOrgIdState(newOrgId);
    setPageState(1);
  }, []);

  const createItem = async (data: CreateBrandInput): Promise<boolean> => {
    if (!orgId) {
      toast.error("Please select an organization first");
      return false;
    }
    setActionLoading(true);
    try {
      const res = await api.createBrand(orgId, data);
      if (res.success) {
        toast.success("Brand created successfully");
        fetchItems();
        return true;
      }
      toast.error(res.message || "Failed to create brand");
      return false;
    } catch {
      toast.error("Failed to execute action");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const updateItem = async (
    id: string,
    data: UpdateBrandInput,
  ): Promise<boolean> => {
    if (!orgId) {
      toast.error("Please select an organization first");
      return false;
    }
    setActionLoading(true);
    try {
      const res = await api.updateBrand(orgId, id, data);
      if (res.success) {
        toast.success("Brand updated successfully");
        fetchItems();
        return true;
      }
      toast.error(res.message || "Failed to update brand");
      return false;
    } catch {
      toast.error("Failed to execute action");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const deleteItem = async (id: string): Promise<boolean> => {
    if (!orgId) {
      toast.error("Please select an organization first");
      return false;
    }
    setActionLoading(true);
    try {
      const res = await api.deleteBrand(orgId, id);
      if (res.success) {
        toast.success("Brand deleted successfully");
        fetchItems();
        return true;
      }
      toast.error(res.message || "Failed to delete brand");
      return false;
    } catch {
      toast.error("Failed to execute action");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const updateStatus = async (
    id: string,
    action: "activate" | "deactivate",
  ): Promise<boolean> => {
    if (!orgId) {
      toast.error("Please select an organization first");
      return false;
    }
    setActionLoading(true);
    try {
      const res = await api.updateBrand(orgId, id, {
        isActive: action === "activate",
      });
      if (res.success) {
        toast.success(
          action === "activate" ? "Brand activated" : "Brand deactivated",
        );
        fetchItems();
        return true;
      }
      toast.error(res.message || "Failed to update status");
      return false;
    } catch {
      toast.error("Failed to execute action");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <BrandsContext.Provider
      value={{
        items,
        fetchLoading,
        actionLoading,
        page,
        limit,
        total,
        totalPages,
        search,
        statusFilter,
        orgId,
        fetchItems,
        getItemById,
        getDetailById,
        createItem,
        updateItem,
        deleteItem,
        updateStatus,
        setSearch,
        setStatusFilter,
        setPage,
        setLimit,
        setOrgId,
      }}
    >
      {children}
    </BrandsContext.Provider>
  );
}

export function useBrands() {
  const context = useContext(BrandsContext);
  if (!context)
    throw new Error("useBrands must be used within a BrandsProvider");
  return context;
}
