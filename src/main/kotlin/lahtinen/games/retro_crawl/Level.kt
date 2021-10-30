package lahtinen.games.retro_crawl

import lahtinen.games.retro_crawl.events.PlayerLeveledUp
import org.greenrobot.eventbus.EventBus

class Level(
    private val characterAttributes: CharacterAttributes,
    private var level: Int = 1,
    private var experience: Int = 100
) {
    private val eventbus = EventBus.getDefault()

    fun addExperience(exp: Int) {
        experience += exp
        when {
            experience > 800 && level != 5 -> levelUp()
            experience > 400 && level != 4 -> levelUp()
            experience > 200 && level != 3 -> levelUp()
            experience > 100 && level != 2 -> levelUp()
        }
    }

    private fun levelUp() {
        level++
        characterAttributes.increaseVitality(level * 10)
        if (level % 3 == 0) {
            characterAttributes.increaseStrength(1)
            characterAttributes.increaseSpeed(1)
        }
        eventbus.post(PlayerLeveledUp(level, characterAttributes))
    }
}