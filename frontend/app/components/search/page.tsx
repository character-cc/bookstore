import { useSearchParams } from "react-router"
import SearchResultsPage from "~/components/search/search-results-page";

export default function SearchPage() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get("q") || ""

    return <SearchResultsPage searchQuery={query} />
}
