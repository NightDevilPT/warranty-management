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

import * as api from "@/lib/organization";
import type {
  Organization,
  OrganizationDetail,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  UpdateOrganizationStatusInput,
} from "@/lib/organization/types";

interface OrganizationsContextType {
  // List state
  items: Organization[];
  fetchLoading: boolean;
  actionLoading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  search: string;
  typeFilter: string;
  statusFilter: string;

  // Detail state
  selectedOrganization: OrganizationDetail | null;
  detailLoading: boolean;

  // List actions
  fetchItems: () => void;
  getItemById: (id: string) => Organization | undefined;

  // Detail actions
  getDetailById: (id: string) => Promise<OrganizationDetail | null>;
  fetchDetailById: (id: string) => Promise<void>;
  clearSelectedOrganization: () => void;

  // CRUD actions
  createItem: (data: CreateOrganizationInput) => Promise<boolean>;
  updateItem: (id: string, data: UpdateOrganizationInput) => Promise<boolean>;
  updateStatus: (
    id: string,
    data: UpdateOrganizationStatusInput,
  ) => Promise<boolean>;

  // Filter actions
  setSearch: (query: string) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTypeFilter: (type: string) => void;
  setStatusFilter: (status: string) => void;
}

const OrganizationsContext = createContext<OrganizationsContextType | null>(
  null,
);

export function OrganizationsProvider({ children }: { children: ReactNode }) {
  // ============ List State ============
  const [items, setItems] = useState<Organization[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearchState] = useState("");
  const [typeFilter, setTypeFilterState] = useState("");
  const [statusFilter, setStatusFilterState] = useState("");

  // ============ Detail State ============
  const [selectedOrganization, setSelectedOrganization] =
    useState<OrganizationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ============ Debounced List Fetch ============
  const debouncedFetchRef = useRef(
    debounce(
      async (params: {
        page: number;
        limit: number;
        search: string;
        typeFilter: string;
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
          if (params.typeFilter) filters.type = params.typeFilter;
          if (params.statusFilter) filters.status = params.statusFilter;

          const res = await api.getOrganizations(filters);

          if (res.success && res.data) {
            setItems(res.data);
            if (res.meta) {
              setTotal(res.meta.total || 0);
              setTotalPages(res.meta.totalPages || 0);
            }
          } else {
            toast.error(res.message || "Failed to load organizations");
          }
        } catch {
          toast.error(
            "An unexpected error occurred while loading organizations",
          );
        } finally {
          setFetchLoading(false);
        }
      },
      300,
    ),
  );

  // ============ List Actions ============
  const fetchItems = useCallback(() => {
    debouncedFetchRef.current({
      page,
      limit,
      search,
      typeFilter,
      statusFilter,
    });
  }, [page, limit, search, typeFilter, statusFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const getItemById = useCallback(
    (id: string): Organization | undefined => {
      return items.find((item) => item.id === id);
    },
    [items],
  );

  // ============ Detail Actions ============
  const getDetailById = useCallback(
    async (id: string): Promise<OrganizationDetail | null> => {
      try {
        const res = await api.getOrganization(id);
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

  const fetchDetailById = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await api.getOrganization(id);
      if (res.success && res.data) {
        setSelectedOrganization(res.data);
      } else {
        toast.error(res.message || "Failed to load organization details");
      }
    } catch {
      toast.error("Failed to load organization details");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const clearSelectedOrganization = useCallback(() => {
    setSelectedOrganization(null);
  }, []);

  // ============ Filter Actions ============
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

  const setTypeFilter = useCallback((type: string) => {
    setTypeFilterState(type);
    setPageState(1);
  }, []);

  const setStatusFilter = useCallback((status: string) => {
    setStatusFilterState(status);
    setPageState(1);
  }, []);

  // ============ CRUD Actions ============
  const createItem = async (
    data: CreateOrganizationInput,
  ): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await api.createOrganization(data);
      if (res.success) {
        toast.success("Organization created successfully");
        fetchItems();
        return true;
      }
      toast.error(res.message || "Failed to create organization");
      return false;
    } catch {
      toast.error("Failed to create organization");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const updateItem = async (
    id: string,
    data: UpdateOrganizationInput,
  ): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await api.updateOrganization(id, data);
      if (res.success) {
        toast.success("Organization updated successfully");
        fetchItems();
        return true;
      }
      toast.error(res.message || "Failed to update organization");
      return false;
    } catch {
      toast.error("Failed to update organization");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const updateStatus = async (
    id: string,
    data: UpdateOrganizationStatusInput,
  ): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await api.updateOrganizationStatus(id, data);
      if (res.success) {
        toast.success(
          res.data?.message || `Organization ${data.action}d successfully`,
        );
        fetchItems();
        return true;
      }
      toast.error(res.message || "Failed to update organization status");
      return false;
    } catch {
      toast.error("Failed to update organization status");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <OrganizationsContext.Provider
      value={{
        // List state
        items,
        fetchLoading,
        actionLoading,
        page,
        limit,
        total,
        totalPages,
        search,
        typeFilter,
        statusFilter,

        // Detail state
        selectedOrganization,
        detailLoading,

        // List actions
        fetchItems,
        getItemById,

        // Detail actions
        getDetailById,
        fetchDetailById,
        clearSelectedOrganization,

        // CRUD actions
        createItem,
        updateItem,
        updateStatus,

        // Filter actions
        setSearch,
        setPage,
        setLimit,
        setTypeFilter,
        setStatusFilter,
      }}
    >
      {children}
    </OrganizationsContext.Provider>
  );
}

export function useOrganizations() {
  const context = useContext(OrganizationsContext);
  if (!context) {
    throw new Error(
      "useOrganizations must be used within an OrganizationsProvider",
    );
  }
  return context;
}
