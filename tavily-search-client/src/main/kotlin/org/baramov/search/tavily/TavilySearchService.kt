package org.baramov.search.tavily

import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody

// @SuppressWarnings("kotlin:S6517")
interface TavilySearchService {

    @PostMapping("/search")
    fun search(@RequestBody query: SearchQuery): SearchResult

    @PostMapping("/search")
    fun quickSearch(@RequestBody query: QuickSearchQuery): SearchResult

    @PostMapping("/extract")
    fun extract(@RequestBody query: ExtractQuery): ExtractResult
}

