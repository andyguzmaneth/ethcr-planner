import { useState, useMemo } from "react";

interface SortableTask {
  id: string;
  title: string;
  status: string;
  deadline?: string | null;
  assignee?: {
    id: string;
    name: string;
    initials?: string;
  } | null;
  area?: {
    id: string;
    name: string;
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
}

interface UseTaskSortOptions<T extends SortableTask> {
  tasks: T[];
  statusLabels: Record<string, string>;
}

export function useTaskSort<T extends SortableTask>({ tasks, statusLabels }: UseTaskSortOptions<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedTasks = useMemo(() => {
    if (!sortColumn) return tasks;

    return [...tasks].sort((a, b) => {
      let aValue: string | number | null | undefined;
      let bValue: string | number | null | undefined;

      switch (sortColumn) {
        case "status":
          aValue = statusLabels[a.status] || "";
          bValue = statusLabels[b.status] || "";
          break;
        case "title":
          aValue = a.title || "";
          bValue = b.title || "";
          break;
        case "area":
          aValue = a.area?.name || "";
          bValue = b.area?.name || "";
          break;
        case "project":
          aValue = a.project?.name || "";
          bValue = b.project?.name || "";
          break;
        case "assignee":
          aValue = a.assignee?.name || "";
          bValue = b.assignee?.name || "";
          break;
        case "deadline":
          aValue = a.deadline ? new Date(a.deadline).getTime() : 0;
          bValue = b.deadline ? new Date(b.deadline).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [tasks, sortColumn, sortDirection, statusLabels]);

  return {
    sortedTasks: sortedTasks as T[],
    sortColumn,
    sortDirection,
    handleSort,
  };
}

