import Link from "next/link";
import { categories, type NewsCategory } from "@/lib/news";

export function CategoryTabs({ active = "top" }: { active?: NewsCategory }) {
  return (
    <nav className="category-tabs" aria-label="News categories">
      {categories.map((category) => (
        <Link className={category.id === active ? "active" : ""} href={`#${category.id}`} key={category.id}>
          {category.label}
        </Link>
      ))}
    </nav>
  );
}
