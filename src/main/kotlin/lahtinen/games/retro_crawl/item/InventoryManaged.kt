package lahtinen.games.retro_crawl.item

interface InventoryManaged {
    val displayableName: String
    val type: InventoryType
    val weight: Int
}
