import CategoryList from "@/components/CategoryList";
import ListingHeading from "@/components/ListingHeading";

export const metadata = {
  title: "Categories – HAK Store",
};

export default function CategoriesPage() {
  return (
    <div className="container-page py-16">
      <ListingHeading page="categories" />
      <CategoryList />
    </div>
  );
}
