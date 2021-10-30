package lahtinen.games.retro_crawl

import lahtinen.games.retro_crawl.item.InventoryManaged


class Inventory(private val characterAttributes: CharacterAttributes) {
    private val inventory = mutableListOf<InventoryManaged>()

    fun putItem(item: InventoryManaged) {
        if (totalWeight() + item.weight < weightLimit()) {
            inventory.add(item)
        }
    }

    private fun weightLimit() = characterAttributes.strength * 2

    private fun totalWeight() = inventory.sumOf { item -> item.weight }
}