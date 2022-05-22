package lahtinen.games.retro_crawl

import lahtinen.games.retro_crawl.item.Armor
import lahtinen.games.retro_crawl.item.Weapon
import kotlin.math.max

class Player(val characterAttributes: CharacterAttributes) {
    private val level = Level(characterAttributes)
    private val health = Health(characterAttributes)
    private var equippedWeapon = Weapon.FISTS
    private val equippedArmor = mutableListOf<Armor>()
    private val inventory = Inventory(characterAttributes)

    //TODO add tick system for temporary effects

    fun givenDamage() = characterAttributes.strength * equippedWeapon.base_damage

    fun heal(healthPoints: Int) = health.restoreHealth(healthPoints)

    fun hurtGeneric(damage: Int) = health.drainHealth(damage)

    fun hurtCombat(damage: Int) = max(0, damage - equippedArmor.sumOf { a -> a.baseProtection }).also { health.drainHealth(it) }

    fun isDead() = health.dead()

    fun addExperience(xp: Int) {
        level.addExperience(xp)
    }

    fun equipWeapon(weapon: Weapon) {
        equippedWeapon = weapon
    }

    fun unequipWeapon() {
        equippedWeapon = Weapon.FISTS
    }

    fun equipArmor(armor: Armor) {
        equippedArmor.replaceAll { if (it.armorType == armor.armorType) armor else it }
    }

    fun unequipArmor(armor: Armor) {
        equippedArmor.remove(armor)
    }
}
