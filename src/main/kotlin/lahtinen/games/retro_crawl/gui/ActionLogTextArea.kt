package lahtinen.games.retro_crawl.gui

import lahtinen.games.retro_crawl.events.MonsterDied
import lahtinen.games.retro_crawl.events.MonsterEncountered
import lahtinen.games.retro_crawl.events.MonsterHit
import lahtinen.games.retro_crawl.events.PlayerDied
import lahtinen.games.retro_crawl.events.PlayerEscaped
import lahtinen.games.retro_crawl.events.PlayerHit
import lahtinen.games.retro_crawl.events.PlayerLeveledUp
import lahtinen.games.retro_crawl.events.StoryExposition
import org.greenrobot.eventbus.EventBus
import org.greenrobot.eventbus.Subscribe
import javax.swing.JTextArea
import javax.swing.SwingUtilities

class ActionLogTextArea : JTextArea() {

    init {
        EventBus.getDefault().register(this)
        isEditable = false
        lineWrap = true
        wrapStyleWord = true
        columns = 30
        rows = 10
    }

    @Subscribe
    fun onLog(event: StoryExposition) = log(event.text)

    @Subscribe
    fun onLog(event: PlayerHit) {
        log("❤\uFE0F You got hit for ${event.damage} damage.")
    }

    @Subscribe
    fun onLog(event: MonsterHit) {
        log("\uD83D\uDDE1\uFE0F You hit for ${event.damage} damage.")
    }

    @Subscribe
    fun onLog(event: MonsterEncountered) = log("A wild ${event.monster.name} appears!")

    @Subscribe
    fun onLog(event: PlayerEscaped) =
        if (event.successful) log(" \uD83C\uDFC3 You escaped successfully!") else log("You failed to escape!")

    @Subscribe
    fun onLog(event: MonsterDied) = log("⚔\uFE0F You killed the ${event.monster.name}!")

    @Subscribe
    fun onLog(event: PlayerLeveledUp) = log("⬆\uFE0F Level up!")

    @Subscribe
    fun onLog(event: PlayerDied) = log("\uD83D\uDC80 You died...")

    private fun log(text: String) {
        SwingUtilities.invokeLater {
            insert("$text\n\n", 0)
        }
    }
}
