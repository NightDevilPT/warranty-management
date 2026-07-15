import React from "react";

const page = async ({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) => {
  const { organizationId } = await params;
  return <div>page{organizationId}</div>;
};

export default page;
