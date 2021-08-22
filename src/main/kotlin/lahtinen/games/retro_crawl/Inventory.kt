package lahtinen.games.retro_crawl

import lahtinen.games.retro_crawl.item.InventoryManaged


class Inventory(var weightLimit: Int) {
    private val inventory = mutableListOf<InventoryManaged>()

    fun putItem(item: InventoryManaged) {
        if (totalWeight() + item.weight < weightLimit) {
            inventory.add(item)
        }
    }

    private fun totalWeight(): Int {
        return inventory.sumOf { item -> item.weight }
    }
}