package app.domain

/**
 * Aggregated result from a deep search operation.
 *
 * @property query The original search query
 * @property summary LLM-synthesized answer
 * @property sources Supporting source references
 * @property iterations Number of refinement cycles performed
 * @property confidence Confidence score (0.0-1.0)
 */
data class DeepSearchResult(
    val query: String,
    val summary: String,
    val sources: List<SourceReference>,
    val iterations: Int,
    val confidence: Double
)
