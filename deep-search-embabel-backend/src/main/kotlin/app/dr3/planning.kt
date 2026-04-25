package app.dr3

data class UserResearchRequest(val researchTopic: String)

data class WebSearchItem(val reason: String, val query: String)

data class WebSearchPlan(val searches: List<WebSearchItem>)