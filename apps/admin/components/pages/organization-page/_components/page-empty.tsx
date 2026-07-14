import { Building2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

interface PageEmptyProps {
  onCreateNew: () => void;
}

export function PageEmpty({ onCreateNew }: PageEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Building2 className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No organizations found</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Get started by creating your first organization.
      </p>
      <Button onClick={onCreateNew}>
        <Building2 className="h-4 w-4 mr-2" />
        Create Organization
      </Button>
    </div>
  );
}
