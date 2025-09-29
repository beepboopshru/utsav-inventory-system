import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

type DashboardContentProps = {
  activeSection: string;
};

function Loading() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
        <span>Loading...</span>
      </div>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="px-6 py-5 border-b flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="elevation-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function Overview() {
  const kits = useQuery(api.kits.getAllKits);
  const raw = useQuery(api.inventory.getAllRawMaterials);
  const pre = useQuery(api.inventory.getAllPreprocessedGoods);
  const clients = useQuery(api.clients.getAllClients);
  const assignments = useQuery(api.assignments.getAllAssignments);

  if (
    kits === undefined ||
    raw === undefined ||
    pre === undefined ||
    clients === undefined ||
    assignments === undefined
  ) {
    return <Loading />;
  }

  const totalStock =
    (kits?.reduce((sum, k) => sum + (k.stockLevel ?? 0), 0) ?? 0) +
    (raw?.reduce((sum, r) => sum + (r.stockLevel ?? 0), 0) ?? 0) +
    (pre?.reduce((sum, p) => sum + (p.stockLevel ?? 0), 0) ?? 0);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Kits" value={kits?.length ?? 0} />
        <MetricCard label="Clients" value={clients?.length ?? 0} />
        <MetricCard label="Assignments" value={assignments?.length ?? 0} />
      </div>

      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard label="Raw Materials" value={raw?.length ?? 0} />
            <MetricCard label="Pre-processed Goods" value={pre?.length ?? 0} />
            <MetricCard label="Total Stock Units (approx.)" value={totalStock} />
          </div>
        </CardContent>
      </Card>

      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base">Recent Assignments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Kit</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(assignments ?? []).slice(0, 5).map((a) => (
                <TableRow key={a._id}>
                  <TableCell className="truncate">{(a as any).client?.name ?? "—"}</TableCell>
                  <TableCell className="truncate">{(a as any).kit?.name ?? "—"}</TableCell>
                  <TableCell>{a.quantity}</TableCell>
                  <TableCell>{a.deliveryDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        a.status === "pending" && "bg-yellow-100 text-yellow-700",
                        a.status === "delivered" && "bg-green-100 text-green-700",
                        a.status === "cancelled" && "bg-red-100 text-red-700"
                      )}
                    >
                      {a.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(assignments ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No assignments yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function KitsByProgram({ program }: { program: "robotics" | "cstem" }) {
  const kits = useQuery(api.kits.getKitsByProgram, { program });

  if (kits === undefined) return <Loading />;

  return (
    <div className="p-6">
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base capitalize">{program} Kits</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Serial</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(kits ?? []).map((k) => (
                <TableRow key={k._id}>
                  <TableCell className="font-medium">{k.name}</TableCell>
                  <TableCell>{k.serialNumber}</TableCell>
                  <TableCell>{k.stockLevel}</TableCell>
                  <TableCell>{k.gradeLevel ?? "—"}</TableCell>
                </TableRow>
              ))}
              {(kits ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No kits found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function RawMaterials() {
  const raw = useQuery(api.inventory.getAllRawMaterials);

  if (raw === undefined) return <Loading />;

  return (
    <div className="p-6">
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base">Raw Materials</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(raw ?? []).map((r) => (
                <TableRow key={r._id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.category}</TableCell>
                  <TableCell>{r.stockLevel}</TableCell>
                  <TableCell>{r.unit}</TableCell>
                </TableRow>
              ))}
              {(raw ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No raw materials found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function PreprocessedGoods() {
  const pre = useQuery(api.inventory.getAllPreprocessedGoods);

  if (pre === undefined) return <Loading />;

  return (
    <div className="p-6">
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base">Pre-processed Goods</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(pre ?? []).map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.stockLevel}</TableCell>
                  <TableCell>{p.unit}</TableCell>
                </TableRow>
              ))}
              {(pre ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No pre-processed goods found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function FinishedGoods() {
  // Treat kits with stock > 0 as "finished goods" available for assignment
  const kits = useQuery(api.kits.getAllKits);
  const available = useMemo(() => (kits ?? []).filter((k) => (k.stockLevel ?? 0) > 0), [kits]);

  if (kits === undefined) return <Loading />;

  return (
    <div className="p-6">
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base">Finished Goods (Available Kits)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Serial</TableHead>
                <TableHead>Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {available.map((k) => (
                <TableRow key={k._id}>
                  <TableCell className="font-medium">{k.name}</TableCell>
                  <TableCell className="capitalize">{k.program}</TableCell>
                  <TableCell>{k.serialNumber}</TableCell>
                  <TableCell>{k.stockLevel}</TableCell>
                </TableRow>
              ))}
              {available.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No finished goods available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Clients() {
  const clients = useQuery(api.clients.getAllClients);
  if (clients === undefined) return <Loading />;

  return (
    <div className="p-6">
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base">Clients</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(clients ?? []).map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.contactPerson}</TableCell>
                  <TableCell>{c.email ?? "—"}</TableCell>
                  <TableCell>{c.phone ?? "—"}</TableCell>
                </TableRow>
              ))}
              {(clients ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No clients found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Assignments() {
  const assignments = useQuery(api.assignments.getAllAssignments);
  if (assignments === undefined) return <Loading />;

  return (
    <div className="p-6">
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-base">Kit Assignments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Kit</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(assignments ?? []).map((a) => (
                <TableRow key={a._id}>
                  <TableCell className="truncate">{(a as any).client?.name ?? "—"}</TableCell>
                  <TableCell className="truncate">{(a as any).kit?.name ?? "—"}</TableCell>
                  <TableCell>{a.quantity}</TableCell>
                  <TableCell>{a.deliveryDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        a.status === "pending" && "bg-yellow-100 text-yellow-700",
                        a.status === "delivered" && "bg-green-100 text-green-700",
                        a.status === "cancelled" && "bg-red-100 text-red-700"
                      )}
                    >
                      {a.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(assignments ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No assignments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardContent({ activeSection }: DashboardContentProps) {
  const title = useMemo(() => {
    switch (activeSection) {
      case "overview":
        return "Overview";
      case "kits-robotics":
        return "Kits • Robotics";
      case "kits-cstem":
        return "Kits • CSTEM";
      case "inventory-raw":
        return "Inventory • Raw Materials";
      case "inventory-preprocessed":
        return "Inventory • Pre-processed Goods";
      case "inventory-finished":
        return "Inventory • Finished Goods";
      case "clients":
        return "Client Management";
      case "assignments":
        return "Kit Assignments";
      case "settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  }, [activeSection]);

  return (
    <motion.div
      key={activeSection}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full h-full flex flex-col"
    >
      <SectionHeader title={title} />
      {activeSection === "overview" && <Overview />}

      {activeSection === "kits-robotics" && <KitsByProgram program={"robotics"} />}
      {activeSection === "kits-cstem" && <KitsByProgram program={"cstem"} />}

      {activeSection === "inventory-raw" && <RawMaterials />}
      {activeSection === "inventory-preprocessed" && <PreprocessedGoods />}
      {activeSection === "inventory-finished" && <FinishedGoods />}

      {activeSection === "clients" && <Clients />}
      {activeSection === "assignments" && <Assignments />}

      {activeSection === "settings" && (
        <div className="p-6">
          <Card className="elevation-1">
            <CardHeader>
              <CardTitle className="text-base">Settings</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Settings panel coming next. Core dashboards are available now.
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
