package lahtinen.games.retro_crawl.item

enum class Armor(
    override var type: InventoryType = InventoryType.ARMOR,
    override var displayableName: String,
    override var weight: Int,
    var armorType: ArmorType,
    var base_protection: Int
) : InventoryManaged {
    BOOTS(
        displayableName = "Boots",
        armorType = ArmorType.TORSO,
        base_protection = 1,
        weight = 4
    ),
    HELMET(
        displayableName = "Helmet",
        armorType = ArmorType.TORSO,
        base_protection = 1,
        weight = 4
    ),
    CHAIN_MAIL(
        displayableName = "Chain mail",
        armorType = ArmorType.HEAD,
        base_protection = 3,
        weight = 10
    ),
    PLATE_MAIL(
        displayableName = "Plate mail",
        armorType = ArmorType.HEAD,
        base_protection = 5,
        weight = 15
    );

    var description: String? = null
    var minimum_level = 0
    var condition = 0

    enum class ArmorType {
        HEAD, TORSO, ARMS, LEGS
    }
}
