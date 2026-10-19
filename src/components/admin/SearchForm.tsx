import Form from "next/form";
import { Search } from "lucide-react";

type Props = {
  action: string;
  defaultValue?: string;
  placeholder?: string;
  /** Other filters to keep when searching (page is intentionally reset). */
  hidden?: Record<string, string | undefined>;
  children?: React.ReactNode;
};

export function SearchForm({ action, defaultValue, placeholder = "Search…", hidden = {}, children }: Props) {
  return (
    <Form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {Object.entries(hidden).map(([key, value]) => (value ? <input key={key} type="hidden" name={key} value={value} /> : null))}
      <label className="relative block flex-1">
        <span className="sr-only">Search</span>
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="input h-11 pl-10"
        />
      </label>
      {children}
      <button type="submit" className="btn btn-primary btn-sm h-11">
        Search
      </button>
    </Form>
  );
}
