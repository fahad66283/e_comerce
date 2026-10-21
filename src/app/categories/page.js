import CategoryList from "@/components/CategoryList";

export const metadata = {
  title: "Categories – HAK Store",
};

export default function CategoriesPage() {
  return (
    <div className="container-page py-16">
      <div className="mb-8 max-w-[600px]">
        <span className="eyebrow">Categories</span>
        <h1 className="section-title">Shop by category</h1>
        <p className="section-sub">Pick a category to explore everything we have in it.</p>
      </div>
      <CategoryList />
    </div>
  );
}
