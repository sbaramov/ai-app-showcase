package app.domain

/**
 * Reference to a source document supporting the deep search result.
 *
 * @property title Title of the source
 * @property url URL of the source
 * @property relevance Relevance score (0.0-1.0)
 */
data class SourceReference(
    val title: String,
    val url: String,
    val relevance: Double
)
