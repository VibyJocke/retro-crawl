package lahtinen.games.retro_crawl.item

enum class Armor(
    override var type: InventoryType = InventoryType.ARMOR,
    override var displayableName: String,
    override var weight: Int,
    var armorType: ArmorType,
    var baseProtection: Int
) : InventoryManaged {
    BOOTS(
        displayableName = "Boots",
        armorType = ArmorType.TORSO,
        baseProtection = 1,
        weight = 4
    ),
    HELMET(
        displayableName = "Helmet",
        armorType = ArmorType.TORSO,
        baseProtection = 1,
        weight = 4
    ),
    CHAIN_MAIL(
        displayableName = "Chain mail",
        armorType = ArmorType.HEAD,
        baseProtection = 3,
        weight = 10
    ),
    PLATE_MAIL(
        displayableName = "Plate mail",
        armorType = ArmorType.HEAD,
        baseProtection = 5,
        weight = 15
    );

    var description: String? = null
    var minimumLevel = 0
    var condition = 0

    enum class ArmorType {
        HEAD, TORSO, ARMS, LEGS
    }
}
