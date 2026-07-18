import { Tag } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

interface PageEmptyProps {
  onCreateNew: () => void;
}

export function PageEmpty({ onCreateNew }: PageEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Tag className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No brands found</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Get started by adding your first brand to this organization.
      </p>
      <Button onClick={onCreateNew}>
        <Tag className="h-4 w-4 mr-2" />
        Add Brand
      </Button>
    </div>
  );
}
