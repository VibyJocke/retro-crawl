package lahtinen.games.retro_crawl.item

import lahtinen.games.retro_crawl.Player

enum class Potion(
    override var type: InventoryType = InventoryType.POTION,
    override var displayableName: String,
    override var weight: Int,
    var effect: Effect,
    var effectivePoints: Int
) : InventoryManaged {
    WEAK_HEALTH_POTION(
        displayableName = "Weak health potion",
        effect = Effect.HEAL,
        effectivePoints = 5,
        weight = 1
    ),
    STRONG_HEALTH_POTION(
        displayableName = "Strong health potion",
        effect = Effect.HEAL,
        effectivePoints = 15,
        weight = 1
    ),
    WEAK_POISON(
        displayableName = "Weak poison potion",
        effect = Effect.DAMAGE,
        effectivePoints = 5,
        weight = 1
    );

    fun trigger(player: Player) {
        when (effect) {
            Effect.HEAL -> player.heal(effectivePoints)
            Effect.DAMAGE -> player.hurtGeneric(effectivePoints)
            Effect.INC_STRENGTH -> { }
            Effect.INC_SPEED -> { }
            Effect.INC_HEALTH -> { }
        }
    }

    enum class Effect {
        HEAL, DAMAGE, INC_STRENGTH, INC_SPEED, INC_HEALTH
    }
}
