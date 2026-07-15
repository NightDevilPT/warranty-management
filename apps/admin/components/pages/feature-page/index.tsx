"use client";

import { useEffect } from "react";

import { useFeatures } from "@/components/context/feature-context";
import type { FeatureStatus } from "@/lib/feature/types";

import { FeatureTree } from "./_components/feature-tree";

export function FeaturesPage() {
  const { featureTree, treeLoading, updateStatus, fetchTree } = useFeatures();

  useEffect(() => {
    fetchTree();
  }, []);

  const handleStatusChange = async (id: string, status: FeatureStatus) => {
    await updateStatus(id, { status });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Features</h1>
        <p className="text-sm text-muted-foreground">
          Manage platform features and their availability status
        </p>
      </div>

      <div className="rounded-lg bg-card">
        <FeatureTree
          tree={featureTree}
          loading={treeLoading}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
