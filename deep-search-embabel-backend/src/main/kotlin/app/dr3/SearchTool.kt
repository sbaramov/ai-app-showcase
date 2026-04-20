package app.dr3

/** Marker interface for search tools. */
@SuppressWarnings("kotlin:S6517"/* not a functional interface */)
interface SearchTool {
    fun getId(): String
}