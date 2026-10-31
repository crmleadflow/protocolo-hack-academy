import React, { useState, useMemo } from "react";
import { 
  DollarSign, TrendingUp, CreditCard, Receipt, 
  ArrowUpRight, ArrowDownRight, Calendar, Download,
  Search, Filter, ChevronDown
} from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UnifiedSidebar } from "@/components/layout/UnifiedSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { HolographicCard } from "@/components/ui/holographic-card";
import { StatCard } from "@/components/ui/stat-card";
import { useProducerRevenue, Transaction } from "@/hooks/useProducerRevenue";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))", "hsl(var(--chart-5))"];

const chartConfig = {
  revenue: {
    label: "Ingresos",
    color: "hsl(var(--accent))",
  },
  transactions: {
    label: "Transacciones",
    color: "hsl(var(--primary))",
  },
};

const ProducerRevenuePage: React.FC = () => {
  const { data: revenue, isLoading } = useProducerRevenue();
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (!revenue) return [];
    
    return revenue.allTransactions.filter(t => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        t.programTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.paypalOrderId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Program filter
      const matchesProgram = programFilter === "all" || t.programId === programFilter;
      
      // Date filter
      let matchesDate = true;
      if (dateFilter !== "all") {
        const transactionDate = new Date(t.createdAt);
        const now = new Date();
        if (dateFilter === "today") {
          matchesDate = format(transactionDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
        } else if (dateFilter === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= weekAgo;
        } else if (dateFilter === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= monthAgo;
        }
      }
      
      return matchesSearch && matchesProgram && matchesDate;
    });
  }, [revenue, searchTerm, programFilter, dateFilter]);

  // Get unique programs for filter
  const uniquePrograms = useMemo(() => {
    if (!revenue) return [];
    const programs = new Map<string, string>();
    revenue.allTransactions.forEach(t => {
      programs.set(t.programId, t.programTitle);
    });
    return Array.from(programs.entries());
  }, [revenue]);

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredTransactions.length) return;
    
    const headers = ["ID", "Fecha", "Programa", "Estudiante", "Monto", "Moneda", "PayPal Order ID"];
    const rows = filteredTransactions.map(t => [
      t.id,
      format(new Date(t.createdAt), "dd/MM/yyyy HH:mm"),
      t.programTitle,
      t.studentName,
      t.amount.toFixed(2),
      t.currency,
      t.paypalOrderId || "",
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ingresos_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <UnifiedSidebar />
          <FloatingSidebarTrigger />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              <Skeleton className="h-24 rounded-xl" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
              <Skeleton className="h-80" />
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const pieData = revenue?.revenueByProgram.slice(0, 5).map((p, index) => ({
    name: p.programTitle.length > 15 ? p.programTitle.substring(0, 15) + "..." : p.programTitle,
    value: p.totalRevenue,
    fill: COLORS[index % COLORS.length],
  })) || [];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <UnifiedSidebar />
        <FloatingSidebarTrigger />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-end mb-4">
              <Button onClick={exportToCSV} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar CSV
              </Button>
            </div>

            <div className="space-y-8">
            {/* Main Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Ingresos Totales"
                value={`$${(revenue?.totalRevenue || 0).toLocaleString()}`}
                subtitle="Todos los tiempos"
                icon={DollarSign}
                color="accent"
              />
              <StatCard
                title="Ingresos Este Mes"
                value={`$${(revenue?.revenueThisMonth || 0).toLocaleString()}`}
                subtitle={
                  revenue?.revenueGrowthMonth !== undefined
                    ? `${revenue.revenueGrowthMonth >= 0 ? "+" : ""}${revenue.revenueGrowthMonth}% vs mes anterior`
                    : undefined
                }
                icon={TrendingUp}
                color="primary"
                trend={revenue?.revenueGrowthMonth && revenue.revenueGrowthMonth >= 0 ? "up" : "down"}
              />
              <StatCard
                title="Transacciones"
                value={revenue?.totalTransactions.toLocaleString() || "0"}
                subtitle={`${revenue?.transactionsThisMonth || 0} este mes`}
                icon={CreditCard}
                color="secondary"
              />
              <StatCard
                title="Ticket Promedio"
                value={`$${(revenue?.averageTransactionValue || 0).toFixed(2)}`}
                subtitle="Por transacción"
                icon={Receipt}
                color="accent"
              />
            </div>

            {/* Period Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Últimos 30 Días"
                value={`$${(revenue?.revenueLast30Days || 0).toLocaleString()}`}
                subtitle={
                  revenue?.revenueGrowth30Days !== undefined
                    ? `${revenue.revenueGrowth30Days >= 0 ? "+" : ""}${revenue.revenueGrowth30Days}% vs período anterior`
                    : undefined
                }
                icon={Calendar}
                color="primary"
                trend={revenue?.revenueGrowth30Days && revenue.revenueGrowth30Days >= 0 ? "up" : "down"}
              />
              <StatCard
                title="Mes Anterior"
                value={`$${(revenue?.revenueLastMonth || 0).toLocaleString()}`}
                subtitle={`${revenue?.transactionsLastMonth || 0} transacciones`}
                icon={DollarSign}
                color="secondary"
              />
              <StatCard
                title="Transacciones/Mes"
                value={revenue?.transactionsThisMonth.toLocaleString() || "0"}
                subtitle={
                  revenue?.transactionGrowth !== undefined
                    ? `${revenue.transactionGrowth >= 0 ? "+" : ""}${revenue.transactionGrowth}% vs mes anterior`
                    : undefined
                }
                icon={CreditCard}
                color="primary"
                trend={revenue?.transactionGrowth && revenue.transactionGrowth >= 0 ? "up" : "down"}
              />
              <StatCard
                title="Programas Vendidos"
                value={revenue?.revenueByProgram.length.toLocaleString() || "0"}
                subtitle="Con ventas"
                icon={Receipt}
                color="accent"
              />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Daily Revenue Chart */}
              <HolographicCard variant="gradient">
                <div className="mb-4">
                  <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    Ingresos Diarios
                  </h3>
                  <p className="text-sm text-muted-foreground">Últimos 30 días</p>
                </div>
                <div className="h-64">
                  <ChartContainer config={chartConfig}>
                    <AreaChart data={revenue?.dailyRevenue || []}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--accent))"
                        fill="url(#revenueGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </HolographicCard>

              {/* Monthly Revenue Chart */}
              <HolographicCard variant="gradient">
                <div className="mb-4">
                  <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Ingresos Mensuales
                  </h3>
                  <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
                </div>
                <div className="h-64">
                  <ChartContainer config={chartConfig}>
                    <BarChart data={revenue?.monthlyRevenue || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="revenue" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </HolographicCard>
            </div>

            {/* Revenue by Program */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Pie Chart */}
              <HolographicCard variant="gradient">
                <div className="mb-4">
                  <h3 className="font-heading font-bold text-lg">Distribución por Programa</h3>
                  <p className="text-sm text-muted-foreground">Top 5 programas</p>
                </div>
                <div className="h-56">
                  {pieData.length > 0 ? (
                    <ChartContainer config={chartConfig}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Sin datos disponibles
                    </div>
                  )}
                </div>
              </HolographicCard>

              {/* Program Revenue Table */}
              <HolographicCard variant="gradient" className="lg:col-span-2">
                <div className="mb-4">
                  <h3 className="font-heading font-bold text-lg">Ingresos por Programa</h3>
                  <p className="text-sm text-muted-foreground">Desglose detallado</p>
                </div>
                <div className="overflow-x-auto max-h-56 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-background/80 backdrop-blur">
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Programa</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Ventas</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Ingresos</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">% Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenue?.revenueByProgram.map((program) => (
                        <tr key={program.programId} className="border-b border-border/30 hover:bg-white/5">
                          <td className="py-2 px-3">
                            <span className="text-sm font-medium truncate block max-w-[200px]">
                              {program.programTitle}
                            </span>
                          </td>
                          <td className="text-right py-2 px-3">
                            <span className="text-sm text-muted-foreground">{program.transactionCount}</span>
                          </td>
                          <td className="text-right py-2 px-3">
                            <span className="text-sm font-semibold text-accent">
                              ${program.totalRevenue.toLocaleString()}
                            </span>
                          </td>
                          <td className="text-right py-2 px-3">
                            <Badge variant="outline" className="text-xs">
                              {program.percentageOfTotal}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {(!revenue?.revenueByProgram || revenue.revenueByProgram.length === 0) && (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-muted-foreground text-sm">
                            No hay programas con ventas
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </HolographicCard>
            </div>

            {/* Growth Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <HolographicCard className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  {(revenue?.revenueGrowthMonth || 0) >= 0 ? (
                    <ArrowUpRight className="w-8 h-8 text-primary" />
                  ) : (
                    <ArrowDownRight className="w-8 h-8 text-destructive" />
                  )}
                  <span className={`text-4xl font-heading font-bold ${
                    (revenue?.revenueGrowthMonth || 0) >= 0 ? "text-primary" : "text-destructive"
                  }`}>
                    {revenue?.revenueGrowthMonth || 0}%
                  </span>
                </div>
                <p className="text-muted-foreground">Crecimiento de Ingresos (Mensual)</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${revenue?.revenueThisMonth?.toLocaleString() || 0} este mes vs ${revenue?.revenueLastMonth?.toLocaleString() || 0} mes anterior
                </p>
              </HolographicCard>

              <HolographicCard className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  {(revenue?.transactionGrowth || 0) >= 0 ? (
                    <ArrowUpRight className="w-8 h-8 text-primary" />
                  ) : (
                    <ArrowDownRight className="w-8 h-8 text-destructive" />
                  )}
                  <span className={`text-4xl font-heading font-bold ${
                    (revenue?.transactionGrowth || 0) >= 0 ? "text-primary" : "text-destructive"
                  }`}>
                    {revenue?.transactionGrowth || 0}%
                  </span>
                </div>
                <p className="text-muted-foreground">Crecimiento de Transacciones</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {revenue?.transactionsThisMonth || 0} este mes vs {revenue?.transactionsLastMonth || 0} mes anterior
                </p>
              </HolographicCard>
            </div>

            {/* Transactions Table */}
            <HolographicCard variant="gradient">
              <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-secondary" />
                    Historial de Transacciones
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {filteredTransactions.length} transacciones encontradas
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-48"
                    />
                  </div>
                  
                  <Select value={programFilter} onValueChange={setProgramFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Programa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {uniquePrograms.map(([id, title]) => (
                        <SelectItem key={id} value={id}>
                          {title.length > 20 ? title.substring(0, 20) + "..." : title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Fecha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo</SelectItem>
                      <SelectItem value="today">Hoy</SelectItem>
                      <SelectItem value="week">Esta semana</SelectItem>
                      <SelectItem value="month">Este mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Programa</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estudiante</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Monto</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">PayPal ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-border/30 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <span className="text-sm">
                            {format(new Date(transaction.createdAt), "dd MMM yyyy", { locale: es })}
                          </span>
                          <span className="text-xs text-muted-foreground block">
                            {format(new Date(transaction.createdAt), "HH:mm")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium truncate block max-w-[200px]">
                            {transaction.programTitle}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">{transaction.studentName}</span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className="text-sm font-semibold text-accent">
                            ${transaction.amount.toLocaleString()} {transaction.currency}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {transaction.paypalOrderId ? (
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {transaction.paypalOrderId.substring(0, 12)}...
                            </code>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-muted-foreground">
                          No hay transacciones para mostrar
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </HolographicCard>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProducerRevenuePage;
