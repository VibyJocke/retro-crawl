package lahtinen.games.retro_crawl

import lahtinen.games.retro_crawl.item.Armor
import lahtinen.games.retro_crawl.item.Weapon
import kotlin.math.min

class Player(val characterAttributes: CharacterAttributes) {

    private val health = Health(characterAttributes.maxHealth)
    private var level = 1
    private var experience = 100
    private var protection = 0
    private var equipped_weapon = Weapon.FISTS
    private val equipped_armor = mutableListOf<Armor>()

    val inventory = Inventory(characterAttributes.strength * 2)

    //TODO add tick system for temporary effects

    fun givenDamage(): Int = characterAttributes.strength * equipped_weapon.base_damage

    fun heal(healthPoints: Int) = health.restoreHealth(healthPoints)

    fun hurtGeneric(damage: Int) = health.drainHealth(damage)

    fun hurtCombat(damage: Int): Int {
        val healthToDrain =
            min(0, damage - protection - equipped_armor.sumOf { a -> a.base_protection })
        health.drainHealth(healthToDrain)
        return healthToDrain
    }

    fun isDead(): Boolean = health.dead()

    fun addExperience(exp: Int) {
        experience += exp
        if (experience > 2000 && level != 5) levelUp() else if (experience > 1000 && level != 4) levelUp() else if (experience > 500 && level != 3) levelUp() else if (experience > 100 && level != 2) levelUp()
    }

    private fun levelUp() {
        level++
        characterAttributes.increaseMaxHealth(level * 2)
        if (level % 3 == 0) {
            characterAttributes.increaseStrength(1)
            characterAttributes.increaseSpeed(1)
        }
        if (level % 5 == 0) {
            protection++
        }
        println("Level up!")
    }

    fun unequip_weapon() {
        equipped_weapon = Weapon.FISTS
    }
}
