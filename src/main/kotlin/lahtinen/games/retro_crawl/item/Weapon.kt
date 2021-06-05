package lahtinen.games.retro_crawl.item

enum class Weapon
    (
    override val displayableName: String,
    override var type: InventoryType = InventoryType.WEAPON,
    override var weight: Int,
    var base_damage: Int
    // var description: String
    // var minimum_level: int
    // var condition: int
) : InventoryManaged {
    FISTS(
        displayableName = "Fists",
        weight = 0,
        base_damage = 1
    ),
    KNIFE(
        displayableName = "Knife",
        weight = 1,
        base_damage = 2
    ),
    CLUB(
        displayableName = "Club",
        weight = 2,
        base_damage = 3
    ),
    SWORD(
        displayableName = "Sword",
        weight = 3,
        base_damage = 4
    );
}
