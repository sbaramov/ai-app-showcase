package app.dr3

data class SearchSummary(val title: String, val summary: String)

data class SearchSummaryList(val results: List<SearchSummary>)