package org.baramov.search.tavily

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/**
 * Extract result from Tavily.
 *
 * Contains extracted content from specified URLs along with any failed extraction attempts.
 *
 * @property results A list of successfully extracted content from the provided URLs
 * @property failedResults A list of URLs that could not be processed
 * @property responseTime Time in seconds it took to complete the request
 * @property usage Credit usage details for the request (only if include_usage was true)
 * @property requestId A unique request identifier you can share with customer support
 */
@JsonIgnoreProperties(ignoreUnknown = true)
data class ExtractResult(
    val results: List<ExtractedContent>,
    val failedResults: List<FailedExtraction>,
    val responseTime: Float,
    val usage: Usage?,
    val requestId: String
)

/**
 * Successfully extracted content from a URL.
 *
 * @property url The URL from which the content was extracted
 * @property rawContent The full content extracted from the page. When query was provided,
 *                      contains the top-ranked chunks joined by "[...]" separator
 * @property images List of image URLs extracted from the page (only if include_images was true)
 * @property favicon The favicon URL for the result (only if include_favicon was true)
 */
data class ExtractedContent(
    val url: String,
    val rawContent: String,
    val images: List<String> = emptyList(),
    val favicon: String? = null
)

/**
 * Information about a URL that failed to be extracted.
 *
 * @property url The URL that failed to be processed
 * @property error An error message describing why the URL couldn't be processed
 */
data class FailedExtraction(
    val url: String,
    val error: String
)
