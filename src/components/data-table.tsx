import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hint } from "@/components/ui/hint";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis, PaginationFirst, PaginationLast } from "@/components/ui/pagination";
import { Search, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect, type ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T extends { id: string }> {
  data: T[] | undefined;
  columns: Column<T>[];
  loading?: boolean;
  searchKeys?: (keyof T)[];
  emptyMessage?: string;
  toolbar?: ReactNode;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading,
  searchKeys,
  emptyMessage,
  toolbar,
}: DataTableProps<T>) {
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Reset to first page when search query changes
  useEffect(() => {
    setPageIndex(0);
  }, [q]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!q.trim() || !searchKeys?.length) return data;
    const lower = q.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((k) => {
        const v = row[k];
        return v != null && String(v).toLowerCase().includes(lower);
      }),
    );
  }, [data, q, searchKeys]);

  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [filtered, pageIndex, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const hasData = filtered.length > 0;

  return (
    <Card className="shadow-sm border rounded-xl overflow-hidden bg-card">
      <div className="p-4 border-b flex items-center gap-4 flex-wrap bg-muted/20">
        {searchKeys && searchKeys.length > 0 && (
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search")}
              className="pl-8 h-9"
            />
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">{toolbar}</div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50 border-b">
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key} className={c.className}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-row-${i}`} className="hover:bg-transparent">
                  {columns.map((c, j) => (
                    <TableCell key={`skeleton-col-${j}`} className={c.className}>
                      <Skeleton className="h-6 w-full max-w-[80%] rounded-md" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-10">
                  <Inbox className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">{emptyMessage ?? t("no_data")}</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50 transition-colors">
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {c.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10">
        <div className="flex-1 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">{lang === "bn" ? "প্রতি পৃষ্ঠায়:" : "Rows per page:"}</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPageIndex(0);
              }}
              disabled={!hasData}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="hidden sm:block">
            {hasData ? (
              <>
                {lang === "bn" ? "দেখাচ্ছে" : "Showing"} {pageIndex * pageSize + 1} {lang === "bn" ? "থেকে" : "to"}{" "}
                {Math.min((pageIndex + 1) * pageSize, filtered.length)} {lang === "bn" ? "মোট" : "of"} {filtered.length} {lang === "bn" ? "টি" : "entries"}
              </>
            ) : (
              lang === "bn" ? "কোনো ডাটা নেই" : "No entries found"
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Pagination className="mx-0 justify-end w-auto">
            <PaginationContent>
              <PaginationItem>
                <Hint label={lang === "bn" ? "প্রথম পাতা" : "First Page"} side="top">
                  <PaginationFirst
                    onClick={() => setPageIndex(0)}
                    disabled={!hasData || pageIndex === 0}
                  />
                </Hint>
              </PaginationItem>
              <PaginationItem>
                <Hint label={lang === "bn" ? "পূর্ববর্তী পাতা" : "Previous Page"} side="top">
                  <PaginationPrevious
                    onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                    disabled={!hasData || pageIndex === 0}
                  />
                </Hint>
              </PaginationItem>
              
              <div className="hidden md:flex flex-row items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  if (i === 0 || i === totalPages - 1 || (i >= pageIndex - 1 && i <= pageIndex + 1)) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={pageIndex === i}
                          onClick={() => setPageIndex(i)}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  if (i === pageIndex - 2 || i === pageIndex + 2) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
              </div>

              <div className="text-sm font-medium mx-2 md:hidden flex items-center">
                {pageIndex + 1} / {Math.max(1, totalPages)}
              </div>

              <PaginationItem>
                <Hint label={lang === "bn" ? "পরবর্তী পাতা" : "Next Page"} side="top">
                  <PaginationNext
                    onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={!hasData || pageIndex >= totalPages - 1}
                  />
                </Hint>
              </PaginationItem>
              <PaginationItem>
                <Hint label={lang === "bn" ? "শেষ পাতা" : "Last Page"} side="top">
                  <PaginationLast
                    onClick={() => setPageIndex(totalPages - 1)}
                    disabled={!hasData || pageIndex >= totalPages - 1}
                  />
                </Hint>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </Card>
  );
}
